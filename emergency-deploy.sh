#!/bin/bash

# Emergency Deployment Recovery Script
# Run this if your Vercel deployment is completely broken

echo "🚨 Emergency Deployment Recovery for Hong Kong Church PWA"
echo "========================================================="

# Check if we're in the right directory
if [ ! -f "next.config.ts" ]; then
    echo "❌ Error: Run this script from your project root directory"
    exit 1
fi

echo "📍 Current directory: $(pwd)"
echo "🔍 Checking project files..."

# Verify critical files exist
CRITICAL_FILES=("next.config.ts" "package.json" "src/app/layout.tsx" "vercel.json")
MISSING_FILES=()

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -ne 0 ]; then
    echo "❌ Missing critical files:"
    printf '   • %s\n' "${MISSING_FILES[@]}"
    echo "   Please ensure all files are committed to Git"
    exit 1
fi

echo "✅ All critical files present"

# Check Git status
echo "📋 Checking Git status..."
git status --porcelain

UNCOMMITTED=$(git status --porcelain | wc -l)
if [ $UNCOMMITTED -gt 0 ]; then
    echo "⚠️  Warning: You have uncommitted changes"
    echo "   Consider committing them first:"
    echo "   git add ."
    echo "   git commit -m 'Pre-deployment commit'"
fi

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Warning: You're on branch '$CURRENT_BRANCH', not 'main'"
    echo "   Vercel typically deploys from 'main' branch"
fi

# Force push to trigger deployment
echo "🚀 Triggering fresh deployment..."
git add .
git commit --allow-empty -m "🚨 Emergency deployment trigger - $(date)"

echo "📤 Pushing to GitHub..."
if git push origin main; then
    echo "✅ Successfully pushed to GitHub"
    echo ""
    echo "🎯 Next Steps:"
    echo "1. Go to https://vercel.com/dashboard"
    echo "2. Check if your project exists and is building"
    echo "3. If no project exists:"
    echo "   - Click 'New Project'"
    echo "   - Import your GitHub repository"
    echo "   - Use Next.js framework preset"
    echo "4. Wait 2-3 minutes for deployment"
    echo "5. Run: node deployment-verification.js YOUR_DOMAIN"
    echo ""
    echo "🔗 Your deployment URL will be something like:"
    echo "   https://hkchurchapp.vercel.app"
    echo "   or https://hong-kong-church-pwa.vercel.app"
else
    echo "❌ Failed to push to GitHub"
    echo "   Check your Git configuration and network connection"
    exit 1
fi

echo ""
echo "✅ Emergency deployment recovery completed!"
echo "   Monitor your Vercel dashboard for build progress"