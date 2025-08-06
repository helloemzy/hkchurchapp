# 🚀 Hong Kong Church PWA - Supabase Production Deployment Guide

## ⚠️ URGENT FIX: CONCURRENTLY Issue Resolved

**Problem Solved**: The original deployment scripts contained `CREATE INDEX CONCURRENTLY` statements that cannot run inside Supabase's transaction blocks. This new deployment script removes all `CONCURRENTLY` keywords and is fully compatible with Supabase.

## 📋 Pre-Deployment Checklist

- [ ] Supabase account created
- [ ] New project created in Supabase
- [ ] Project URL and API keys noted
- [ ] Database password set

## 🗄️ Step-by-Step Database Deployment

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Execute the Deployment Script

1. Copy the entire contents of `/database/supabase_deploy.sql`
2. Paste into the SQL Editor
3. Click **Run** (or press Ctrl/Cmd + Enter)

**Expected Runtime**: 30-60 seconds

### Step 3: Verify Deployment Success

The script will output completion messages showing:
- ✅ Tables created (should be ~20 tables)
- ✅ Indexes created (should be ~50+ indexes)  
- ✅ Security policies active
- ✅ Sample data loaded (devotions, events, prayers, groups)

## 🔧 Post-Deployment Configuration

### Step 4: Create Your First Admin User

1. Go to **Authentication** > **Users** in Supabase
2. Click **Add User**
3. Enter your email and temporary password
4. Click **Create User**
5. Note the User ID (UUID)

### Step 5: Assign Admin Role

Run this SQL in the SQL Editor (replace `YOUR_USER_ID` with actual UUID):

```sql
-- Replace YOUR_USER_ID with your actual user UUID
INSERT INTO user_roles (user_id, role, assigned_by, assigned_at) 
VALUES ('YOUR_USER_ID', 'super_admin', 'YOUR_USER_ID', NOW());

-- Create profile for the admin user
INSERT INTO profiles (id, email, full_name, language, is_active) 
VALUES ('YOUR_USER_ID', 'your-email@example.com', 'Your Name', 'zh-HK', true)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    is_active = EXCLUDED.is_active;
```

### Step 6: Configure App Environment Variables

Update your app's environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app-domain.com
NEXT_PUBLIC_CHURCH_NAME="Hong Kong Grace Church"
NEXT_PUBLIC_DEFAULT_LANGUAGE=zh-HK
NEXT_PUBLIC_TIMEZONE=Asia/Hong_Kong
```

## 🧪 Testing Your Deployment

### Step 7: Verify All Features Work

Run these test queries in SQL Editor:

```sql
-- Test 1: Check devotions are available
SELECT COUNT(*) as devotion_count FROM devotions WHERE is_published = true;
-- Expected: Should return 3+ devotions

-- Test 2: Check events are created
SELECT COUNT(*) as event_count FROM events WHERE is_public = true;
-- Expected: Should return 1+ events

-- Test 3: Check prayer requests
SELECT COUNT(*) as prayer_count FROM prayer_requests WHERE is_public = true;
-- Expected: Should return 2+ prayer requests

-- Test 4: Check small groups
SELECT COUNT(*) as group_count FROM small_groups WHERE is_public = true;
-- Expected: Should return 1+ groups

-- Test 5: Verify RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
-- Expected: Should return 20+ policies

-- Test 6: Check indexes created
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
-- Expected: Should return 50+ indexes
```

## 🔐 Security Verification

### Step 8: Test Row Level Security

```sql
-- Test RLS is working (these should return results)
SELECT title FROM devotions WHERE is_published = true LIMIT 1;
SELECT title FROM events WHERE is_public = true LIMIT 1;
SELECT title FROM prayer_requests WHERE is_public = true LIMIT 1;

-- Test auth-required tables (these might return empty if not authenticated)
SELECT COUNT(*) FROM profiles; -- Should work for admins only
```

## 📱 App Feature Testing

### Step 9: Test Core PWA Features

Once deployed, verify these features work in your app:

1. **Devotions**
   - [ ] Daily devotion loads
   - [ ] Can mark as complete
   - [ ] Reading streak updates
   - [ ] Bookmarks work

2. **Bible Reader**
   - [ ] Can create bookmarks
   - [ ] Notes save correctly
   - [ ] Search functions

3. **Prayer Community**
   - [ ] Can view public prayers
   - [ ] Can submit prayer requests
   - [ ] Can pray for others

4. **Small Groups**
   - [ ] Can browse groups
   - [ ] Can join groups
   - [ ] Group activities load

5. **Events**
   - [ ] Event calendar loads
   - [ ] Can register for events
   - [ ] Event details display

## 🚨 Troubleshooting

### Common Issues and Solutions

**Issue**: "CREATE INDEX CONCURRENTLY cannot run inside a transaction block"
**Solution**: ✅ Fixed! Use `supabase_deploy.sql` instead of `quick_deploy.sql`

**Issue**: No devotions appearing in app
**Solution**: 
```sql
-- Check if devotions exist and are published
SELECT title, date, is_published FROM devotions ORDER BY date DESC;
-- If not published, run:
UPDATE devotions SET is_published = true WHERE is_published = false;
```

**Issue**: User cannot access admin features
**Solution**:
```sql
-- Check user role
SELECT ur.role, p.email FROM user_roles ur 
JOIN profiles p ON ur.user_id = p.id 
WHERE p.email = 'your-email@example.com';

-- If no role exists, add admin role:
INSERT INTO user_roles (user_id, role) 
SELECT id, 'super_admin' FROM profiles WHERE email = 'your-email@example.com';
```

**Issue**: RLS blocking legitimate queries
**Solution**: Verify your JWT token contains the correct user ID and the policies are correctly configured.

## 🔄 Database Maintenance

### Regular Tasks

1. **Weekly**: Refresh materialized views (if any)
2. **Monthly**: Review slow query logs
3. **Quarterly**: Backup verification
4. **As needed**: Update devotions content

### Performance Monitoring

```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
WHERE mean_time > 1000 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## ✅ Production Readiness Checklist

- [ ] Database deployed successfully
- [ ] Admin user created and verified
- [ ] All test queries pass
- [ ] RLS policies working
- [ ] App environment variables configured
- [ ] All PWA features tested
- [ ] Backup strategy configured
- [ ] Performance monitoring enabled
- [ ] Error tracking configured
- [ ] SSL/TLS properly configured

## 🎉 Success!

Once all steps are complete, your Hong Kong Church PWA will have:

- ✅ Complete database schema with all features
- ✅ Optimized indexes for fast performance
- ✅ Robust security with Row Level Security
- ✅ Hong Kong-specific localization
- ✅ Sample content ready for use
- ✅ Full PWA functionality activated

Your app is now ready for production use by your church community!

---

## 📞 Need Help?

If you encounter any issues during deployment:

1. Check the Supabase logs in the dashboard
2. Verify all environment variables are set correctly
3. Ensure your user has the correct permissions
4. Review the RLS policies if data access issues occur

The database is designed for Hong Kong Church's specific needs with Chinese/English bilingual support and timezone-aware scheduling.