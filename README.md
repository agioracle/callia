<<<<<<< HEAD
<<<<<<< HEAD
# Callia
morning brew
=======
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
=======
# 📰 Callia: Morning Brew
>>>>>>> ab1f8b0 (feat: init callia repo)

A modern, AI-powered news aggregation platform that delivers personalized daily morning briefs from your favorite news sources.

## ✨ Features

- **🌅 Personalized Morning Briefs**: Get AI-curated news summaries tailored to your interests
- **🎧 Audio & Text Formats**: Listen to your briefs or read them - your choice
- **📡 Smart News Crawling**: Automatically aggregate from websites and RSS feeds
- **👥 Community Sharing**: Discover and share interesting news sources and briefs
- **🔒 Privacy Controls**: Granular control over what you share with the community
- **📱 Responsive Design**: Beautiful, modern interface that works on all devices

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Fonts**: Newsreader (serif) & Noto Sans (sans-serif)

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/callia.git
cd callia/Callia
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
- Hero section with value proposition
- Features overview with 6 key capabilities
- User testimonials from satisfied readers
- Pricing tiers (Free, Pro, Enterprise)

### 📋 My Briefs (`/briefs`)
- View last 30 days of personalized morning briefs
- Switch between text and audio formats
- Make individual briefs public to community
- Download audio briefings for offline listening

### 🌍 Community (`/community`)
- **Featured Briefs**: Discover briefs shared by other users
- **Popular Sources**: Browse and follow news sources used by the community
- Like, comment, and share community content
- Add your own news sources to share

### ⚙️ Profile & Settings (`/profile`)
- **Profile**: Manage personal information and avatar
- **News Sources**: Add/remove RSS feeds and websites
- **Preferences**: Configure brief generation and privacy settings
- Control what you share with the community

## 🎨 Design Philosophy

<<<<<<< HEAD
Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
>>>>>>> 7e8acf6 (Initial commit from Create Next App)
=======
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
│   ├── briefs/            # User's morning briefs page
│   ├── community/         # Community features page
│   ├── profile/           # User profile & settings
│   ├── globals.css        # Global styles & CSS variables
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   └── Navigation.tsx    # Main navigation component
└── lib/                  # Utility functions
    └── utils.ts          # shadcn/ui utilities
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

- [ ] User authentication system
- [ ] Backend API integration
- [ ] Real news source integration
- [ ] Audio generation pipeline
- [ ] Email delivery system
- [ ] Mobile app development
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
>>>>>>> ab1f8b0 (feat: init callia repo)
