# LoopTask - Quick Reference Guide 📖

Essential commands, routes, and information for quick access.

---

## 🚀 Quick Commands

### Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Git
```bash
# Initialize repository
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin <your-repo-url>
git push -u origin main
```

### Deployment
```bash
# Deploy to Vercel
vercel deploy

# Deploy to production
vercel --prod
```

---

## 🗺️ Routes

### Public Routes
- `/` - Landing page
- `/login` - Login page

### Protected Routes (require authentication)
- `/dashboard` - Main dashboard
- `/dashboard/analytics` - Analytics page
- `/dashboard/activity` - Activity feed
- `/dashboard/automations` - Automations
- `/dashboard/settings` - Settings

### API Routes
- `/api/auth/[...nextauth]` - NextAuth endpoints
- `/api/summary` - AI summary generation

---

## 📁 File Structure

```
looptask/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── (auth)/            # Auth pages
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable components
│   ├── lib/                   # Utilities & APIs
│   ├── types/                 # TypeScript types
│   ├── utils/                 # Helper functions
│   └── styles/                # Global styles
├── public/                    # Static assets
├── .env.example              # Environment template
└── [docs]                    # Documentation files
```

---

## 🔑 Environment Variables

### Required
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl>
GITHUB_CLIENT_ID=<from-github-oauth>
GITHUB_CLIENT_SECRET=<from-github-oauth>
NEXT_PUBLIC_SUPABASE_URL=<from-supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from-supabase>
```

### Optional
```env
GOOGLE_CLIENT_ID=<from-google-cloud>
GOOGLE_CLIENT_SECRET=<from-google-cloud>
OPENAI_API_KEY=<from-openai>
SLACK_BOT_TOKEN=<from-slack>
SLACK_CHANNEL_ID=<from-slack>
NOTION_API_KEY=<from-notion>
NOTION_DATABASE_ID=<from-notion>
```

### Generate Secret
```bash
openssl rand -base64 32
```

---

## 🎨 Component Usage

### Button
```tsx
import Button from '@/components/Button';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>
```

**Variants**: `primary`, `secondary`, `outline`
**Sizes**: `sm`, `md`, `lg`

### Card
```tsx
import Card from '@/components/Card';

<Card hover className="custom-class">
  Content here
</Card>
```

**Props**: `hover`, `className`

### Animated Background
```tsx
import AnimatedBackground from '@/components/AnimatedBackground';

<AnimatedBackground />
```

---

## 📊 API Usage

### Generate AI Summary
```bash
curl -X POST http://localhost:3000/api/summary \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your-github-username",
    "meetings": []
  }'
```

**Response**:
```json
{
  "summary": "AI-generated summary text...",
  "stats": {
    "commits": 5,
    "prs": 2,
    "meetings": 1
  }
}
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  created_at TIMESTAMP
);
```

### Integrations Table
```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  github_connected BOOLEAN,
  slack_connected BOOLEAN,
  notion_connected BOOLEAN,
  calendar_connected BOOLEAN
);
```

### Activities Table
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP
);
```

### Summaries Table
```sql
CREATE TABLE summaries (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP
);
```

---

## 🎨 Tailwind Classes

### Common Patterns
```tsx
// Card
className="bg-gray-800 border border-gray-700 rounded-lg p-6"

// Button Primary
className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"

// Button Outline
className="border-2 border-gray-600 hover:border-blue-500 text-gray-300 px-4 py-2 rounded-lg"

// Input
className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"

// Gradient Text
className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"
```

---

## 🎭 Animation Patterns

### Fade In
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

### Slide Up
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

### Staggered List
```tsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    {item.content}
  </motion.div>
))}
```

### Hover Scale
```tsx
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.98 }}
>
  Content
</motion.div>
```

---

## 🔧 Troubleshooting

### Module Not Found
```bash
rm -rf node_modules .next
npm install
```

### OAuth Redirect Error
- Check callback URLs match exactly
- No trailing slashes
- Use http://localhost:3000 (not 127.0.0.1)

### Database Connection Error
- Verify Supabase URL and keys
- Check if project is active
- Run SQL migrations

### Build Error
```bash
npm run build
# Check error message
# Fix TypeScript errors
# Rebuild
```

---

## 📚 Documentation Links

- **Setup**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Quick Start**: [QUICKSTART.md](./QUICKSTART.md)
- **Features**: [FEATURES.md](./FEATURES.md)
- **API**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Contributing**: [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Roadmap**: [ROADMAP.md](./ROADMAP.md)

---

## 🎯 Common Tasks

### Add New Page
1. Create file in `src/app/[route]/page.tsx`
2. Add to sidebar navigation
3. Protect with `DashboardAuth` if needed
4. Add to routes list

### Add New Component
1. Create file in `src/components/[Name].tsx`
2. Export default function
3. Add TypeScript types
4. Import and use

### Add New API Route
1. Create file in `src/app/api/[route]/route.ts`
2. Export GET/POST/etc functions
3. Add error handling
4. Test with curl

### Add New Integration
1. Add API client in `src/lib/[service]API.ts`
2. Add environment variables
3. Update integration types
4. Add UI in settings

---

## 🎨 Color Reference

```tsx
// Primary Colors
blue-400: #60A5FA
blue-500: #3B82F6
blue-600: #2563EB

// Secondary Colors
purple-400: #C084FC
purple-500: #A855F7
purple-600: #9333EA

// Accent Colors
pink-500: #EC4899
green-500: #10B981
orange-500: #F59E0B
red-500: #EF4444

// Grays
gray-300: #D1D5DB
gray-400: #9CA3AF
gray-500: #6B7280
gray-700: #374151
gray-800: #1F2937
gray-900: #111827
gray-950: #030712
```

---

## 📱 Responsive Breakpoints

```tsx
// Mobile
className="block md:hidden"

// Tablet
className="hidden md:block lg:hidden"

// Desktop
className="hidden lg:block"

// Grid Responsive
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
```

---

## 🔐 Authentication

### Check Session
```tsx
import { useSession } from 'next-auth/react';

const { data: session, status } = useSession();

if (status === 'loading') return <Loading />;
if (!session) return <Login />;
```

### Sign In
```tsx
import { signIn } from 'next-auth/react';

signIn('github', { callbackUrl: '/dashboard' });
```

### Sign Out
```tsx
import { signOut } from 'next-auth/react';

signOut();
```

---

## 📊 Chart Configuration

### Area Chart
```tsx
<AreaChart data={data}>
  <defs>
    <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
    </linearGradient>
  </defs>
  <Area dataKey="value" fill="url(#color)" />
</AreaChart>
```

### Bar Chart
```tsx
<BarChart data={data}>
  <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
</BarChart>
```

### Pie Chart
```tsx
<PieChart>
  <Pie
    data={data}
    cx="50%"
    cy="50%"
    innerRadius={60}
    outerRadius={90}
    dataKey="value"
  />
</PieChart>
```

---

## 🚀 Performance Tips

1. **Use Next.js Image**: `<Image src="..." />`
2. **Lazy Load**: `const Component = dynamic(() => import('./Component'))`
3. **Memoize**: `useMemo()` and `useCallback()`
4. **Code Split**: Automatic with Next.js
5. **Optimize Fonts**: Use `next/font`

---

## 📞 Support

- **Email**: support@looptask.com
- **Discord**: [discord.gg/looptask](https://discord.gg/looptask)
- **GitHub**: [github.com/looptask](https://github.com/looptask)
- **Twitter**: [@looptask](https://twitter.com/looptask)

---

**Quick Reference v3.0** | Last Updated: October 28, 2025


---

## 👥 Phase 4: Team Collaboration (NEW!)

### Team Routes

```
/dashboard/team              # Team overview
/dashboard/team/leaderboard  # Team leaderboard
/dashboard/team/goals        # Goals & OKRs
```

### Team Features

**Team Overview:**
- View all team members
- See team statistics
- Invite new members
- Track team activity
- Role management (Owner, Admin, Member)

**Leaderboard:**
- Competitive rankings
- Top 3 podium display
- Full team rankings
- Time range filters (week/month/all)
- Achievement badges
- Streak tracking
- Trend indicators

**Goals & OKRs:**
- Create team goals
- Track key results
- Progress visualization
- Status monitoring (on-track, at-risk, off-track)
- Deadline tracking
- Owner assignment

### Team Roles

**Owner:**
- Full access to all features
- Can invite/remove members
- Can assign roles
- Can delete workspace

**Admin:**
- Can invite members
- Can manage goals
- Can view all analytics
- Cannot delete workspace

**Member:**
- Can view team data
- Can contribute to goals
- Limited management access
- Cannot invite others

---

## 🎮 Gamification Features

### Leaderboard Metrics
- **Commits**: Total code commits
- **Pull Requests**: PRs opened/merged
- **Code Reviews**: Reviews completed
- **Streak**: Consecutive active days
- **Score**: Overall productivity score

### Achievement Badges
- Most Commits
- Most PRs
- Longest Streak
- Top Reviewer
- Team MVP

### Status Indicators
- 🟢 Online
- ⚫ Offline
- 🔥 On a streak
- 📈 Trending up
- 📉 Trending down

---
