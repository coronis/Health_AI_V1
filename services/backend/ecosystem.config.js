module.exports = {
  apps: [
    {
      name: 'healthcoachai',
      script: './dist/main.js',
      cwd: './services/backend',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster', // Cluster mode for better performance
      
      // Environment configuration
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      
      // Resource limits
      max_memory_restart: '2G',
      max_restarts: 10,
      min_uptime: '10s',
      
      // Logging
      log_file: '/var/log/healthcoachai/combined.log',
      out_file: '/var/log/healthcoachai/out.log',
      error_file: '/var/log/healthcoachai/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Monitoring
      watch: false, // Disable in production
      ignore_watch: ['node_modules', 'logs', '*.log'],
      
      // Auto-restart configuration
      autorestart: true,
      restart_delay: 4000,
      
      // Health check
      health_check_http: {
        port: 3000,
        path: '/health',
        interval: 30000, // 30 seconds
        timeout: 10000,  // 10 seconds
        retries: 3,
      },
      
      // Performance monitoring
      pmx: true,
      
      // Source map support
      source_map_support: false, // Disable in production for performance
      
      // Instance configuration
      instance_var: 'INSTANCE_ID',
      
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 8000,
      
      // Environment variables from file
      env_file: '.env.production',
      
      // Advanced configuration
      node_args: [
        '--max-old-space-size=2048',
        '--gc-interval=100',
        '--max-executable-size=192'
      ],
      
      // Cron-based restart (optional)
      cron_restart: '0 2 * * *', // Restart daily at 2 AM
      
      // Error handling
      max_restarts: 15,
      restart_delay: 4000,
      
      // Monitoring and alerting
      monitoring: {
        http: true,
        https: false,
        port: 3001, // Monitoring port
      },
      
      // Load balancing
      increment_var: 'PORT',
      
      // Post-deploy hooks
      post_update: ['npm install', 'npm run build'],
      
      // Pre-deploy hooks
      pre_setup: 'npm install',
      
      // Custom environment variables for production
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        
        // Performance optimizations
        NODE_OPTIONS: '--max-old-space-size=2048',
        UV_THREADPOOL_SIZE: 16,
        
        // Debugging (disabled in production)
        DEBUG: '',
        
        // Cluster configuration
        WEB_CONCURRENCY: 'max',
        
        // Application-specific
        API_VERSION: 'v1',
        API_PREFIX: 'api',
        
        // Security
        TRUST_PROXY: '1',
        
        // Logging
        LOG_LEVEL: 'info',
        LOG_FORMAT: 'json',
        
        // Rate limiting
        RATE_LIMIT_ENABLED: 'true',
        
        // Cache
        CACHE_ENABLED: 'true',
        
        // Features
        SWAGGER_ENABLED: 'false', // Disable Swagger in production
        
        // Database
        DATABASE_POOL_SIZE: '10',
        DATABASE_CONNECTION_TIMEOUT: '60000',
        
        // Redis
        REDIS_POOL_SIZE: '10',
        
        // AI Services
        AI_TIMEOUT: '30000',
        AI_RETRY_COUNT: '3',
        
        // File uploads
        MAX_FILE_SIZE: '10485760', // 10MB
        
        // Session
        SESSION_SECRET: process.env.JWT_SECRET,
      },
      
      // Development environment
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
        
        // Development optimizations
        NODE_OPTIONS: '--max-old-space-size=1024',
        
        // Debugging
        DEBUG: 'app:*',
        
        // Logging
        LOG_LEVEL: 'debug',
        LOG_FORMAT: 'pretty',
        
        // Features
        SWAGGER_ENABLED: 'true',
        
        // Hot reload
        WATCH: 'true',
        
        // Database
        DATABASE_SYNCHRONIZE: 'true',
        DATABASE_LOGGING: 'true',
      },
      
      // Staging environment
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3000,
        
        // Staging-specific configuration
        LOG_LEVEL: 'debug',
        SWAGGER_ENABLED: 'true',
        
        // Database
        DATABASE_SYNCHRONIZE: 'false',
        DATABASE_LOGGING: 'false',
        
        // AI Services (use test/staging endpoints)
        AI_RATE_LIMIT_ENABLED: 'false',
      }
    }
  ],
  
  // Deployment configuration
  deploy: {
    production: {
      user: 'healthcoachai',
      host: ['your-production-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:coronis/Health_AI_V1.git',
      path: '/var/www/healthcoachai',
      'post-deploy': [
        'cd services/backend',
        'npm install',
        'npm run build',
        'pm2 reload ecosystem.config.js --env production',
        'pm2 save'
      ].join(' && '),
      'pre-setup': [
        'cd services/backend',
        'npm install'
      ].join(' && '),
      env: {
        NODE_ENV: 'production'
      }
    },
    
    staging: {
      user: 'healthcoachai',
      host: ['your-staging-server.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:coronis/Health_AI_V1.git',
      path: '/var/www/healthcoachai-staging',
      'post-deploy': [
        'cd services/backend',
        'npm install',
        'npm run build',
        'pm2 reload ecosystem.config.js --env staging',
        'pm2 save'
      ].join(' && '),
      env: {
        NODE_ENV: 'staging'
      }
    }
  }
};