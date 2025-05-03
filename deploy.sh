#!/bin/bash

# Set your GCP project ID
PROJECT_ID="your-project-id"

# Set your region and zone
REGION="us-central1"
ZONE="us-central1-a"

# Login to GCP
echo "Logging into GCP..."
gcloud auth login

echo "Setting project configuration..."
gcloud config set project $PROJECT_ID
gcloud config set compute/region $REGION
gcloud config set compute/zone $ZONE

# Enable required APIs
echo "Enabling required APIs..."
gcloud services enable container.googleapis.com

# Build and push backend
echo "Building and pushing backend..."
docker build -t gcr.io/$PROJECT_ID/artsy-backend:latest .
docker push gcr.io/$PROJECT_ID/artsy-backend:latest

# Build and push frontend
echo "Building and pushing frontend..."
cd frontend
docker build -t gcr.io/$PROJECT_ID/artsy-frontend:latest .
docker push gcr.io/$PROJECT_ID/artsy-frontend:latest
cd ..

# Create GKE cluster
echo "Creating GKE cluster..."
gcloud container clusters create artsy-cluster --num-nodes=2

echo "Getting cluster credentials..."
gcloud container clusters get-credentials artsy-cluster

# Deploy to Kubernetes
echo "Deploying to Kubernetes..."
kubectl apply -f deployment.yaml

# Get external IP
echo "Waiting for external IP..."
while true; do
    IP=$(kubectl get service artsy-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    if [ -n "$IP" ]; then
        echo "Application is available at: http://$IP"
        break
    fi
    echo "Waiting for IP..."
    sleep 5
done
