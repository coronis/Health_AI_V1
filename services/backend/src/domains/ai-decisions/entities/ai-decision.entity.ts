import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TaskType {
  HEALTH_REPORT_ANALYSIS = 'health_report_analysis',
  MEAL_PLAN_GENERATION = 'meal_plan_generation',
  FITNESS_PLAN_GENERATION = 'fitness_plan_generation',
  NUTRITION_CALCULATION = 'nutrition_calculation',
  RECIPE_RECOMMENDATION = 'recipe_recommendation',
  CHAT_RESPONSE = 'chat_response',
  HEALTH_INSIGHTS = 'health_insights',
  GOAL_TRACKING = 'goal_tracking',
}

export enum AIProvider {
  OPENAI_GPT4 = 'openai_gpt4',
  OPENAI_GPT35 = 'openai_gpt35',
  ANTHROPIC_CLAUDE = 'anthropic_claude',
  GOOGLE_GEMINI = 'google_gemini',
  AZURE_OPENAI = 'azure_openai',
  LOCAL_MODEL = 'local_model',
  FALLBACK_RULE_BASED = 'fallback_rule_based',
}

export enum AccuracyTier {
  LEVEL_1 = 'level_1', // Highest accuracy for health reports
  LEVEL_2 = 'level_2', // Standard accuracy for general tasks
  LEVEL_3 = 'level_3', // Lower accuracy for less critical tasks
}

export enum DecisionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('ai_decisions')
@Index(['taskType'])
@Index(['provider'])
@Index(['accuracyTier'])
@Index(['status'])
@Index(['userId'])
@Index(['createdAt'])
export class AIDecision {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId?: string;

  @Column({
    type: 'enum',
    enum: TaskType,
    name: 'task_type',
  })
  taskType: TaskType;

  @Column({
    type: 'enum',
    enum: AIProvider,
  })
  provider: AIProvider;

  @Column({
    type: 'enum',
    enum: AccuracyTier,
    name: 'accuracy_tier',
  })
  accuracyTier: AccuracyTier;

  @Column({
    type: 'enum',
    enum: DecisionStatus,
    default: DecisionStatus.PENDING,
  })
  status: DecisionStatus;

  // Request details
  @Column({ type: 'json' })
  requestPayload: Record<string, any>;

  @Column({ name: 'request_size_bytes' })
  requestSizeBytes: number;

  @Column({ name: 'model_version', length: 100 })
  modelVersion: string;

  @Column({ name: 'model_temperature', type: 'decimal', precision: 3, scale: 2, nullable: true })
  modelTemperature?: number;

  @Column({ name: 'max_tokens', nullable: true })
  maxTokens?: number;

  // Response details
  @Column({ type: 'json', nullable: true })
  responsePayload?: Record<string, any>;

  @Column({ name: 'response_size_bytes', nullable: true })
  responseSizeBytes?: number;

  @Column({ name: 'tokens_used', nullable: true })
  tokensUsed?: number;

  @Column({ name: 'input_tokens', nullable: true })
  inputTokens?: number;

  @Column({ name: 'output_tokens', nullable: true })
  outputTokens?: number;

  // Timing and performance
  @Column({ name: 'processing_time_ms', nullable: true })
  processingTimeMs?: number;

  @Column({ name: 'queue_time_ms', nullable: true })
  queueTimeMs?: number;

  @Column({ name: 'total_time_ms', nullable: true })
  totalTimeMs?: number;

  // Cost tracking
  @Column({ name: 'cost_usd', type: 'decimal', precision: 10, scale: 6, nullable: true })
  costUsd?: number;

  @Column({ name: 'cost_currency', length: 3, default: 'USD' })
  costCurrency: string;

  // Quality and accuracy
  @Column({ name: 'confidence_score', type: 'decimal', precision: 5, scale: 4, nullable: true })
  confidenceScore?: number;

  @Column({ name: 'quality_score', type: 'decimal', precision: 5, scale: 4, nullable: true })
  qualityScore?: number;

  @Column({ name: 'accuracy_validated', default: false })
  accuracyValidated: boolean;

  @Column({ name: 'human_review_required', default: false })
  humanReviewRequired: boolean;

  // Caching and optimization
  @Column({ name: 'cache_key', length: 255, nullable: true })
  cacheKey?: string;

  @Column({ name: 'cache_hit', default: false })
  cacheHit: boolean;

  @Column({ name: 'retention_flag', default: false })
  retentionFlag: boolean; // Whether to retain for training/analysis

  // Privacy and data handling
  @Column({ name: 'pii_detected', default: false })
  piiDetected: boolean;

  @Column({ name: 'data_pseudonymized', default: false })
  dataPseudonymized: boolean;

  @Column({ name: 'zero_retention', default: false })
  zeroRetention: boolean; // No-log flag for sensitive data

  @Column({ name: 'data_residency_region', length: 10, default: 'IN' })
  dataResidencyRegion: string;

  // Error handling
  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'error_code', length: 50, nullable: true })
  errorCode?: string;

  @Column({ name: 'retry_count', default: 0 })
  retryCount: number;

  @Column({ name: 'fallback_used', default: false })
  fallbackUsed: boolean;

  // Quota and rate limiting
  @Column({ name: 'quota_consumed', type: 'decimal', precision: 10, scale: 4, default: 1.0 })
  quotaConsumed: number;

  @Column({ name: 'rate_limit_hit', default: false })
  rateLimitHit: boolean;

  // Provenance and audit
  @Column({ name: 'request_id', length: 100, nullable: true })
  requestId?: string;

  @Column({ name: 'session_id', length: 100, nullable: true })
  sessionId?: string;

  @Column({ name: 'user_agent', length: 500, nullable: true })
  userAgent?: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: 'api_version', length: 20, default: 'v1' })
  apiVersion: string;

  // Scheduling and workflow context
  @Column({ name: 'workflow_id', length: 100, nullable: true })
  workflowId?: string; // n8n workflow reference

  @Column({ name: 'execution_id', length: 100, nullable: true })
  executionId?: string; // n8n execution reference

  @Column({ name: 'scheduled_task', default: false })
  scheduledTask: boolean;

  @Column({ name: 'batch_job_id', length: 100, nullable: true })
  batchJobId?: string;

  // Metadata
  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  // Relationships
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  // Computed properties
  get isHighAccuracy(): boolean {
    return this.accuracyTier === AccuracyTier.LEVEL_1;
  }

  get isCompleted(): boolean {
    return this.status === DecisionStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return this.status === DecisionStatus.FAILED;
  }

  get costPerToken(): number {
    if (!this.costUsd || !this.tokensUsed || this.tokensUsed === 0) return 0;
    return this.costUsd / this.tokensUsed;
  }

  get responseTimePerToken(): number {
    if (!this.processingTimeMs || !this.tokensUsed || this.tokensUsed === 0) return 0;
    return this.processingTimeMs / this.tokensUsed;
  }

  // Methods
  markCompleted(
    responseData: Record<string, any>,
    metrics: {
      processingTimeMs: number;
      tokensUsed?: number;
      costUsd?: number;
      confidenceScore?: number;
    },
  ): void {
    this.status = DecisionStatus.COMPLETED;
    this.completedAt = new Date();
    this.responsePayload = responseData;
    this.processingTimeMs = metrics.processingTimeMs;
    this.totalTimeMs = (this.queueTimeMs || 0) + metrics.processingTimeMs;

    if (metrics.tokensUsed) this.tokensUsed = metrics.tokensUsed;
    if (metrics.costUsd) this.costUsd = metrics.costUsd;
    if (metrics.confidenceScore) this.confidenceScore = metrics.confidenceScore;
  }

  markFailed(errorMessage: string, errorCode?: string): void {
    this.status = DecisionStatus.FAILED;
    this.errorMessage = errorMessage;
    this.errorCode = errorCode;
    this.completedAt = new Date();
  }

  incrementRetry(): void {
    this.retryCount += 1;
  }

  shouldRetry(maxRetries = 3): boolean {
    return (
      this.retryCount < maxRetries &&
      (this.status === DecisionStatus.FAILED || this.status === DecisionStatus.PENDING)
    );
  }
}
