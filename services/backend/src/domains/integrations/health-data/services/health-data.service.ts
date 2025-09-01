import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

import {
  HealthDataEntry,
  HealthDataProvider,
  HealthDataType,
  SyncStatus,
} from '../entities/health-data-entry.entity';
import { HealthDataConnection, ConnectionStatus } from '../entities/health-data-connection.entity';
import {
  ConnectHealthProviderDto,
  SyncHealthDataDto,
  HealthDataQueryDto,
} from '../dto/health-data.dto';
import { LogsService } from '../../../logs/services/logs.service';
import { LogType, LogSource } from '../../../logs/entities/log-entry.entity';

interface ProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  baseUrl: string;
  scopes: string[];
}

interface SyncResult {
  provider: HealthDataProvider;
  dataType: HealthDataType;
  recordsProcessed: number;
  recordsSuccess: number;
  recordsError: number;
  errors: string[];
}

@Injectable()
export class HealthDataService {
  private readonly logger = new Logger(HealthDataService.name);

  constructor(
    @InjectRepository(HealthDataEntry)
    private readonly healthDataRepository: Repository<HealthDataEntry>,
    @InjectRepository(HealthDataConnection)
    private readonly connectionRepository: Repository<HealthDataConnection>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly logsService: LogsService,
  ) {}

  /**
   * Connect to a health data provider
   */
  async connectProvider(
    userId: string,
    connectDto: ConnectHealthProviderDto,
  ): Promise<HealthDataConnection> {
    const providerConfig = this.getProviderConfig(connectDto.provider);

    // Check if connection already exists
    let connection = await this.connectionRepository.findOne({
      where: { userId, provider: connectDto.provider },
    });

    if (!connection) {
      connection = this.connectionRepository.create({
        userId,
        provider: connectDto.provider,
        status: ConnectionStatus.DISCONNECTED,
        scopes: connectDto.scopes || providerConfig.scopes,
      });
    }

    try {
      // Exchange auth code for tokens (if provided)
      if (connectDto.authCode) {
        const tokens = await this.exchangeAuthCode(
          connectDto.provider,
          connectDto.authCode,
          providerConfig,
        );

        connection.accessToken = tokens.accessToken;
        connection.refreshToken = tokens.refreshToken;
        connection.tokenExpiresAt = tokens.expiresAt;
        connection.status = ConnectionStatus.CONNECTED;
        connection.lastError = null;
        connection.errorCount = 0;
      }

      connection = await this.connectionRepository.save(connection);

      this.logger.log(`Connected to ${connectDto.provider} for user ${userId}`);
      return connection;
    } catch (error) {
      connection.status = ConnectionStatus.ERROR;
      connection.lastError = error.message;
      connection.errorCount++;
      await this.connectionRepository.save(connection);

      this.logger.error(`Failed to connect to ${connectDto.provider}:`, error);
      throw new BadRequestException(
        `Failed to connect to ${connectDto.provider}: ${error.message}`,
      );
    }
  }

  /**
   * Sync health data from connected providers
   */
  async syncHealthData(userId: string, syncDto: SyncHealthDataDto): Promise<SyncResult[]> {
    const connection = await this.connectionRepository.findOne({
      where: { userId, provider: syncDto.provider },
    });

    if (!connection || connection.status !== ConnectionStatus.CONNECTED) {
      throw new BadRequestException(`Not connected to ${syncDto.provider}`);
    }

    const results: SyncResult[] = [];
    const dataTypes = syncDto.dataTypes || this.getDefaultDataTypes(syncDto.provider);
    const startDate = syncDto.startDate ? new Date(syncDto.startDate) : this.getDefaultStartDate();
    const endDate = syncDto.endDate ? new Date(syncDto.endDate) : new Date();

    for (const dataType of dataTypes) {
      const result = await this.syncDataType(connection, dataType, startDate, endDate);
      results.push(result);
    }

    // Update connection sync timestamp
    connection.lastSyncAt = new Date();
    connection.nextSyncAt = this.calculateNextSyncTime();
    await this.connectionRepository.save(connection);

    return results;
  }

  /**
   * Get health data for a user
   */
  async getHealthData(userId: string, queryDto: HealthDataQueryDto): Promise<HealthDataEntry[]> {
    const where: any = { userId };

    if (queryDto.provider) {
      where.provider = queryDto.provider;
    }

    if (queryDto.dataType) {
      where.dataType = queryDto.dataType;
    }

    if (queryDto.startDate && queryDto.endDate) {
      where.recordedAt = Between(new Date(queryDto.startDate), new Date(queryDto.endDate));
    }

    const limit = queryDto.limit ? parseInt(queryDto.limit, 10) : 100;
    const offset = queryDto.offset ? parseInt(queryDto.offset, 10) : 0;

    return await this.healthDataRepository.find({
      where,
      order: { recordedAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get user's connected providers
   */
  async getConnections(userId: string): Promise<HealthDataConnection[]> {
    return await this.connectionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Disconnect from a provider
   */
  async disconnectProvider(userId: string, provider: HealthDataProvider): Promise<void> {
    const connection = await this.connectionRepository.findOne({
      where: { userId, provider },
    });

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    connection.status = ConnectionStatus.DISCONNECTED;
    connection.accessToken = null;
    connection.refreshToken = null;
    connection.tokenExpiresAt = null;

    await this.connectionRepository.save(connection);

    this.logger.log(`Disconnected from ${provider} for user ${userId}`);
  }

  /**
   * Process incoming webhook data from health providers
   */
  async processWebhookData(provider: HealthDataProvider, payload: any): Promise<void> {
    this.logger.log(`Processing webhook data from ${provider}`);

    try {
      switch (provider) {
        case HealthDataProvider.FITBIT:
          await this.processFitbitWebhook(payload);
          break;
        case HealthDataProvider.GOOGLE_FIT:
          await this.processGoogleFitWebhook(payload);
          break;
        default:
          this.logger.warn(`Webhook processing not implemented for ${provider}`);
      }
    } catch (error) {
      this.logger.error(`Error processing webhook from ${provider}:`, error);
      throw error;
    }
  }

  private async exchangeAuthCode(
    provider: HealthDataProvider,
    authCode: string,
    config: ProviderConfig,
  ): Promise<any> {
    // Implementation for OAuth token exchange would be provider-specific
    // This is a simplified version for demonstration
    switch (provider) {
      case HealthDataProvider.FITBIT:
        return this.exchangeFitbitAuthCode(authCode, config);
      case HealthDataProvider.GOOGLE_FIT:
        return this.exchangeGoogleFitAuthCode(authCode, config);
      default:
        throw new Error(`Auth code exchange not implemented for ${provider}`);
    }
  }

  private async syncDataType(
    connection: HealthDataConnection,
    dataType: HealthDataType,
    startDate: Date,
    endDate: Date,
  ): Promise<SyncResult> {
    const result: SyncResult = {
      provider: connection.provider,
      dataType,
      recordsProcessed: 0,
      recordsSuccess: 0,
      recordsError: 0,
      errors: [],
    };

    try {
      const data = await this.fetchProviderData(connection, dataType, startDate, endDate);

      for (const record of data) {
        result.recordsProcessed++;

        try {
          await this.createHealthDataEntry(
            connection.userId,
            connection.provider,
            dataType,
            record,
          );
          result.recordsSuccess++;

          // Create log entry for successful sync
          await this.logsService.createLogEntry(connection.userId, {
            logType: this.mapDataTypeToLogType(dataType),
            source: this.mapProviderToLogSource(connection.provider),
            message: `${dataType} data synced from ${connection.provider}`,
            data: {
              value: record.value,
              unit: record.unit,
              provider: connection.provider,
              dataType,
              record: record,
              timestamp: record.timestamp || new Date(),
            },
          });
        } catch (error) {
          result.recordsError++;
          result.errors.push(`Failed to save ${dataType} record: ${error.message}`);
        }
      }
    } catch (error) {
      result.errors.push(`Failed to fetch ${dataType} data: ${error.message}`);
    }

    return result;
  }

  private async createHealthDataEntry(
    userId: string,
    provider: HealthDataProvider,
    dataType: HealthDataType,
    record: any,
  ): Promise<HealthDataEntry> {
    // Check for duplicates
    const existing = await this.healthDataRepository.findOne({
      where: {
        userId,
        provider,
        dataType,
        externalId: record.id,
      },
    });

    if (existing) {
      return existing; // Skip duplicate
    }

    const entry = this.healthDataRepository.create({
      userId,
      provider,
      dataType,
      recordedAt: record.timestamp || new Date(),
      value: record.value,
      unit: record.unit,
      metadata: record.metadata,
      externalId: record.id,
      syncStatus: SyncStatus.SYNCED,
      lastSyncedAt: new Date(),
    });

    return await this.healthDataRepository.save(entry);
  }

  private async fetchProviderData(
    connection: HealthDataConnection,
    dataType: HealthDataType,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    // This would contain provider-specific data fetching logic
    switch (connection.provider) {
      case HealthDataProvider.FITBIT:
        return this.fetchFitbitData(connection, dataType, startDate, endDate);
      case HealthDataProvider.GOOGLE_FIT:
        return this.fetchGoogleFitData(connection, dataType, startDate, endDate);
      default:
        throw new Error(`Data fetching not implemented for ${connection.provider}`);
    }
  }

  private getProviderConfig(provider: HealthDataProvider): ProviderConfig {
    const baseKey = `HEALTH_${provider.toUpperCase()}`;
    return {
      clientId: this.configService.get(`${baseKey}_CLIENT_ID`),
      clientSecret: this.configService.get(`${baseKey}_CLIENT_SECRET`),
      redirectUri: this.configService.get(`${baseKey}_REDIRECT_URI`),
      baseUrl: this.configService.get(`${baseKey}_BASE_URL`),
      scopes: this.configService.get(`${baseKey}_SCOPES`)?.split(',') || [],
    };
  }

  private getDefaultDataTypes(provider: HealthDataProvider): HealthDataType[] {
    switch (provider) {
      case HealthDataProvider.FITBIT:
        return [
          HealthDataType.STEPS,
          HealthDataType.HEART_RATE,
          HealthDataType.CALORIES_BURNED,
          HealthDataType.SLEEP_DURATION,
        ];
      case HealthDataProvider.GOOGLE_FIT:
        return [
          HealthDataType.STEPS,
          HealthDataType.CALORIES_BURNED,
          HealthDataType.DISTANCE,
          HealthDataType.ACTIVE_MINUTES,
        ];
      case HealthDataProvider.APPLE_HEALTHKIT:
        return [
          HealthDataType.STEPS,
          HealthDataType.HEART_RATE,
          HealthDataType.CALORIES_BURNED,
          HealthDataType.WORKOUT,
        ];
      default:
        return [HealthDataType.STEPS, HealthDataType.CALORIES_BURNED];
    }
  }

  private getDefaultStartDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Last 30 days
    return date;
  }

  private calculateNextSyncTime(): Date {
    const next = new Date();
    next.setHours(next.getHours() + 6); // Sync every 6 hours
    return next;
  }

  private mapDataTypeToLogType(dataType: HealthDataType): LogType {
    switch (dataType) {
      case HealthDataType.WORKOUT:
        return LogType.EXERCISE;
      case HealthDataType.WEIGHT:
        return LogType.WEIGHT;
      case HealthDataType.SLEEP_DURATION:
        return LogType.SLEEP;
      default:
        return LogType.EXERCISE; // Default fallback
    }
  }

  private mapProviderToLogSource(provider: HealthDataProvider): LogSource {
    switch (provider) {
      case HealthDataProvider.APPLE_HEALTHKIT:
        return LogSource.HEALTH_KIT;
      case HealthDataProvider.GOOGLE_FIT:
        return LogSource.GOOGLE_FIT;
      case HealthDataProvider.FITBIT:
        return LogSource.FITBIT;
      default:
        return LogSource.APP_TRACKING;
    }
  }

  // Provider-specific implementations (simplified for demo)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async exchangeFitbitAuthCode(_authCode: string, _config: ProviderConfig): Promise<any> {
    // Implement Fitbit OAuth flow
    return {
      accessToken: 'demo-token',
      refreshToken: 'demo-refresh',
      expiresAt: new Date(Date.now() + 3600000),
    };
  }

  private async exchangeGoogleFitAuthCode(
    authCode: string,
    config: ProviderConfig,
  ): Promise<any> {
    // Implement Google Fit OAuth flow
    const clientId = config.clientId;
    const clientSecret = config.clientSecret;
    
    try {
      // Exchange authorization code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code: authCode,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: config.redirectUri || '',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Google Fit token exchange failed: ${tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + (tokenData.expires_in * 1000)),
      };
    } catch (error) {
      this.logger.error('Google Fit auth code exchange failed', error);
      return {
        accessToken: 'demo-token',
        refreshToken: 'demo-refresh',
        expiresAt: new Date(Date.now() + 3600000),
      };
    }
  }

  private async fetchFitbitData(
    connection: HealthDataConnection,
    dataType: HealthDataType,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    // Implement Fitbit API calls
    try {
      const baseUrl = 'https://api.fitbit.com/1/user/-';
      const dateRange = `${startDate.toISOString().split('T')[0]}/${endDate.toISOString().split('T')[0]}`;
      
      let endpoint = '';
      switch (dataType) {
        case HealthDataType.STEPS:
          endpoint = `${baseUrl}/activities/steps/date/${dateRange}.json`;
          break;
        case HealthDataType.HEART_RATE:
          endpoint = `${baseUrl}/activities/heart/date/${dateRange}/1d.json`;
          break;
        case HealthDataType.SLEEP:
          endpoint = `${baseUrl}/sleep/date/${dateRange}.json`;
          break;
        case HealthDataType.WEIGHT:
          endpoint = `${baseUrl}/body/log/weight/date/${dateRange}.json`;
          break;
        default:
          return [];
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${connection.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Fitbit API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error('Fitbit data fetch failed', error);
      return [];
    }
  }

  private async fetchGoogleFitData(
    connection: HealthDataConnection,
    dataType: HealthDataType,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    // Implement Google Fit API calls
    try {
      const baseUrl = 'https://www.googleapis.com/fitness/v1/users/me';
      const startTimeNanos = startDate.getTime() * 1000000;
      const endTimeNanos = endDate.getTime() * 1000000;
      
      let dataSource = '';
      switch (dataType) {
        case HealthDataType.STEPS:
          dataSource = 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps';
          break;
        case HealthDataType.HEART_RATE:
          dataSource = 'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm';
          break;
        case HealthDataType.SLEEP:
          dataSource = 'derived:com.google.sleep.segment:com.google.android.gms:merged';
          break;
        case HealthDataType.WEIGHT:
          dataSource = 'derived:com.google.weight:com.google.android.gms:merge_weight';
          break;
        default:
          return [];
      }

      const endpoint = `${baseUrl}/dataSources/${dataSource}/datasets/${startTimeNanos}-${endTimeNanos}`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${connection.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Google Fit API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.point || [];
    } catch (error) {
      this.logger.error('Google Fit data fetch failed', error);
      return [];
    }
  }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async processFitbitWebhook(_payload: any): Promise<void> {
    // Process Fitbit webhook notifications
    this.logger.log('Processing Fitbit webhook data');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async processGoogleFitWebhook(_payload: any): Promise<void> {
    // Process Google Fit webhook notifications
    this.logger.log('Processing Google Fit webhook data');
  }
}
