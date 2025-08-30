import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { USDAFoodDto, USDASearchResultDto, USDASearchCriteriaDto } from '../dto/usda.dto';

export interface USDAClientConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  rateLimit: {
    maxRequests: number;
    windowMs: number;
  };
}

@Injectable()
export class USDAApiClient {
  private readonly logger = new Logger(USDAApiClient.name);
  private readonly httpClient: AxiosInstance;
  private readonly config: USDAClientConfig;
  private requestCount = 0;
  private windowStart = Date.now();

  constructor(private readonly configService: ConfigService) {
    this.config = this.getClientConfig();
    this.httpClient = this.createHttpClient();
  }

  private getClientConfig(): USDAClientConfig {
    return {
      apiKey: this.configService.get<string>('USDA_API_KEY') || 'DEMO_KEY',
      baseUrl: this.configService.get<string>('USDA_BASE_URL') || 'https://api.nal.usda.gov/fdc/v1',
      timeout: this.configService.get<number>('USDA_TIMEOUT') || 30000,
      maxRetries: this.configService.get<number>('USDA_MAX_RETRIES') || 3,
      retryDelay: this.configService.get<number>('USDA_RETRY_DELAY') || 1000,
      rateLimit: {
        maxRequests: this.configService.get<number>('USDA_RATE_LIMIT_REQUESTS') || 100,
        windowMs: this.configService.get<number>('USDA_RATE_LIMIT_WINDOW') || 60000, // 1 minute
      },
    };
  }

  private createHttpClient(): AxiosInstance {
    const client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'HealthCoachAI/1.0',
      },
    });

    // Request interceptor for logging and rate limiting
    client.interceptors.request.use(
      async (config) => {
        await this.checkRateLimit();

        this.logger.debug(`USDA API Request: ${config.method?.toUpperCase()} ${config.url}`);

        // Add API key to params
        config.params = {
          ...config.params,
          api_key: this.config.apiKey,
        };

        return config;
      },
      (error) => {
        this.logger.error('USDA API Request Error:', error);
        return Promise.reject(error);
      },
    );

    // Response interceptor for logging and error handling
    client.interceptors.response.use(
      (response) => {
        this.logger.debug(`USDA API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        this.logger.error(
          `USDA API Error: ${error.response?.status} ${error.config?.url}`,
          error.message,
        );
        return Promise.reject(this.transformError(error));
      },
    );

    return client;
  }

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();

    // Reset window if expired
    if (now - this.windowStart >= this.config.rateLimit.windowMs) {
      this.requestCount = 0;
      this.windowStart = now;
    }

    // Check if rate limit exceeded
    if (this.requestCount >= this.config.rateLimit.maxRequests) {
      const waitTime = this.config.rateLimit.windowMs - (now - this.windowStart);
      this.logger.warn(`USDA API rate limit exceeded. Waiting ${waitTime}ms`);
      await this.sleep(waitTime);
      this.requestCount = 0;
      this.windowStart = Date.now();
    }

    this.requestCount++;
  }

  private transformError(error: AxiosError): HttpException {
    if (error.response) {
      const status = error.response.status;
      const message = (error.response.data as any)?.message || error.message;

      switch (status) {
        case 400:
          return new HttpException(`USDA API Bad Request: ${message}`, HttpStatus.BAD_REQUEST);
        case 401:
          return new HttpException(
            'USDA API Unauthorized: Invalid API key',
            HttpStatus.UNAUTHORIZED,
          );
        case 403:
          return new HttpException(
            'USDA API Forbidden: API key quota exceeded',
            HttpStatus.FORBIDDEN,
          );
        case 404:
          return new HttpException('USDA API Not Found: Resource not found', HttpStatus.NOT_FOUND);
        case 429:
          return new HttpException(
            'USDA API Rate Limited: Too many requests',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        default:
          return new HttpException(`USDA API Error: ${message}`, HttpStatus.BAD_GATEWAY);
      }
    }

    if (error.code === 'ECONNABORTED') {
      return new HttpException('USDA API Timeout', HttpStatus.REQUEST_TIMEOUT);
    }

    return new HttpException('USDA API Connection Error', HttpStatus.BAD_GATEWAY);
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async retryRequest<T>(operation: () => Promise<T>, retryCount = 0): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retryCount >= this.config.maxRetries) {
        throw error;
      }

      // Calculate exponential backoff delay
      const delay = this.config.retryDelay * Math.pow(2, retryCount);
      this.logger.warn(
        `USDA API request failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.config.maxRetries})`,
      );

      await this.sleep(delay);
      return this.retryRequest(operation, retryCount + 1);
    }
  }

  private async validateAndTransform<T>(data: any, dtoClass: new () => T): Promise<T> {
    const dto = plainToClass(dtoClass, data);
    const errors = await validate(dto as any);

    if (errors.length > 0) {
      const errorMessages = errors
        .map((error: ValidationError) => Object.values(error.constraints || {}).join(', '))
        .join('; ');

      this.logger.error(`USDA API validation error: ${errorMessages}`);
      throw new HttpException(
        `Invalid USDA API response format: ${errorMessages}`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    return dto;
  }

  /**
   * Search for foods in the USDA FoodData Central database
   */
  async searchFoods(criteria: USDASearchCriteriaDto): Promise<USDASearchResultDto> {
    this.logger.log(`Searching USDA foods: ${criteria.query}`);

    return this.retryRequest(async () => {
      const response: AxiosResponse = await this.httpClient.post('/foods/search', {
        query: criteria.query,
        dataType: criteria.dataType,
        pageSize: Math.min(criteria.pageSize || 50, 200),
        pageNumber: criteria.pageNumber || 1,
        sortBy: criteria.sortBy,
        sortOrder: criteria.sortOrder || 'asc',
        brandOwner: criteria.brandOwner,
        tradeChannel: criteria.tradeChannel,
        startDate: criteria.startDate,
        endDate: criteria.endDate,
      });

      return this.validateAndTransform(response.data, USDASearchResultDto);
    });
  }

  /**
   * Get detailed information about a specific food by FDC ID
   */
  async getFoodById(fdcId: number, nutrients?: number[]): Promise<USDAFoodDto> {
    this.logger.log(`Getting USDA food by ID: ${fdcId}`);

    return this.retryRequest(async () => {
      const params: any = {};
      if (nutrients && nutrients.length > 0) {
        params.nutrients = nutrients.join(',');
      }

      const response: AxiosResponse = await this.httpClient.get(`/food/${fdcId}`, {
        params,
      });

      return this.validateAndTransform(response.data, USDAFoodDto);
    });
  }

  /**
   * Get multiple foods by FDC IDs (batch request)
   */
  async getFoodsByIds(fdcIds: number[], nutrients?: number[]): Promise<USDAFoodDto[]> {
    this.logger.log(`Getting USDA foods by IDs: ${fdcIds.join(', ')}`);

    return this.retryRequest(async () => {
      const response: AxiosResponse = await this.httpClient.post('/foods', {
        fdcIds,
        nutrients,
      });

      if (!Array.isArray(response.data)) {
        throw new HttpException('Invalid USDA API response format', HttpStatus.BAD_GATEWAY);
      }

      return Promise.all(response.data.map((food) => this.validateAndTransform(food, USDAFoodDto)));
    });
  }

  /**
   * Get foods list with pagination
   */
  async getFoodsList(
    dataType?: string,
    pageSize?: number,
    pageNumber?: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ): Promise<USDAFoodDto[]> {
    this.logger.log(`Getting USDA foods list`);

    return this.retryRequest(async () => {
      const params: any = {};
      if (dataType) params.dataType = dataType;
      if (pageSize) params.pageSize = Math.min(pageSize, 200);
      if (pageNumber) params.pageNumber = pageNumber;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;

      const response: AxiosResponse = await this.httpClient.get('/foods/list', {
        params,
      });

      if (!Array.isArray(response.data)) {
        throw new HttpException('Invalid USDA API response format', HttpStatus.BAD_GATEWAY);
      }

      return Promise.all(response.data.map((food) => this.validateAndTransform(food, USDAFoodDto)));
    });
  }

  /**
   * Test connection to USDA API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getFoodsList('Foundation', 1, 1);
      return true;
    } catch (error) {
      this.logger.error('USDA API connection test failed:', error);
      return false;
    }
  }

  /**
   * Get client configuration (for testing purposes)
   */
  getConfig(): USDAClientConfig {
    return { ...this.config };
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): { requestCount: number; windowStart: number; windowMs: number } {
    return {
      requestCount: this.requestCount,
      windowStart: this.windowStart,
      windowMs: this.config.rateLimit.windowMs,
    };
  }
}
