import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { Cron } from '@nestjs/schedule';

/**
 * AI Tiering and Rate Limiting Service
 * Implements daily tiering limits with reset functionality for cost control
 * Provides hot-reloadable policy tables for AI routing decisions
 */
@Injectable()
export class AITieringService {
  private readonly logger = new Logger(AITieringService.name);
  
  // AI Model Tiers (cost-based)
  private readonly AI_TIERS = {
    TIER_1: {
      name: 'Basic',
      models: ['gpt-3.5-turbo', 'claude-3-haiku'],
      costPerRequest: 0.001,
      maxDailyRequests: 1000,
      priority: 1
    },
    TIER_2: {
      name: 'Advanced',
      models: ['gpt-4', 'claude-3-sonnet'],
      costPerRequest: 0.01,
      maxDailyRequests: 500,
      priority: 2
    },
    TIER_3: {
      name: 'Premium',
      models: ['gpt-4-turbo', 'claude-3-opus', 'gemini-pro'],
      costPerRequest: 0.03,
      maxDailyRequests: 100,
      priority: 3
    }
  };
  
  // Hot-reloadable policy cache
  private policyCache = new Map<string, any>();
  private lastPolicyReload = Date.now();
  
  constructor(
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    this.loadInitialPolicies();
  }
  
  // MARK: - Daily Tiering Limits
  
  async checkDailyLimit(userId: string, tier: keyof typeof AITieringService.prototype.AI_TIERS): Promise<boolean> {
    const dailyKey = this.getDailyUsageKey(userId, tier);
    const currentUsage = await this.redis.get(dailyKey);
    const tierConfig = this.AI_TIERS[tier];
    
    const usage = parseInt(currentUsage || '0');
    return usage < tierConfig.maxDailyRequests;
  }
  
  async incrementDailyUsage(userId: string, tier: keyof typeof AITieringService.prototype.AI_TIERS): Promise<number> {
    const dailyKey = this.getDailyUsageKey(userId, tier);
    const newUsage = await this.redis.incr(dailyKey);
    
    // Set expiration to end of day if first increment
    if (newUsage === 1) {
      const endOfDay = this.getEndOfDayTimestamp();
      await this.redis.expireat(dailyKey, endOfDay);
    }
    
    this.logger.debug(`User ${userId} ${tier} usage: ${newUsage}/${this.AI_TIERS[tier].maxDailyRequests}`);
    return newUsage;
  }
  
  async getDailyUsage(userId: string): Promise<DailyUsageStats> {
    const usage = {
      TIER_1: 0,
      TIER_2: 0,
      TIER_3: 0,
      totalCost: 0,
      resetTime: this.getEndOfDayTimestamp()
    };
    
    for (const tier of Object.keys(this.AI_TIERS) as Array<keyof typeof this.AI_TIERS>) {
      const dailyKey = this.getDailyUsageKey(userId, tier);
      const tierUsage = parseInt(await this.redis.get(dailyKey) || '0');
      usage[tier] = tierUsage;
      usage.totalCost += tierUsage * this.AI_TIERS[tier].costPerRequest;
    }
    
    return usage;
  }
  
  // MARK: - AI Model Routing
  
  async routeAIRequest(
    requestType: AIRequestType,
    complexity: AIComplexity,
    userId: string,
    preferences?: AIRoutingPreferences
  ): Promise<AIRoutingDecision> {
    
    // Load current routing policies
    await this.refreshPoliciesIfNeeded();
    
    // Get user tier preferences and limits
    const dailyUsage = await this.getDailyUsage(userId);
    const userTier = preferences?.preferredTier || await this.getUserTier(userId);
    
    // Determine optimal tier based on policies
    const optimalTier = this.determineOptimalTier(
      requestType,
      complexity,
      dailyUsage,
      userTier,
      preferences
    );
    
    // Check if user has available quota
    const hasQuota = await this.checkDailyLimit(userId, optimalTier);
    
    if (!hasQuota) {
      // Fallback to lower tier if available
      const fallbackTier = this.findAvailableFallbackTier(userId, dailyUsage, optimalTier);
      if (fallbackTier) {
        return this.createRoutingDecision(fallbackTier, true, 'quota_exceeded');
      } else {
        throw new Error('Daily AI usage quota exceeded for all tiers');
      }
    }
    
    return this.createRoutingDecision(optimalTier, false);
  }
  
  // MARK: - Hot-reloadable Policies
  
  async updatePolicy(policyName: string, policy: any): Promise<void> {
    const policyKey = `ai_policy:${policyName}`;
    
    // Store in Redis for persistence and sharing across instances
    await this.redis.set(policyKey, JSON.stringify(policy));
    
    // Update local cache
    this.policyCache.set(policyName, policy);
    
    this.logger.log(`Updated AI policy: ${policyName}`);
  }
  
  async getPolicy(policyName: string): Promise<any> {
    // Check local cache first
    if (this.policyCache.has(policyName)) {
      return this.policyCache.get(policyName);
    }
    
    // Load from Redis
    const policyKey = `ai_policy:${policyName}`;
    const policyData = await this.redis.get(policyKey);
    
    if (policyData) {
      const policy = JSON.parse(policyData);
      this.policyCache.set(policyName, policy);
      return policy;
    }
    
    return null;
  }
  
  async refreshPoliciesIfNeeded(): Promise<void> {
    const refreshInterval = 5 * 60 * 1000; // 5 minutes
    
    if (Date.now() - this.lastPolicyReload > refreshInterval) {
      await this.reloadAllPolicies();
      this.lastPolicyReload = Date.now();
    }
  }
  
  // MARK: - Cache and Reuse Logic
  
  async getCachedResponse(requestHash: string): Promise<CachedAIResponse | null> {
    const cacheKey = `ai_cache:${requestHash}`;
    const cachedData = await this.redis.get(cacheKey);
    
    if (cachedData) {
      const cached = JSON.parse(cachedData) as CachedAIResponse;
      
      // Check if cache is still valid
      if (Date.now() - cached.timestamp < cached.ttl) {
        this.logger.debug(`Cache hit for request hash: ${requestHash}`);
        return cached;
      } else {
        // Remove expired cache
        await this.redis.del(cacheKey);
      }
    }
    
    return null;
  }
  
  async cacheResponse(
    requestHash: string,
    response: any,
    tier: keyof typeof AITieringService.prototype.AI_TIERS,
    ttl: number = 3600000 // 1 hour default
  ): Promise<void> {
    const cacheKey = `ai_cache:${requestHash}`;
    const cachedResponse: CachedAIResponse = {
      response,
      tier,
      timestamp: Date.now(),
      ttl
    };
    
    // Store with expiration
    await this.redis.setex(cacheKey, Math.floor(ttl / 1000), JSON.stringify(cachedResponse));
    
    this.logger.debug(`Cached response for hash: ${requestHash}, TTL: ${ttl}ms`);
  }
  
  generateRequestHash(
    requestType: AIRequestType,
    content: string,
    parameters: any = {}
  ): string {
    const crypto = require('crypto');
    const hashContent = `${requestType}:${content}:${JSON.stringify(parameters)}`;
    return crypto.createHash('sha256').update(hashContent).digest('hex');
  }
  
  // MARK: - Cron Jobs
  
  @Cron('0 0 * * *') // Daily at midnight
  async resetDailyCounters(): Promise<void> {
    this.logger.log('Resetting daily AI usage counters...');
    
    // Redis keys automatically expire, but we can clean up manually
    const pattern = 'ai_usage:daily:*';
    const keys = await this.redis.keys(pattern);
    
    if (keys.length > 0) {
      await this.redis.del(...keys);
      this.logger.log(`Reset ${keys.length} daily usage counters`);
    }
  }
  
  @Cron('*/5 * * * *') // Every 5 minutes
  async reloadPolicies(): Promise<void> {
    await this.reloadAllPolicies();
  }
  
  @Cron('0 */6 * * *') // Every 6 hours
  async cleanupExpiredCache(): Promise<void> {
    this.logger.log('Cleaning up expired AI cache entries...');
    
    const pattern = 'ai_cache:*';
    const keys = await this.redis.keys(pattern);
    let cleanedCount = 0;
    
    for (const key of keys) {
      const data = await this.redis.get(key);
      if (data) {
        const cached = JSON.parse(data) as CachedAIResponse;
        if (Date.now() - cached.timestamp >= cached.ttl) {
          await this.redis.del(key);
          cleanedCount++;
        }
      }
    }
    
    this.logger.log(`Cleaned up ${cleanedCount} expired cache entries`);
  }
  
  // MARK: - Private Methods
  
  private getDailyUsageKey(userId: string, tier: string): string {
    const today = new Date().toISOString().split('T')[0];
    return `ai_usage:daily:${userId}:${tier}:${today}`;
  }
  
  private getEndOfDayTimestamp(): number {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    return Math.floor(endOfDay.getTime() / 1000);
  }
  
  private async loadInitialPolicies(): Promise<void> {
    const defaultPolicies = {
      routing: {
        meal_planning: {
          simple: 'TIER_1',
          complex: 'TIER_2',
          premium: 'TIER_3'
        },
        chat: {
          simple: 'TIER_1',
          complex: 'TIER_2',
          premium: 'TIER_2'
        },
        health_analysis: {
          simple: 'TIER_2',
          complex: 'TIER_3',
          premium: 'TIER_3'
        }
      },
      cache_ttl: {
        TIER_1: 3600000, // 1 hour
        TIER_2: 7200000, // 2 hours
        TIER_3: 14400000 // 4 hours
      },
      fallback_order: ['TIER_1', 'TIER_2', 'TIER_3']
    };
    
    for (const [name, policy] of Object.entries(defaultPolicies)) {
      await this.updatePolicy(name, policy);
    }
  }
  
  private async reloadAllPolicies(): Promise<void> {
    const pattern = 'ai_policy:*';
    const keys = await this.redis.keys(pattern);
    
    for (const key of keys) {
      const policyName = key.replace('ai_policy:', '');
      const policyData = await this.redis.get(key);
      
      if (policyData) {
        this.policyCache.set(policyName, JSON.parse(policyData));
      }
    }
    
    this.logger.debug(`Reloaded ${keys.length} AI policies`);
  }
  
  private determineOptimalTier(
    requestType: AIRequestType,
    complexity: AIComplexity,
    dailyUsage: DailyUsageStats,
    userTier: string,
    preferences?: AIRoutingPreferences
  ): keyof typeof AITieringService.prototype.AI_TIERS {
    
    const routingPolicy = this.policyCache.get('routing') || {};
    const defaultTier = routingPolicy[requestType]?.[complexity] || 'TIER_1';
    
    // Consider user preferences and subscription level
    if (preferences?.forceHighQuality && userTier === 'premium') {
      return 'TIER_3';
    }
    
    return defaultTier as keyof typeof AITieringService.prototype.AI_TIERS;
  }
  
  private async findAvailableFallbackTier(
    userId: string,
    dailyUsage: DailyUsageStats,
    originalTier: keyof typeof AITieringService.prototype.AI_TIERS
  ): Promise<keyof typeof AITieringService.prototype.AI_TIERS | null> {
    
    const fallbackOrder = this.policyCache.get('fallback_order') || ['TIER_1', 'TIER_2', 'TIER_3'];
    
    for (const tier of fallbackOrder) {
      if (tier !== originalTier && await this.checkDailyLimit(userId, tier as any)) {
        return tier as keyof typeof AITieringService.prototype.AI_TIERS;
      }
    }
    
    return null;
  }
  
  private createRoutingDecision(
    tier: keyof typeof AITieringService.prototype.AI_TIERS,
    isFallback: boolean = false,
    reason?: string
  ): AIRoutingDecision {
    const tierConfig = this.AI_TIERS[tier];
    
    return {
      tier,
      model: tierConfig.models[0], // Use first model as default
      availableModels: tierConfig.models,
      costPerRequest: tierConfig.costPerRequest,
      isFallback,
      reason,
      cacheTTL: this.policyCache.get('cache_ttl')?.[tier] || 3600000
    };
  }
  
  private async getUserTier(userId: string): Promise<string> {
    // This would typically come from user subscription service
    // For now, return a default
    return 'basic';
  }
}

// MARK: - Types and Interfaces

export interface DailyUsageStats {
  TIER_1: number;
  TIER_2: number;
  TIER_3: number;
  totalCost: number;
  resetTime: number;
}

export interface AIRoutingDecision {
  tier: string;
  model: string;
  availableModels: string[];
  costPerRequest: number;
  isFallback: boolean;
  reason?: string;
  cacheTTL: number;
}

export interface AIRoutingPreferences {
  preferredTier?: string;
  forceHighQuality?: boolean;
  allowFallback?: boolean;
  maxCostPerRequest?: number;
}

export interface CachedAIResponse {
  response: any;
  tier: string;
  timestamp: number;
  ttl: number;
}

export type AIRequestType = 'meal_planning' | 'chat' | 'health_analysis' | 'fitness_planning';
export type AIComplexity = 'simple' | 'complex' | 'premium';