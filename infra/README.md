# Infrastructure Documentation

This directory contains all infrastructure-as-code and deployment configurations for HealthCoachAI.

## Structure

- `terraform/` - Infrastructure provisioning with Terraform
- `kubernetes/` - Kubernetes manifests and Helm charts
- `docker/` - Docker configurations and compose files

## Environments

- **Development**: Local development with Docker Compose
- **Staging**: Kubernetes cluster for testing
- **Production**: Production Kubernetes cluster with high availability

## Getting Started

### Local Development

```bash
cd docker
docker-compose up -d
```

### Terraform Deployment

```bash
cd terraform/environments/staging
terraform init
terraform plan
terraform apply
```

### Kubernetes Deployment

```bash
cd kubernetes
kubectl apply -f namespaces/
kubectl apply -f configmaps/
kubectl apply -f secrets/
kubectl apply -f deployments/
```

## Security

- All secrets managed through external secret managers
- Network policies for service isolation
- Regular security scans and updates
- Backup and disaster recovery procedures
