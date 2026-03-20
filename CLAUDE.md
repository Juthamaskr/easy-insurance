# CLAUDE.md - Easy Insurance Project Context

## Project Overview

**Easy Insurance** เป็นระบบเปรียบเทียบประกันสำหรับตัวแทนขายประกันและลูกค้าทั่วไป ช่วยให้การเลือกแผนประกันง่ายขึ้น

### Quick Info
- **Type:** Web Application (Next.js)
- **Language:** Thai (Primary), English (Secondary)
- **Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase

## Commands

### Development
```bash
npm run dev        # Start development server (http://localhost:3000)
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # Run TypeScript check
```

### Database
```bash
npx supabase login          # Login to Supabase CLI
npx supabase db push        # Push migrations to remote
npx supabase gen types ts   # Generate TypeScript types
```

## Architecture

### Directory Structure
```
src/
├── app/           # Next.js App Router pages
├── components/    # React components
│   ├── ui/        # Base UI (Button, Card, Input)
│   ├── forms/     # Insurance forms
│   ├── compare/   # Comparison components
│   └── layout/    # Header, Footer, Sidebar
├── lib/           # Utilities & Supabase clients
├── hooks/         # Custom React hooks
└── types/         # TypeScript definitions
```

### Key Files
- `src/app/layout.tsx` - Root layout with providers
- `src/lib/supabase/client.ts` - Browser Supabase client
- `src/lib/supabase/server.ts` - Server Supabase client
- `src/types/database.ts` - Auto-generated DB types

## Database Schema

### Main Tables
- `profiles` - User profiles (extends auth.users)
- `insurance_companies` - Insurance company info
- `insurance_plans` - All insurance plans
- `saved_plans` - User's saved plans
- `comparison_history` - Comparison records with share codes
- `leads` - Customer interest submissions

### Insurance Types
```typescript
type InsuranceType = 'health' | 'life' | 'car';
```

### User Roles
```typescript
type UserRole = 'customer' | 'agent' | 'admin';
```

## Code Patterns

### Supabase Client Usage
```typescript
// Client Component
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Server Component / Route Handler
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
```

### Fetching Plans
```typescript
const { data: plans } = await supabase
  .from('insurance_plans')
  .select(`
    *,
    company:insurance_companies(*)
  `)
  .eq('type', 'health')
  .eq('is_active', true)
  .order('premium_yearly', { ascending: true })
```

### Authentication Check
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')
```

## Naming Conventions

### Files
- Components: `PascalCase.tsx` (e.g., `PlanCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatPrice.ts`)
- Types: `camelCase.ts` (e.g., `database.ts`)

### Code
- Functions/Variables: `camelCase`
- Components: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase`

## Thai Language Guidelines

### UI Text
- Use formal Thai (ภาษาสุภาพ)
- Button actions: ใช้คำกริยา (e.g., "เปรียบเทียบ", "บันทึก", "ดูเพิ่ม")
- Error messages: ชัดเจน ไม่ technical (e.g., "กรุณากรอกอีเมล" not "Email required")

### Number Formatting
```typescript
// Currency
new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB'
}).format(12000) // ฿12,000.00

// Shorthand
formatPrice(12000) // ฿12,000
```

## Design System

### Color Palette (Sky Blue Theme)
```css
/* Primary - Cyan */
--primary: cyan-600 (#0891B2)
--primary-light: cyan-100 (#CFFAFE)
--primary-dark: cyan-700 (#0E7490)

/* Secondary - Sky Blue */
--secondary: sky-600 (#0284C7)

/* Accent */
--accent: cyan-500 (#06B6D4)

/* Text */
--text-primary: gray-900 (#1A365D - Dark Blue tint)
--text-secondary: gray-600
```

### Usage in Components
- Buttons primary: `bg-cyan-600 hover:bg-cyan-700`
- Links active: `text-cyan-600`
- Focus rings: `focus:ring-cyan-500`
- Backgrounds accent: `bg-cyan-100`
- Icons: `text-cyan-600`

### Responsive Design (Mobile First)

```css
/* Breakpoints */
sm: 640px   /* iPhone Plus/Max */
md: 768px   /* iPad Portrait */
lg: 1024px  /* iPad Landscape */
xl: 1280px  /* Desktop */
```

### Grid Layouts
```tsx
// Plan cards grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

// Features grid
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
```

### Touch Optimization
```tsx
// Touch-friendly button
className="touch-manipulation active:scale-[0.98]"

// Minimum touch target (44px)
className="min-h-[44px] p-3"

// Prevent iOS zoom on input
className="text-[16px]" // or use globals.css
```

### Modal Behavior
- **iPhone**: Slides up from bottom, rounded top corners
- **iPad/Desktop**: Centered modal with backdrop

## Component Guidelines

### UI Components
All base UI components are in `src/components/ui/`:
- Use Tailwind classes
- Support `className` prop for customization
- Include proper TypeScript types
- Use `forwardRef` when applicable

### Form Components
- Use `react-hook-form` for form state
- Use `zod` for validation
- Show inline error messages
- Support loading states

## API Routes

### Protected Routes
```typescript
// src/app/api/*/route.ts
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ... handle request
}
```

## Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Optional (for admin functions)
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Testing Strategy

### Manual Testing Priority
1. Compare flow (select type → input → results → compare)
2. Save/Share functionality
3. Authentication flow
4. Admin CRUD operations
5. Mobile responsiveness

## Common Issues & Solutions

### Supabase Auth Session
If auth state is lost, check:
1. Middleware is correctly set up
2. `createClient` is using cookies correctly
3. RLS policies allow access

### TypeScript Errors
If type errors occur:
1. Run `npx supabase gen types ts --project-id <id> > src/types/database.ts`
2. Check `tsconfig.json` paths

### Tailwind Not Working
1. Check `tailwind.config.ts` content paths
2. Ensure `globals.css` has Tailwind directives

## Useful Resources

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)

## New Components (v1.1)

### Toast Notifications
```typescript
import { useToast } from '@/components/ui';

const { showToast } = useToast();

// Success
showToast({ type: 'success', title: 'สำเร็จ', message: 'บันทึกแล้ว' });

// Error
showToast({ type: 'error', title: 'ผิดพลาด', message: 'กรุณาลองใหม่' });

// Warning
showToast({ type: 'warning', title: 'คำเตือน', message: 'กรุณากรอกข้อมูล' });

// Info
showToast({ type: 'info', title: 'แจ้งเตือน', message: 'กรุณาเข้าสู่ระบบ' });
```

### Skeleton Loaders
```typescript
import { Skeleton, SkeletonCard, SkeletonTable } from '@/components/ui';

// Custom skeleton
<Skeleton className="h-8 w-32" />

// Pre-built skeletons
<SkeletonCard />
<SkeletonTable />
<SkeletonDashboard />
```

## PWA Configuration

### Manifest
Location: `public/manifest.json`
- App name and icons
- Theme color: #0891b2 (cyan)
- Display: standalone

### Icons
Location: `public/icons/`
- `icon.svg` - Base SVG icon
- `icon-{72,96,128,144,152,192,384,512}x*.png` - Generated PNGs
- Generate icons: `node scripts/generate-icons.js` (requires sharp)

### OG Image
Location: `public/og-image.png` (1200x630)
- Used for social media sharing

### Service Worker
Location: `public/sw.js`
- Network-first strategy
- Offline fallback to cache
- Auto-updates on new deployment

### Installation
- iOS: Safari > Share > Add to Home Screen
- Android: Chrome > Menu > Install App

## API Webhook

### New Lead Notification
```
POST /api/webhook/new-lead
```

Configure in Supabase:
1. Go to Database > Webhooks
2. Create new webhook
3. Table: `leads`
4. Events: INSERT
5. URL: `https://your-domain.vercel.app/api/webhook/new-lead`

## SEO

### Auto-generated
- `/sitemap.xml` - All public pages
- `/robots.txt` - Crawl rules

### Page Metadata
```typescript
export const metadata: Metadata = {
  title: 'Page Title - Easy Insurance',
  description: 'Page description',
  openGraph: {
    title: 'OG Title',
    description: 'OG Description',
    images: ['/og-image.png'],
  },
};
```

## Admin Pages

| Page | Path | Description |
|------|------|-------------|
| Dashboard | /admin | Overview stats, recent leads |
| Plans | /admin/plans | CRUD insurance plans (Supabase connected) |
| Leads | /admin/leads | Manage customer leads + notes (Supabase connected) |
| Analytics | /admin/analytics | Charts and metrics |
| Users | /admin/users | Manage user roles (admin/agent/customer) |
| Commission | /admin/commission | Commission tracking and earnings |
| Reminders | /admin/reminders | Follow-up reminders for leads |
| Settings | /admin/settings | System settings |

## User Roles

| Role | Description | Access |
|------|-------------|--------|
| admin | ผู้ดูแลระบบ | เข้าถึงได้ทุกหน้า รวมถึง /admin/* |
| agent | ตัวแทนขาย | ดู leads และ analytics ได้ |
| customer | ลูกค้าทั่วไป | ใช้งานหน้าเปรียบเทียบและ dashboard |

### First User = Admin
- User คนแรกที่สมัครจะได้ role = admin อัตโนมัติ
- User คนต่อๆ ไปจะเป็น customer
- Admin สามารถเปลี่ยน role ของ user อื่นได้ผ่านหน้า /admin/users

## User Pages

| Page | Path | Description |
|------|------|-------------|
| Dashboard | /dashboard | User stats, recent saved plans |
| Saved Plans | /dashboard/saved | View/delete saved plans |
| History | /dashboard/history | Comparison history with share links |
| Settings | /dashboard/settings | Profile management |

## Auth Pages

| Page | Path | Description |
|------|------|-------------|
| Login | /login | Email/password login |
| Register | /register | New user registration |
| Forgot Password | /forgot-password | Request password reset email |
| Reset Password | /reset-password | Set new password (from email link) |

## Database Migrations

Located in `/supabase/migrations/`:

| File | Description |
|------|-------------|
| 001_initial_schema.sql | Initial tables and basic RLS |
| 002_first_user_admin.sql | Trigger for first user = admin |
| 003_admin_manage_users.sql | RLS for admin to manage profiles |
| 004_admin_manage_plans.sql | RLS for admin CRUD on plans/companies |
| 005_commission_tracking.sql | Commission rate and tracking |
| 006_customer_notes.sql | Customer notes and follow-up dates |

### Running Migrations

```bash
# Push all migrations to Supabase
npx supabase db push

# Or run SQL manually in Supabase Dashboard > SQL Editor
```

## RLS Policies

### Profiles Table
- Users can view/update their own profile
- Admins can view/update all profiles

### Insurance Plans Table
- Anyone can view active plans (`is_active = true`)
- Admins can view ALL plans (including inactive)
- Admins can insert/update/delete plans

### Insurance Companies Table
- Anyone can view companies
- Admins can insert/update/delete companies

## Agent Tools (v1.4)

### Quote Calculator
```typescript
import QuoteCalculator from '@/components/QuoteCalculator';

<QuoteCalculator
  basePremium={12000}
  planName="แผนสุขภาพ A"
  planType="health"
  onCalculate={(premium) => console.log(premium)}
/>
```

### AI Recommendation
```typescript
import { getRecommendations } from '@/lib/recommendation';

const recommendations = getRecommendations(plans, {
  age: 35,
  gender: 'male',
  budget: 15000,
  insuranceType: 'health',
});
```

### Customer Notes
- บันทึกผ่าน `/admin/leads` modal
- เก็บใน `customer_notes` table
- แสดงประวัติการติดต่อแบบ timeline

### Follow-up Reminder
- ตั้งวันนัดติดตามใน lead modal
- ดูรายการที่ `/admin/reminders`
- แบ่งตาม: เลยกำหนด / วันนี้ / กำลังจะถึง

## UX Improvements (v1.5)

### Analytics Charts
```typescript
import {
  LeadStatusChart,
  PlanTypeChart,
  MonthlyTrendChart,
  CommissionChart,
  ConversionFunnel,
} from '@/components/AnalyticsCharts';

// Pie chart for lead status
<LeadStatusChart data={[{ name: 'ใหม่', value: 10, color: '#3B82F6' }]} />

// Bar chart for plan types
<PlanTypeChart data={[{ name: 'ประกันสุขภาพ', count: 5 }]} />

// Line chart for trends
<MonthlyTrendChart data={[{ month: 'ม.ค.', leads: 10, comparisons: 50 }]} />
```

### Dark Mode
```typescript
import { useTheme } from '@/components/ThemeProvider';

const { theme, setTheme, resolvedTheme } = useTheme();

// Toggle dark mode
setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
```

CSS Variables for dark mode are defined in `globals.css`:
- Light: `--background: #f9fafb`, `--foreground: #1a365d`
- Dark: `--background: #111827`, `--foreground: #f9fafb`

### Search Plans
Search functionality in results page:
- Search by: ชื่อแผน, บริษัท, ความคุ้มครอง
- Real-time filtering
- Clear button to reset

### AI Chatbot
```typescript
import ChatBot from '@/components/ChatBot';

// Added to layout.tsx - appears on all pages
<ChatBot />
```

Features:
- ตอบคำถามเรื่องประกัน
- แนะนำแผนประกันจากข้อมูลในระบบ
- รองรับภาษาไทย
- UI แบบ floating chat window

## Contact & Support

For questions about this project:
- Check SPEC.md for detailed requirements
- Review existing code patterns before implementing new features
