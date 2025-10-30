# 🚀 Deployment Guide for Hustlr CRM

This guide covers deploying your Hustlr CRM application to production using Vercel and Supabase.

## 📋 Prerequisites

- GitHub account
- Vercel account ([vercel.com](https://vercel.com))
- Supabase account ([supabase.com](https://supabase.com))

## 🗄️ Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details:
   - **Name**: `Hustlr CRM`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select closest to your users
4. Click "Create new project"
5. Wait for setup to complete (~2-3 minutes)

### 1.2 Configure Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire content from `supabase/migrations/202501301345_initial_schema.sql`
4. Paste into the SQL Editor
5. Click "Run" to execute the migration

### 1.3 Get API Credentials

1. Go to **Settings** → **API** in Supabase dashboard
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 1.4 Configure Authentication (Optional)

1. Go to **Authentication** → **Settings**
2. Set **Site URL**: Your production domain (e.g., `https://hustlr-crm.vercel.app`)
3. Add redirect URLs for your domain
4. Optionally disable email confirmations for easier testing

## 🌐 Step 2: Deploy to Vercel

### 2.1 Connect Repository

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Import Project"
3. Connect your GitHub account
4. Select your `hustlr-crm` repository
5. Configure project:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm ci`

### 2.2 Set Environment Variables

In Vercel dashboard, go to your project settings and add these environment variables:

```bash
# Required
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_MOCK_MODE=false

# Optional: Analytics & Monitoring
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_GA_TRACKING_ID=GA-XXXXXXXXXX
```

### 2.3 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live at `https://your-project-name.vercel.app`

## 🔧 Step 3: Post-Deployment Configuration

### 3.1 Update Supabase Auth Settings

1. Go back to Supabase dashboard
2. **Authentication** → **Settings**
3. Add your Vercel domain to:
   - **Site URL**
   - **Redirect URLs**

### 3.2 Test the Application

1. Visit your Vercel URL
2. Try signing up for a new account
3. Create clients, projects, and invoices
4. Test all features work correctly

## 🔍 Step 4: Monitoring & Analytics (Optional)

### 4.1 Set Up Sentry (Error Monitoring)

1. Go to [sentry.io](https://sentry.io) and create account
2. Create new React project
3. Copy the DSN and add to Vercel environment variables:
   ```
   VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
   ```

### 4.2 Set Up Google Analytics

1. Go to [Google Analytics](https://analytics.google.com)
2. Create new property
3. Get tracking ID and add to Vercel:
   ```
   VITE_GA_TRACKING_ID=GA-XXXXXXXXXX
   ```

## 🚀 Step 5: CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will:

- ✅ Run tests on every push
- ✅ Run linting and type checking
- ✅ Build the application
- ✅ Auto-deploy to Vercel on main branch pushes

## 🧪 Step 6: Testing Checklist

Before going live, verify:

- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads with data
- [ ] Client CRUD operations work
- [ ] Project Kanban drag-and-drop works
- [ ] Invoice creation and PDF generation works
- [ ] Real-time updates work
- [ ] Responsive design works on mobile
- [ ] All links and navigation work
- [ ] Error handling works properly

## 🔧 Troubleshooting

### Common Issues:

**Build fails on Vercel:**
- Check environment variables are set correctly
- Ensure `frontend/vercel.json` is present
- Check build logs for specific errors

**Authentication not working:**
- Verify Supabase URL and anon key
- Check redirect URLs in Supabase auth settings
- Ensure site URL matches your domain

**Database connection issues:**
- Verify migration ran successfully in Supabase
- Check RLS policies are enabled
- Ensure user has proper permissions

**Real-time not working:**
- Check Supabase real-time is enabled (it is by default)
- Verify RLS policies allow real-time subscriptions

## 📊 Performance Optimization

### Vercel Optimizations:
- Automatic code splitting
- Image optimization
- CDN distribution
- Automatic HTTPS

### Supabase Optimizations:
- Database indexes are pre-configured
- RLS policies optimize data access
- Real-time subscriptions are efficient

## 🔒 Security Checklist

- [ ] Environment variables not committed to git
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] RLS policies active
- [ ] Input validation working
- [ ] Authentication required for protected routes
- [ ] Sensitive data not logged

## 🎯 Going Live

1. **Final Testing**: Test all features thoroughly
2. **Domain Setup**: Connect custom domain if desired
3. **Backup**: Ensure you have database backups
4. **Monitoring**: Set up alerts for errors
5. **Launch**: Share with your users!

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Review browser console for errors
4. Check network tab for API calls
5. Create GitHub issue with error details

---

🎉 **Congratulations! Your Hustlr CRM is now live and production-ready!**