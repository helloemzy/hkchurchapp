# Hong Kong Church PWA

A Next.js-based Progressive Web Application designed for Hong Kong's Christian community, providing multilingual Bible study, events, and fellowship features.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- npm or yarn
- Git

### Development Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd hong-kong-church-pwa
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Application**
   - Local: http://localhost:3000
   - Network: Check terminal for network address

## 🏗️ Project Structure

```
hong-kong-church-pwa/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── lib/                   # Utility libraries
│   │   └── edge-config.ts     # Vercel Edge Config utilities
│   └── __tests__/             # Unit tests
├── tests/
│   └── e2e/                   # End-to-end tests
├── public/                    # Static assets
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI/CD
├── .env.example              # Environment variables template
├── .env.local               # Local environment (not committed)
├── vercel.json              # Vercel deployment configuration
├── next.config.ts           # Next.js configuration
├── package.json             # Dependencies and scripts
├── playwright.config.ts     # E2E testing configuration
├── jest.config.js          # Unit testing configuration
└── tsconfig.json           # TypeScript configuration
```

## 🔧 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |

## 🌍 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   - Import project to Vercel
   - Connect GitHub repository
   - Configure environment variables

2. **Environment Variables**
   Set these in Vercel dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   VERCEL_TOKEN=your_vercel_token
   VERCEL_ORG_ID=your_org_id
   VERCEL_PROJECT_ID=your_project_id
   ```

3. **Deployment Configuration**
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm ci`
   - Node Version: 20.x

### Region Configuration
The app is optimized for Hong Kong deployment with these regions:
- Primary: `hkg1` (Hong Kong)
- Fallback: `sin1` (Singapore), `syd1` (Sydney)

## 🧪 Testing

### Unit Tests (Jest)
```bash
npm run test                # Run once
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report
```

### E2E Tests (Playwright)
```bash
npx playwright test        # Run E2E tests
npx playwright test --ui   # Interactive mode
npx playwright show-report # View test report
```

### Lighthouse Performance Audit
```bash
npm install -g @lhci/cli
lhci autorun
```

## 🚀 CI/CD Pipeline

The GitHub Actions workflow automatically:

1. **Code Quality**
   - Runs ESLint and TypeScript checks
   - Executes unit tests with coverage
   - Performs security audits

2. **Testing**
   - Runs E2E tests on PR
   - Lighthouse performance audit
   - Cross-browser testing

3. **Deployment**
   - Preview deployments for PRs
   - Production deployment on main branch
   - Automatic rollback on failure

## 🎛️ Feature Flags

The application uses Vercel Edge Config for feature flags:

### Available Flags
- `enableGoogleAuth` - Google OAuth authentication
- `enableAppleAuth` - Apple ID authentication
- `enableOfflineReading` - Offline Bible reading
- `enablePushNotifications` - Push notifications
- `enableAnalytics` - Analytics tracking
- `enableDebugMode` - Debug information

### Usage
```typescript
import { isFeatureEnabled } from '@/lib/edge-config';

const enabled = await isFeatureEnabled('enableGoogleAuth');
```

## 🌐 Internationalization

Supports three languages:
- English (`en`)
- Traditional Chinese (`zh-TW`)
- Simplified Chinese (`zh-CN`)

Language detection is automatic based on browser preferences.

## 📱 PWA Features

- **Offline Support**: Works without internet connection
- **Install Prompt**: Add to home screen
- **Push Notifications**: Event reminders and updates
- **Background Sync**: Sync when connection restored
- **Responsive Design**: Mobile-first approach

## 🔒 Security

- Content Security Policy (CSP) headers
- XSS protection
- CSRF protection
- Secure authentication with Supabase
- Rate limiting on APIs
- Input validation and sanitization

## 📊 Performance

Target metrics:
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1
- Performance Score: > 90
- Accessibility Score: > 95

## 🐛 Debugging

### Development Debug Mode
Set `NEXT_PUBLIC_DEBUG_MODE=true` in `.env.local` to enable:
- Console logging
- Performance metrics
- Error details
- API call tracing

### Common Issues

**Build Errors**
```bash
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

**Type Errors**
```bash
npx tsc --noEmit
```

**Lint Errors**
```bash
npm run lint -- --fix
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Write tests for new features
- Update documentation
- Follow commit message conventions
- Ensure CI/CD passes

## 📝 Environment Variables

### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### Optional
- `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` - Google Analytics ID
- `SENTRY_DSN` - Sentry error tracking
- `OPENAI_API_KEY` - For future AI features

See `.env.example` for complete list.

## 🆘 Support

- **Documentation**: Check this README and inline comments
- **Issues**: Create GitHub issues for bugs
- **Features**: Use GitHub discussions for feature requests
- **Security**: Email security issues privately

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Made with ❤️ for Hong Kong's Christian Community**
