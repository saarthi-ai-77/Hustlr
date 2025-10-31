# Hustlr CRM

A modern, full-stack CRM application built for freelancers to manage clients, projects, and invoices. Built with React, TypeScript, Supabase, and deployed on Vercel.

## 🚀 Features

- **Client Management**: Add, edit, and track client relationships
- **Project Kanban**: Drag-and-drop project management with real-time updates
- **Invoice Generation**: Create and download professional PDF invoices
- **Dashboard Analytics**: Revenue tracking and client insights
- **Authentication**: Secure user authentication with Supabase Auth
- **Real-time Updates**: Live synchronization across all users
- **Responsive Design**: Works perfectly on desktop and mobile

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Library**: Shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: TanStack Query
- **Routing**: React Router
- **Forms**: React Hook Form with Zod validation
- **PDF Generation**: jsPDF
- **Drag & Drop**: @dnd-kit
- **Deployment**: Vercel with GitHub Actions CI/CD

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- GitHub account
- Supabase account

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/hustlr-crm.git
cd hustlr-crm
```

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Environment Setup

Copy the environment template and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Development Settings
VITE_MOCK_MODE=false

# Optional: Analytics & Monitoring
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_GA_TRACKING_ID=GA-XXXXXXXXXX
```

### 4. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration from `supabase/migrations/202501301345_initial_schema.sql`
3. Copy your project URL and anon key to `.env.local`

### 5. Development

```bash
npm run dev
```

Visit `http://localhost:8081`

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking

# Testing (when implemented)
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

## 🚀 Deployment

### Automatic Deployment (Recommended)

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign up
   - Click "Import Project" and connect your GitHub repository
   - Set root directory to `frontend`
   - Add environment variables in Vercel dashboard

2. **Environment Variables in Vercel**:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_MOCK_MODE=false
   ```

3. **Deploy**: Push to `main` branch and Vercel will auto-deploy

### Manual Deployment

```bash
cd frontend
npm run build
# Deploy the 'dist' folder to your hosting provider
```

## 🔒 Security

- Row Level Security (RLS) enabled on all database tables
- JWT-based authentication
- Input validation with Zod schemas
- HTTPS enforced in production
- Security headers configured

## 📊 Monitoring & Analytics

### Error Monitoring (Sentry)
- Automatic error tracking
- Performance monitoring
- User feedback collection

### Analytics (Google Analytics)
- Page views and user interactions
- Core Web Vitals tracking
- Custom event tracking

## 🧪 Testing

### Local Testing with Mock Data

For UI/UX testing before production deployment:

```env
VITE_MOCK_MODE=true
```

This provides:
- 2 mock users (john.doe@example.com, jane.smith@example.com)
- 3 mock clients
- 4 mock projects
- 3 mock invoices

## 📁 Project Structure

```
hustlr-crm/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and configurations
│   │   │   ├── api.ts      # API functions
│   │   │   ├── auth.ts     # Authentication
│   │   │   ├── supabase.ts # Supabase client
│   │   │   ├── validations.ts # Zod schemas
│   │   │   ├── mockData.ts # Mock data for testing
│   │   │   └── sentry.ts   # Error monitoring
│   │   └── hooks/         # Custom React hooks
│   ├── .env.example       # Environment template
│   ├── vercel.json        # Vercel configuration
│   └── vite.config.ts     # Vite configuration
├── supabase/
│   └── migrations/        # Database migrations
├── .github/
│   └── workflows/         # GitHub Actions CI/CD
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- Create an issue on GitHub
- Check the documentation
- Join our Discord community

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Advanced reporting
- [ ] Team collaboration features
- [ ] API integrations
- [ ] Multi-language support

---

Built with ❤️ for freelancers who want to focus on their craft, not paperwork.