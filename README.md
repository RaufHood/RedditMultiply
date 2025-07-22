# RedditPro AI Frontend

A modern Next.js 14 frontend application for RedditPro AI - an intelligent Reddit monitoring and engagement platform. Built with TypeScript, Tailwind CSS, and shadcn/ui components.

## 🎯 What This Frontend Does

This frontend provides a user-friendly interface for:

- **Onboarding Wizard**: Collect brand context and business information
- **Subreddit Discovery**: Browse and select relevant communities
- **Mentions Dashboard**: Monitor brand mentions in real-time
- **Thread Analysis**: View AI-generated summaries of Reddit threads
- **Reply Generation**: Create compliant response drafts
- **Analytics**: Track engagement metrics and performance

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **State Management**: React hooks (useState, useEffect)
- **API Client**: Custom TypeScript API service
- **Icons**: Lucide React

## 📋 Prerequisites

- **Node.js 18+**
- **npm or yarn**
- **Backend server running** (see backend README)

## 🔧 Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd RedditMultiply
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
RedditMultiply/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   ├── onboarding/        # Onboarding wizard
│   ├── discovery/         # Subreddit discovery
│   ├── dashboard/         # Main dashboard
│   ├── communities/       # Community management
│   └── settings/          # Settings panel
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── navigation.tsx    # Navigation component
│   └── theme-provider.tsx # Theme provider
├── lib/                  # Utilities and services
│   ├── api.ts           # API client
│   └── utils.ts         # Utility functions
├── hooks/               # Custom React hooks
├── public/              # Static assets
└── styles/              # Additional styles
```

## 🎮 Key Features

### 1. Onboarding Wizard
- **Multi-step form** for brand context collection
- **Real-time validation** and progress tracking
- **Dynamic keyword generation** based on inputs
- **Responsive design** for all screen sizes

### 2. Subreddit Discovery
- **AI-powered recommendations** based on keywords
- **Manual search** functionality
- **Community cards** with relevance scores
- **Selection management** with visual feedback

### 3. Dashboard
- **Real-time mentions feed** with auto-refresh
- **Priority filtering** and status management
- **Analytics overview** with key metrics
- **Responsive grid layout**

### 4. Thread Analysis
- **Modal-based thread details**
- **AI-generated summaries** with structured sections
- **Sentiment analysis** display
- **Action buttons** for engagement

### 5. Reply Generation
- **AI-powered draft creation**
- **Compliance checking** with real-time feedback
- **Copy-to-clipboard** functionality
- **Regeneration** capabilities

## 🔧 Configuration

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id

# Optional: Feature flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
```

### API Configuration

The frontend connects to the backend API through the `lib/api.ts` service:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
```

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Component Development

The project uses shadcn/ui components. To add new components:

```bash
npx shadcn@latest add [component-name]
```

### Styling Guidelines

- Use Tailwind CSS classes for styling
- Follow the existing design system
- Use shadcn/ui components when possible
- Maintain responsive design principles

## 🎨 UI/UX Features

### Design System
- **Consistent spacing** using Tailwind's spacing scale
- **Color palette** with light/dark mode support
- **Typography** hierarchy with proper font weights
- **Component variants** for different states

### Responsive Design
- **Mobile-first** approach
- **Breakpoint system** using Tailwind's responsive prefixes
- **Flexible layouts** that adapt to screen sizes
- **Touch-friendly** interactions

### Accessibility
- **Semantic HTML** structure
- **Keyboard navigation** support
- **Screen reader** compatibility
- **Color contrast** compliance

## 🔄 State Management

The application uses React's built-in state management:

- **useState** for local component state
- **useEffect** for side effects and API calls
- **Custom hooks** for reusable logic
- **Context** for theme management

## 📱 Pages Overview

### Landing Page (`/`)
- Welcome screen with app overview
- Quick start guide
- Feature highlights

### Onboarding (`/onboarding`)
- Multi-step wizard for brand setup
- Form validation and progress tracking
- Keyword generation and review

### Discovery (`/discovery`)
- Subreddit search and recommendations
- Community selection interface
- Monitoring configuration

### Dashboard (`/dashboard`)
- Main workspace after setup
- Mentions feed with filtering
- Analytics overview
- Quick actions

### Communities (`/communities`)
- Manage monitored subreddits
- Add/remove communities
- View community statistics

### Settings (`/settings`)
- Brand context editing
- Tone and guideline updates
- Disclosure template management

## 🧪 Testing

### Manual Testing Checklist

1. **Onboarding Flow**
   - [ ] Complete all wizard steps
   - [ ] Verify form validation
   - [ ] Check keyword generation
   - [ ] Test navigation between steps

2. **Discovery Page**
   - [ ] Search for subreddits
   - [ ] Select/deselect communities
   - [ ] Verify API integration
   - [ ] Test responsive layout

3. **Dashboard**
   - [ ] View mentions feed
   - [ ] Filter by status/priority
   - [ ] Open thread details
   - [ ] Generate reply drafts

4. **Reply Generation**
   - [ ] Create draft replies
   - [ ] Check compliance
   - [ ] Copy to clipboard
   - [ ] Regenerate drafts

### Browser Testing

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 🐛 Troubleshooting

### Common Issues

**Build Errors:**
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

**API Connection Issues:**
- Verify backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure CORS is configured on backend

**Styling Issues:**
- Clear browser cache
- Check Tailwind CSS compilation
- Verify shadcn/ui component imports

**Performance Issues:**
- Check bundle size: `npm run build`
- Optimize images and assets
- Review API call frequency

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on push to main branch

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔮 Future Enhancements

### UI/UX Improvements
- [ ] Advanced filtering and search
- [ ] Drag-and-drop interface
- [ ] Keyboard shortcuts
- [ ] Progressive Web App (PWA)

### Performance Optimizations
- [ ] Image optimization
- [ ] Code splitting
- [ ] Caching strategies
- [ ] Bundle optimization

### Feature Additions
- [ ] Dark mode toggle
- [ ] Custom themes
- [ ] Export functionality
- [ ] Advanced analytics charts

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🤝 Contributing

1. Follow the existing code style
2. Add proper TypeScript types
3. Test on multiple browsers
4. Update documentation
5. Ensure accessibility compliance

---

**Built with Next.js, TypeScript, and shadcn/ui for the best developer experience**
