# Deployment Guide - Hong Kong Church PWA

## 🚀 Vercel Deployment Setup

### Step 1: Vercel Account Setup

1. **Create Vercel Account**
   - Visit [vercel.com](https://vercel.com)
   - Sign up using GitHub account (recommended)
   - Complete account verification

2. **Install Vercel CLI (Optional)**
   ```bash
   npm i -g vercel
   vercel login
   ```

### Step 2: GitHub Repository Setup

1. **Create New Repository**
   ```bash
   # If not already in a git repository
   git init
   git add .
   git commit -m "Initial commit - Hong Kong Church PWA foundation"
   
   # Create GitHub repository and push
   gh repo create hong-kong-church-pwa --private --push
   ```

2. **Repository Settings**
   - Enable branch protection for `main`
   - Require PR reviews for merges
   - Enable automatic dependency updates

### Step 3: Vercel Project Configuration

1. **Import Project to Vercel**
   - Go to Vercel Dashboard
   - Click "New Project"
   - Import from GitHub repository
   - Select `hong-kong-church-pwa`

2. **Configure Build Settings**
   ```json
   {
     "framework": "nextjs",
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "installCommand": "npm ci",
     "nodeVersion": "20.x"
   }
   ```

3. **Set Environment Variables**

   **Required for Production:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   NEXT_PUBLIC_APP_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-app-url.vercel.app
   NODE_ENV=production
   ```

   **Optional for Production:**
   ```bash
   NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
   VERCEL_ANALYTICS_ID=your_vercel_analytics_id
   NEXT_PUBLIC_ENABLE_ANALYTICS=true
   NEXT_PUBLIC_ENABLE_PWA=true
   NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
   ```

### Step 4: Regional Configuration

1. **Set Deployment Regions**
   - Primary: Hong Kong (`hkg1`)
   - Fallback: Singapore (`sin1`), Sydney (`syd1`)

2. **Configure in Vercel Dashboard**
   - Go to Project Settings → Functions
   - Set Region: Hong Kong
   - Enable additional regions for redundancy

### Step 5: GitHub Actions Secrets

Add these secrets to GitHub repository:

```bash
# Go to GitHub repository → Settings → Secrets and variables → Actions

VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id  
VERCEL_PROJECT_ID=your_project_id
```

**To get Vercel tokens:**
```bash
vercel login
vercel link  # Link project
cat .vercel/project.json  # Get org and project IDs
```

## 🎛️ Edge Config Setup

### Step 1: Create Edge Config

1. **Via Vercel Dashboard**
   - Go to Storage → Edge Config
   - Create new Edge Config: `hong-kong-church-config`
   - Note the Connection String

2. **Via CLI**
   ```bash
   vercel edge-config create hong-kong-church-config
   ```

### Step 2: Configure Feature Flags

```bash
# Upload initial configuration
vercel edge-config set-value hong-kong-church-config featureFlags '{
  "enableGoogleAuth": true,
  "enableAppleAuth": true,
  "enableEmailAuth": true,
  "enableOfflineReading": true,
  "enablePushNotifications": true,
  "enableAnalytics": true,
  "enableEvents": false,
  "enableGroups": false,
  "enableAIAssistant": false
}'
```

### Step 3: Add Edge Config Environment Variable

```bash
# In Vercel Dashboard
EDGE_CONFIG=https://edge-config.vercel.com/your-config-id?token=your-token
```

## 🔄 CI/CD Pipeline Configuration

### GitHub Actions Workflow

The CI/CD pipeline includes:

1. **Pull Request Checks**
   - Lint and TypeScript validation
   - Unit tests with coverage
   - Security audit
   - Build verification
   - E2E tests (Playwright)
   - Lighthouse performance audit

2. **Preview Deployments**
   - Automatic preview for all PRs
   - Comment with preview URL
   - Performance regression detection

3. **Production Deployment**
   - Triggered on merge to `main`
   - Full test suite execution
   - Security validation
   - Automatic deployment to production
   - Post-deployment verification

### Environment-Specific Configurations

**Development Environment:**
```bash
# .env.local
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_MOCK_API=true
```

**Staging Environment:**
```bash
# Vercel Preview Environment
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_MOCK_API=false
```

**Production Environment:**
```bash
# Vercel Production Environment  
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_MOCK_API=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## 📊 Monitoring and Observability

### Vercel Analytics

1. **Enable Analytics**
   ```bash
   # In Vercel Dashboard
   VERCEL_ANALYTICS_ID=your_analytics_id
   NEXT_PUBLIC_ENABLE_ANALYTICS=true
   ```

2. **Real User Monitoring**
   - Core Web Vitals tracking
   - Page load performance
   - User interaction metrics
   - Error tracking

### Error Monitoring (Sentry)

1. **Setup Sentry Project**
   ```bash
   npm install @sentry/nextjs
   ```

2. **Configure Sentry**
   ```bash
   # Environment variables
   SENTRY_DSN=https://your-dsn@sentry.io/project
   SENTRY_ORG=your-org
   SENTRY_PROJECT=hong-kong-church-pwa
   SENTRY_AUTH_TOKEN=your-auth-token
   ```

### Performance Monitoring

1. **Lighthouse CI**
   - Automated performance audits
   - Accessibility testing
   - SEO optimization checks
   - PWA compliance validation

2. **Performance Budgets**
   ```json
   {
     "lcp": 2500,
     "fid": 100,
     "cls": 0.1,
     "fcp": 1800,
     "si": 3000
   }
   ```

## 🔒 Security Configuration

### Content Security Policy

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' https://*.supabase.co;
    `.replace(/\\s{2,}/g, ' ').trim()
  }
];
```

### Environment Secrets Management

1. **Sensitive Variables**
   - Store in Vercel Environment Variables
   - Never commit to repository
   - Use different keys for different environments

2. **API Keys Rotation**
   - Regular rotation schedule
   - Automated key management
   - Zero-downtime updates

## 🚨 Disaster Recovery

### Backup Strategy

1. **Code Repository**
   - GitHub as primary source
   - Automated backups
   - Branch protection rules

2. **Database Backups** (When Supabase is integrated)
   - Daily automated backups
   - Point-in-time recovery
   - Cross-region replication

### Rollback Procedures

1. **Automatic Rollback**
   ```yaml
   # GitHub Actions
   - name: Health Check
     run: |
       sleep 30
       curl -f https://your-app.vercel.app/api/health || exit 1
   
   - name: Rollback on Failure
     if: failure()
     run: vercel rollback --yes
   ```

2. **Manual Rollback**
   ```bash
   # Via CLI
   vercel rollback
   
   # Via Dashboard
   # Go to Deployments → Previous deployment → Promote to Production
   ```

## 📈 Performance Optimization

### Edge Caching

```javascript
// next.config.ts
module.exports = {
  headers: async () => {
    return [
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  }
};
```

### Image Optimization

```typescript
// next.config.ts
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['your-cdn-domain.com']
  }
};
```

## 🔧 Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   vercel --prod --force
   
   # Check build logs
   vercel logs your-deployment-url
   ```

2. **Environment Variable Issues**
   ```bash
   # Verify variables
   vercel env ls
   
   # Pull environment variables
   vercel env pull .env.local
   ```

3. **Performance Issues**
   ```bash
   # Analyze bundle
   npm run build -- --analyze
   
   # Check Core Web Vitals
   vercel logs --follow
   ```

### Support Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **GitHub Actions**: [docs.github.com/actions](https://docs.github.com/actions)
- **Vercel Support**: Create ticket in Vercel dashboard

---

This deployment guide ensures a robust, scalable, and maintainable deployment pipeline for the Hong Kong Church PWA.