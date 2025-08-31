# HealthCoachAI Infrastructure as Code

This directory contains Infrastructure as Code (IaC) templates for deploying HealthCoachAI across different cloud providers and environments.

## 🏗️ Architecture Overview

### Supported Deployment Options

- **Cloud Providers**: AWS, Google Cloud Platform, Azure
- **Container Orchestration**: Kubernetes, Docker Compose
- **Serverless**: AWS Lambda, Google Cloud Functions, Azure Functions
- **Monitoring**: Prometheus, Grafana, OpenTelemetry

## 📁 Directory Structure

```
infra/
├── aws/                    # AWS deployment templates
│   ├── terraform/          # Terraform modules
│   ├── cloudformation/     # CloudFormation templates
│   └── cdk/               # AWS CDK stacks
├── gcp/                   # Google Cloud Platform
│   ├── terraform/          # Terraform modules
│   └── deployment-manager/ # Deployment Manager
├── azure/                 # Microsoft Azure
│   ├── terraform/          # Terraform modules
│   └── arm/               # ARM templates
├── kubernetes/            # Kubernetes manifests
│   ├── manifests/         # Raw YAML manifests
│   ├── helm/              # Helm charts
│   └── kustomize/         # Kustomization files
├── docker/                # Docker compose files
├── monitoring/            # Observability stack
└── scripts/               # Deployment scripts
```

## 🚀 Quick Start

### Local Development
```bash
# Start local development environment
docker-compose -f docker/docker-compose.dev.yml up -d

# Or using scripts
./scripts/setup-local-dev.sh
```

### Production Deployment

#### AWS (Terraform)
```bash
cd infra/aws/terraform/environments/production
terraform init
terraform plan
terraform apply
```

#### GCP (Terraform)
```bash
cd infra/gcp/terraform/environments/production
terraform init
terraform plan
terraform apply
```

#### Kubernetes
```bash
# Using Helm
helm install healthcoachai ./kubernetes/helm/healthcoachai \
  --namespace healthcoachai \
  --create-namespace \
  --values kubernetes/helm/healthcoachai/values.production.yaml

# Using kubectl
kubectl apply -k kubernetes/kustomize/overlays/production
```

## 🔧 Configuration

### Environment Variables
All infrastructure components use consistent environment variable patterns:

- `ENVIRONMENT`: dev, staging, production
- `REGION`: Deployment region (e.g., us-east-1, us-central1)
- `PROJECT_NAME`: healthcoachai
- `DOMAIN`: Your domain name

### Secrets Management
- **AWS**: AWS Secrets Manager + Parameter Store
- **GCP**: Google Secret Manager
- **Azure**: Azure Key Vault
- **Kubernetes**: Kubernetes Secrets + External Secrets Operator

## 📋 Components

### Core Services
- **Backend API**: NestJS application
- **Web Application**: Next.js frontend
- **Database**: PostgreSQL with pgvector
- **Cache**: Redis
- **Message Queue**: Redis/RabbitMQ
- **Object Storage**: S3-compatible storage

### AI & ML
- **Vector Database**: pgvector extension
- **Model Serving**: OpenAI, Anthropic, Vertex AI integrations
- **Workflow Orchestration**: n8n

### Monitoring & Observability
- **Metrics**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Tracing**: Jaeger/Zipkin
- **APM**: OpenTelemetry
- **Alerting**: AlertManager + PagerDuty

### Security
- **WAF**: Cloud provider WAF + rate limiting
- **DDoS Protection**: Cloud provider DDoS protection
- **Certificate Management**: Let's Encrypt + cert-manager
- **Network Security**: VPC, security groups, firewall rules

## 🛡️ Security Best Practices

- All secrets managed via cloud provider secret management
- Network isolation using VPCs and security groups
- TLS termination at load balancer
- Database encryption at rest and in transit
- Regular security scanning and updates
- RBAC for all services

## 📊 Monitoring & Alerting

### Key Metrics
- API response times and error rates
- Database connection pool and query performance
- AI provider costs and usage
- User journey completion rates
- Security events and anomalies

### Alerts
- High error rates or latency
- Database connectivity issues
- AI provider cost thresholds
- Security incidents
- Resource utilization limits

## 🔄 CI/CD Integration

Infrastructure deployment is integrated with GitHub Actions:

- **Infrastructure Changes**: Automatically validated with `terraform plan`
- **Staging Deployment**: Auto-deploy to staging on develop branch
- **Production Deployment**: Manual approval required for production
- **Rollback**: Automated rollback on deployment failure

## 📚 Documentation

- [AWS Deployment Guide](aws/README.md)
- [GCP Deployment Guide](gcp/README.md)
- [Azure Deployment Guide](azure/README.md)
- [Kubernetes Guide](kubernetes/README.md)
- [Monitoring Setup](monitoring/README.md)
- [Security Hardening](docs/security-hardening.md)

## 🆘 Support

For infrastructure-related issues:
1. Check the troubleshooting guides in each platform directory
2. Review monitoring dashboards and logs
3. Consult the runbooks in the monitoring directory
4. Contact the DevOps team

## 🔄 Updates

This infrastructure is designed to be:
- **Version Controlled**: All changes tracked in Git
- **Reproducible**: Consistent deployments across environments
- **Scalable**: Auto-scaling based on demand
- **Maintainable**: Clear documentation and standard practices

For infrastructure updates, follow the change management process outlined in [CONTRIBUTING.md](../CONTRIBUTING.md).