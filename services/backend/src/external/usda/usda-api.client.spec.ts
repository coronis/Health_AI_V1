import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as nock from 'nock';
import { USDAApiClient } from '../usda/usda-api.client';
import { USDASearchCriteriaDto, USDAFoodDto, USDASearchResultDto } from '../dto/usda.dto';

describe('USDAApiClient', () => {
  let client: USDAApiClient;
  let module: TestingModule;

  const mockConfig = {
    USDA_API_KEY: 'test-api-key',
    USDA_BASE_URL: 'https://api.nal.usda.gov/fdc/v1',
    USDA_TIMEOUT: 30000,
    USDA_MAX_RETRIES: 3,
    USDA_RETRY_DELAY: 1000,
    USDA_RATE_LIMIT_REQUESTS: 100,
    USDA_RATE_LIMIT_WINDOW: 60000,
  };

  const mockFoodData: USDAFoodDto = {
    fdcId: 123456,
    description: 'Test Food',
    dataType: 'Foundation',
    publishedDate: '2023-01-01',
    foodNutrients: [
      {
        nutrientId: 1008,
        nutrientName: 'Energy',
        nutrientNumber: '208',
        unitName: 'kcal',
        value: 250,
      },
    ],
  };

  const mockSearchResult: USDASearchResultDto = {
    query: 'test',
    totalHits: 1,
    currentPage: 1,
    totalPages: 1,
    foods: [mockFoodData],
  };

  beforeEach(async () => {
    // Clean up any previous nock interceptors
    nock.cleanAll();

    module = await Test.createTestingModule({
      providers: [
        USDAApiClient,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              return mockConfig[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    client = module.get<USDAApiClient>(USDAApiClient);
    // configService is provided via module but not used directly in tests
  });

  afterEach(async () => {
    nock.cleanAll();
    await module.close();
  });

  describe('Configuration', () => {
    it('should load configuration correctly', () => {
      const config = client.getConfig();
      expect(config.apiKey).toBe('test-api-key');
      expect(config.baseUrl).toBe('https://api.nal.usda.gov/fdc/v1');
      expect(config.timeout).toBe(30000);
    });

    it('should use default values when config is missing', async () => {
      const testModule = await Test.createTestingModule({
        providers: [
          USDAApiClient,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string, defaultValue?: any) => defaultValue),
            },
          },
        ],
      }).compile();

      const testClient = testModule.get<USDAApiClient>(USDAApiClient);
      const config = testClient.getConfig();

      expect(config.apiKey).toBe('DEMO_KEY');
      expect(config.baseUrl).toBe('https://api.nal.usda.gov/fdc/v1');

      await testModule.close();
    });
  });

  describe('searchFoods', () => {
    it('should search foods successfully', async () => {
      const searchCriteria: USDASearchCriteriaDto = {
        query: 'apple',
        pageSize: 10,
        pageNumber: 1,
      };

      nock('https://api.nal.usda.gov/fdc/v1')
        .post('/foods/search', {
          query: 'apple',
          pageSize: 10,
          pageNumber: 1,
          sortOrder: 'asc',
        })
        .query({ api_key: 'test-api-key' })
        .reply(200, mockSearchResult);

      const result = await client.searchFoods(searchCriteria);

      expect(result.query).toBe('test');
      expect(result.totalHits).toBe(1);
      expect(result.foods).toHaveLength(1);
      expect(result.foods[0].fdcId).toBe(123456);
    });

    it('should limit page size to 200', async () => {
      const searchCriteria: USDASearchCriteriaDto = {
        query: 'apple',
        pageSize: 500, // Over limit
      };

      nock('https://api.nal.usda.gov/fdc/v1')
        .post('/foods/search', {
          query: 'apple',
          pageSize: 200, // Should be limited
          pageNumber: 1,
          sortOrder: 'asc',
        })
        .query({ api_key: 'test-api-key' })
        .reply(200, mockSearchResult);

      await client.searchFoods(searchCriteria);
    });

    it('should handle API errors', async () => {
      const searchCriteria: USDASearchCriteriaDto = {
        query: 'apple',
      };

      nock('https://api.nal.usda.gov/fdc/v1')
        .post('/foods/search')
        .query({ api_key: 'test-api-key' })
        .reply(400, { message: 'Invalid query' });

      await expect(client.searchFoods(searchCriteria)).rejects.toThrow(HttpException);
    });

    it('should handle 401 unauthorized error', async () => {
      const searchCriteria: USDASearchCriteriaDto = {
        query: 'apple',
      };

      nock('https://api.nal.usda.gov/fdc/v1')
        .post('/foods/search')
        .query({ api_key: 'test-api-key' })
        .reply(401, { message: 'Unauthorized' });

      await expect(client.searchFoods(searchCriteria)).rejects.toThrow(
        new HttpException('USDA API Unauthorized: Invalid API key', HttpStatus.UNAUTHORIZED),
      );
    });

    it('should handle 429 rate limit error', async () => {
      const searchCriteria: USDASearchCriteriaDto = {
        query: 'apple',
      };

      nock('https://api.nal.usda.gov/fdc/v1')
        .post('/foods/search')
        .query({ api_key: 'test-api-key' })
        .reply(429, { message: 'Rate limit exceeded' });

      await expect(client.searchFoods(searchCriteria)).rejects.toThrow(
        new HttpException('USDA API Rate Limited: Too many requests', HttpStatus.TOO_MANY_REQUESTS),
      );
    });
  });

  describe('getFoodById', () => {
    it('should get food by ID successfully', async () => {
      const fdcId = 123456;

      nock('https://api.nal.usda.gov/fdc/v1')
        .get(`/food/${fdcId}`)
        .query({ api_key: 'test-api-key' })
        .reply(200, mockFoodData);

      const result = await client.getFoodById(fdcId);

      expect(result.fdcId).toBe(123456);
      expect(result.description).toBe('Test Food');
    });

    it('should include nutrients parameter when provided', async () => {
      const fdcId = 123456;
      const nutrients = [1008, 1003];

      nock('https://api.nal.usda.gov/fdc/v1')
        .get(`/food/${fdcId}`)
        .query({
          api_key: 'test-api-key',
          nutrients: '1008,1003',
        })
        .reply(200, mockFoodData);

      await client.getFoodById(fdcId, nutrients);
    });

    it('should handle 404 not found error', async () => {
      const fdcId = 999999;

      nock('https://api.nal.usda.gov/fdc/v1')
        .get(`/food/${fdcId}`)
        .query({ api_key: 'test-api-key' })
        .reply(404, { message: 'Food not found' });

      await expect(client.getFoodById(fdcId)).rejects.toThrow(
        new HttpException('USDA API Not Found: Resource not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('getFoodsByIds', () => {
    it('should get multiple foods by IDs successfully', async () => {
      const fdcIds = [123456, 789012];

      nock('https://api.nal.usda.gov/fdc/v1')
        .post('/foods', { fdcIds })
        .query({ api_key: 'test-api-key' })
        .reply(200, [mockFoodData, { ...mockFoodData, fdcId: 789012 }]);

      const results = await client.getFoodsByIds(fdcIds);

      expect(results).toHaveLength(2);
      expect(results[0].fdcId).toBe(123456);
      expect(results[1].fdcId).toBe(789012);
    });

    it('should include nutrients parameter when provided', async () => {
      const fdcIds = [123456];
      const nutrients = [1008];

      nock('https://api.nal.usda.gov/fdc/v1')
        .post('/foods', { fdcIds, nutrients })
        .query({ api_key: 'test-api-key' })
        .reply(200, [mockFoodData]);

      await client.getFoodsByIds(fdcIds, nutrients);
    });
  });

  describe('Retry Logic', () => {
    it('should retry on network errors', async () => {
      const searchCriteria: USDASearchCriteriaDto = {
        query: 'apple',
      };

      // First call fails, second succeeds
      nock('https://api.nal.usda.gov/fdc/v1')
        .post('/foods/search')
        .query({ api_key: 'test-api-key' })
        .replyWithError('ECONNRESET');

      nock('https://api.nal.usda.gov/fdc/v1')
        .post('/foods/search')
        .query({ api_key: 'test-api-key' })
        .reply(200, mockSearchResult);

      const result = await client.searchFoods(searchCriteria);
      expect(result.foods).toHaveLength(1);
    });

    it('should fail after max retries', async () => {
      const searchCriteria: USDASearchCriteriaDto = {
        query: 'apple',
      };

      // All calls fail
      nock('https://api.nal.usda.gov/fdc/v1')
        .post('/foods/search')
        .query({ api_key: 'test-api-key' })
        .times(4) // Initial + 3 retries
        .replyWithError('ECONNRESET');

      await expect(client.searchFoods(searchCriteria)).rejects.toThrow();
    });
  });

  describe('Rate Limiting', () => {
    it('should track rate limit status', () => {
      const status = client.getRateLimitStatus();
      expect(status).toHaveProperty('requestCount');
      expect(status).toHaveProperty('windowStart');
      expect(status).toHaveProperty('windowMs');
    });
  });

  describe('Connection Test', () => {
    it('should test connection successfully', async () => {
      nock('https://api.nal.usda.gov/fdc/v1')
        .get('/foods/list')
        .query({
          api_key: 'test-api-key',
          dataType: 'Foundation',
          pageSize: 1,
          pageNumber: 1,
        })
        .reply(200, [mockFoodData]);

      const result = await client.testConnection();
      expect(result).toBe(true);
    });

    it('should return false on connection failure', async () => {
      nock('https://api.nal.usda.gov/fdc/v1')
        .get('/foods/list')
        .query({
          api_key: 'test-api-key',
          dataType: 'Foundation',
          pageSize: 1,
          pageNumber: 1,
        })
        .replyWithError('ECONNREFUSED');

      const result = await client.testConnection();
      expect(result).toBe(false);
    });
  });

  describe('Data Validation', () => {
    it('should validate response data structure', async () => {
      const searchCriteria: USDASearchCriteriaDto = {
        query: 'apple',
      };

      // Invalid response structure
      nock('https://api.nal.usda.gov/fdc/v1')
        .post('/foods/search')
        .query({ api_key: 'test-api-key' })
        .reply(200, { invalid: 'structure' });

      await expect(client.searchFoods(searchCriteria)).rejects.toThrow(HttpException);
    });
  });

  describe('Timeout Handling', () => {
    it('should handle timeout errors', async () => {
      const searchCriteria: USDASearchCriteriaDto = {
        query: 'apple',
      };

      nock('https://api.nal.usda.gov/fdc/v1')
        .post('/foods/search')
        .query({ api_key: 'test-api-key' })
        .delayConnection(35000) // Longer than timeout
        .reply(200, mockSearchResult);

      await expect(client.searchFoods(searchCriteria)).rejects.toThrow(
        new HttpException('USDA API Timeout', HttpStatus.REQUEST_TIMEOUT),
      );
    });
  });
});
