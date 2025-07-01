# 📰 Callia: Morning Briefings

A modern, AI-powered news aggregation platform that delivers personalized daily morning briefs from your favorite news sources.

## ✨ Features

- ** Personalized News Briefings**: Leverages AI to generate tailored news summaries based on user-selected sources and preferences.
- **Multi-Source Aggregation**: Gathers news from both websites and RSS feeds using `newspaper4k` and `feedparser`.
- **User Management**: Supports Google and email registration/login for a personalized experience.
- **Source Customization**: Allows users to select from a provided list of news sources or add their own.
- **In-App Brief Viewer**: Read daily news summaries directly within the app.
- **Brief History**: Access up to 30 days of past news briefings.
- **Social Sharing**: Share interesting briefs with the community or on social media.

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js (with App Router)
- **UI Library**: shadcn/ui
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Fonts**: Newsreader (serif) & Noto Sans (sans-serif)

### Backend
- **Language & Framework**: Python with FastAPI
- **News Crawling**: `newspaper4k` and `feedparser`
- **Database**: Supabase (PostgreSQL)
- **Task Scheduling**: Celery or APScheduler for daily jobs
- **Email Service**: SMTP integration (e.g., SendGrid)

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/callia.git
cd callia
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📄 Pages Overview

### 🏠 Home Page (`/`)
- Hero section with value proposition.
- Features overview.
- User testimonials.
- Pricing tiers.

### 📋 My Briefs (`/briefs`)
- View the last 30 days of personalized morning briefs.
- Share daily briefs to social media.

### 🌍 Community (`/community`)
- Discover official and community-shared news sources.
- Sources are categorized as Official, Community Hot, and Recently Added.
- View detailed information for each source and subscribe/unsubscribe.

### ⚙️ Profile & Settings (`/profile`)
- **Profile**: Manage personal information.
- **News Sources**: View and manage your subscribed news sources.
- **Preferences**: Configure language and other user preferences.

## 🎨 Design Philosophy

Callia follows a clean, professional news site aesthetic with:

- **Typography**: Newsreader for headlines, Noto Sans for body text
- **Color Scheme**: Neutral palette with subtle accents
- **Layout**: Card-based design with consistent spacing
- **Responsive**: Mobile-first approach with desktop enhancements

## 🛠️ Development

### Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── briefs/             # User's morning briefs page
│   ├── community/          # Community and news sources page
│   ├── profile/            # User profile & settings page
│   ├── globals.css         # Global styles & CSS variables
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Home page
├── components/             # Reusable React components
│   ├── ui/                 # shadcn/ui components
│   └── ...
└── lib/                    # Utility functions
    └── utils.ts            # shadcn/ui utilities
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding Components

To add new shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

## 📝 Future Enhancements

- [ ] **AI Voice Conversation**: Chat with an AI about your daily Morning Brew.
- [ ] **Mobile Applications**: Develop native iOS and Android apps.
- [ ] User authentication system
- [ ] Backend API integration
- [ ] Real news source integration
- [ ] Audio generation pipeline
- [ ] Email delivery system
- [ ] Advanced AI personalization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

Built with ❤️ by the Callia team

---

**Note**: This is currently a frontend prototype. The backend services for news crawling, AI processing, and audio generation are planned for future development phases.
