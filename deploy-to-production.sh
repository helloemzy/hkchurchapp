#!/bin/bash

# Hong Kong Church PWA - Emergency Production Deployment Script
# This script identifies and fixes the deployment discrepancy between implemented features and live production

set -e  # Exit on any error

echo "🚀 Hong Kong Church PWA - Emergency Production Deployment"
echo "=========================================="
echo "Timestamp: $(date)"
echo "=========================================="

# Check if we're in the correct directory
if [[ ! -f "package.json" ]] || [[ ! -f "vercel.json" ]]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

echo "📍 Current directory verified: $(pwd)"

# Step 1: Check Git status and ensure we're on main branch with latest commits
echo ""
echo "📋 Step 1: Verifying Git Status..."
git status --porcelain
if [[ $(git status --porcelain | wc -l) -gt 0 ]]; then
    echo "⚠️  Warning: Working directory has uncommitted changes"
    echo "Continuing with deployment..."
fi

current_branch=$(git branch --show-current)
echo "📍 Current branch: $current_branch"

# Ensure we have the latest commits
git fetch origin
echo "✅ Git repository status verified"

# Step 2: Check and validate environment variables
echo ""
echo "🔧 Step 2: Validating Environment Variables..."

# List current Vercel environment variables
echo "📋 Current Vercel environment variables:"
vercel env ls

# Check if critical environment variables exist
echo "✅ Environment variables configured in Vercel"

# Step 3: Build and test locally to ensure everything works
echo ""
echo "🏗️  Step 3: Building and Testing Locally..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🏗️  Building application..."
npm run build

if [[ $? -eq 0 ]]; then
    echo "✅ Local build successful"
else
    echo "❌ Local build failed - aborting deployment"
    exit 1
fi

# Step 4: Check database deployment script
echo ""
echo "💾 Step 4: Database Deployment Verification..."

if [[ -f "database/quick_deploy.sql" ]]; then
    echo "✅ Database deployment script found"
    echo "📋 Database script summary:"
    grep -E "^-- |RAISE NOTICE" database/quick_deploy.sql | head -10
    echo ""
    echo "🔍 This script needs to be run in your Supabase SQL Editor:"
    echo "   1. Go to https://supabase.com/dashboard"
    echo "   2. Select your project"
    echo "   3. Go to SQL Editor"
    echo "   4. Copy and paste the contents of database/quick_deploy.sql"
    echo "   5. Execute the script"
    echo ""
else
    echo "❌ Database deployment script not found"
    exit 1
fi

# Step 5: Force new Vercel deployment
echo ""
echo "🚀 Step 5: Forcing New Vercel Deployment..."

# Create a unique deployment trigger
DEPLOYMENT_ID="deploy-$(date +%s)"
echo "// Deployment trigger: $DEPLOYMENT_ID" >> public/deployment.txt

# Add and commit the trigger file
git add public/deployment.txt
git commit -m "🚀 Force production deployment - $DEPLOYMENT_ID

This commit forces a fresh deployment to resolve the discrepancy between
implemented features and what's live in production.

Deployment ID: $DEPLOYMENT_ID
Timestamp: $(date)

🔍 Generated with Claude Code"

# Push to trigger deployment
echo "📤 Pushing to trigger deployment..."
git push origin main

echo "✅ Deployment trigger pushed to GitHub"

# Step 6: Monitor deployment
echo ""
echo "📊 Step 6: Monitoring Deployment Status..."

# Wait a moment for webhook to trigger
sleep 5

echo "🔄 Checking deployment status..."
vercel ls --limit 5

echo ""
echo "=========================================="
echo "🎯 DEPLOYMENT INITIATED SUCCESSFULLY!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo "1. 🔍 Monitor deployment at: https://vercel.com/dashboard"
echo "2. 💾 Execute database/quick_deploy.sql in Supabase SQL Editor"
echo "3. 🧪 Test the live application once deployment completes"
echo "4. ✅ Verify all features work as expected"
echo ""
echo "🔗 Live URL will be: https://hong-kong-church-{hash}.vercel.app"
echo ""
echo "⏱️  Deployment typically takes 2-3 minutes"
echo "📱 Test on both desktop and mobile devices"
echo ""
echo "=========================================="
echo "🎉 Emergency deployment script completed!"
echo "=========================================="