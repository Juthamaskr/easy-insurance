# Easy Insurance - Product Specification Document

## 📋 Overview

**Project Name:** Easy Insurance
**Version:** 1.0.0 (MVP)
**Last Updated:** 2026-03-19
**Author:** Insurance Agent Tool

### Purpose
ระบบเปรียบเทียบประกันสำหรับตัวแทนขายประกันและลูกค้าทั่วไป ช่วยให้การเลือกแผนประกันง่ายขึ้น โดยสามารถเปรียบเทียบแผนประกันจากหลายบริษัทได้ในที่เดียว

### Target Users
1. **ตัวแทนขายประกัน (Agent)** - ใช้เป็นเครื่องมือช่วย present ลูกค้า
2. **ลูกค้าทั่วไป (Customer)** - เข้ามาเปรียบเทียบและเลือกแผนประกันด้วยตนเอง

---

## 🎯 Goals & Objectives

### Business Goals
- ช่วยให้ตัวแทนขายประกันปิดการขายได้ง่ายขึ้น
- ให้ลูกค้าเข้าถึงข้อมูลประกันได้สะดวก
- สร้างความน่าเชื่อถือด้วยการเปรียบเทียบแบบโปร่งใส

### Technical Goals
- Zero cost hosting (Vercel + Supabase free tier)
- Mobile-first responsive design
- Fast loading (< 3 seconds)
- SEO friendly

---

## 🏗️ Tech Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| Frontend | Next.js 14 (App Router) | SSR, SEO, Performance |
| Styling | Tailwind CSS | Rapid development, Consistent design |
| Language | TypeScript | Type safety, Better DX |
| Database | Supabase (PostgreSQL) | Free tier, Built-in Auth, Real-time |
| Auth | Supabase Auth | Free, Easy integration |
| Hosting | Vercel | Free tier, Auto deploy |
| PDF | @react-pdf/renderer | Client-side PDF generation |

---

## 📱 Features Specification

### Phase 1: MVP Features

#### 1. หน้าแรก (Landing Page)
- Hero section อธิบายระบบ
- ปุ่มเลือกประเภทประกัน (สุขภาพ, ชีวิต, รถยนต์)
- แสดงจำนวนแผนประกันที่มี
- Testimonials / Trust badges

#### 2. หน้าเลือกประเภทประกัน
```
┌─────────────────────────────────────────────┐
│  เลือกประเภทประกันที่ต้องการเปรียบเทียบ      │
├─────────────┬─────────────┬─────────────────┤
│ 🏥 สุขภาพ   │ 💚 ชีวิต    │ 🚗 รถยนต์      │
│  25 แผน     │  18 แผน    │   32 แผน       │
└─────────────┴─────────────┴─────────────────┘
```

#### 3. ฟอร์มกรอกข้อมูล

**ประกันสุขภาพ:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| อายุ | Number | ✅ | 1-99 |
| เพศ | Select | ✅ | ชาย/หญิง |
| งบประมาณ/ปี | Range | ❌ | 0-100,000+ |
| ทุนประกัน | Select | ❌ | 100K-5M |
| โรคประจำตัว | Checkbox | ❌ | - |

**ประกันชีวิต:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| อายุ | Number | ✅ | 1-70 |
| เพศ | Select | ✅ | ชาย/หญิง |
| สถานะสมรส | Select | ❌ | - |
| รายได้/เดือน | Range | ❌ | - |
| ทุนประกัน | Select | ✅ | 100K-10M |

**ประกันรถยนต์:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| ประเภทรถ | Select | ✅ | เก๋ง/กระบะ/SUV |
| ยี่ห้อ | Select | ✅ | - |
| ปีรถ | Number | ✅ | 2000-2026 |
| ทุนประกัน | Number | ✅ | - |
| ประเภทประกัน | Select | ✅ | ชั้น1/2+/3+ |

#### 4. หน้าเปรียบเทียบ (Compare Page)

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ Filter: [ราคา ▼] [บริษัท ▼] [ความคุ้มครอง ▼]  🔄 Reset │
├──────────────────────────────────────────────────────────┤
│ เลือก 0/3 แผน                    [เปรียบเทียบ]          │
├──────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│ │ ☐ แผน A     │ │ ☐ แผน B     │ │ ☐ แผน C     │         │
│ │ AIA         │ │ เมืองไทย    │ │ กรุงเทพ      │         │
│ │ ────────    │ │ ────────    │ │ ────────    │         │
│ │ 12,000/ปี   │ │ 15,000/ปี   │ │ 10,500/ปี   │         │
│ │ ⭐ 4.5      │ │ ⭐ 4.2      │ │ ⭐ 4.0      │         │
│ │ [ดูเพิ่ม]   │ │ [ดูเพิ่ม]   │ │ [ดูเพิ่ม]   │         │
│ └─────────────┘ └─────────────┘ └─────────────┘         │
└──────────────────────────────────────────────────────────┘
```

**ตารางเปรียบเทียบ (เมื่อเลือก 2-3 แผน):**
```
┌─────────────────┬──────────────┬──────────────┬──────────────┐
│ รายการ          │   แผน A      │   แผน B      │   แผน C      │
├─────────────────┼──────────────┼──────────────┼──────────────┤
│ บริษัท          │ AIA          │ เมืองไทย     │ กรุงเทพ       │
│ เบี้ยประกัน/ปี  │ ฿12,000      │ ฿15,000      │ ฿10,500      │
│ ทุนประกัน       │ ฿500,000     │ ฿500,000     │ ฿500,000     │
│ ค่ารักษา OPD    │ ฿1,500/ครั้ง │ ฿2,000/ครั้ง │ ฿1,000/ครั้ง │
│ ค่ารักษา IPD    │ ตามจริง      │ ตามจริง       │ ฿50,000/ครั้ง│
│ ค่าห้อง/วัน     │ ฿3,000       │ ฿4,000       │ ฿2,500       │
│ ระยะรอคอย       │ 30 วัน       │ 30 วัน       │ 60 วัน       │
│ ⭐ คะแนน        │ 4.5          │ 4.2          │ 4.0          │
├─────────────────┼──────────────┼──────────────┼──────────────┤
│                 │ [สนใจแผนนี้] │ [สนใจแผนนี้] │ [สนใจแผนนี้] │
└─────────────────┴──────────────┴──────────────┴──────────────┘
         [📄 Export PDF]  [🔗 แชร์ลิงก์]  [💾 บันทึก]
```

#### 5. หน้ารายละเอียดแผน (Plan Detail)
- ข้อมูลบริษัทประกัน
- ความคุ้มครองแบบละเอียด
- ข้อยกเว้น/เงื่อนไข
- เอกสารที่ต้องใช้สมัคร
- ปุ่ม "สนใจแผนนี้"
- Related plans (แผนใกล้เคียง)

#### 6. ระบบ Authentication
- Register (Email/Password)
- Login
- Forgot Password
- Profile Management

#### 7. หน้า Dashboard (สำหรับ User ที่ Login)
- แผนที่บันทึกไว้ (Saved Plans)
- ประวัติการเปรียบเทียบ
- ข้อมูลส่วนตัว

#### 8. Admin Panel (สำหรับตัวแทน)
- จัดการแผนประกัน (CRUD)
- ดูรายชื่อลูกค้าที่สนใจ (Leads)
- Dashboard สถิติ

---

## 🗄️ Database Schema

### Tables

#### `profiles` (extends Supabase auth.users)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer', -- 'customer' | 'agent' | 'admin'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `insurance_companies`
```sql
CREATE TABLE insurance_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  logo_url TEXT,
  website TEXT,
  phone TEXT,
  rating DECIMAL(2,1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `insurance_plans`
```sql
CREATE TABLE insurance_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES insurance_companies(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'health' | 'life' | 'car'

  -- Pricing
  premium_yearly DECIMAL(10,2),
  premium_monthly DECIMAL(10,2),
  sum_insured DECIMAL(12,2),

  -- Coverage (JSONB for flexibility)
  coverage JSONB,

  -- Details
  description TEXT,
  benefits TEXT[],
  exclusions TEXT[],
  waiting_period_days INTEGER,
  documents_required TEXT[],

  -- Meta
  min_age INTEGER,
  max_age INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `saved_plans`
```sql
CREATE TABLE saved_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  plan_id UUID REFERENCES insurance_plans(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plan_id)
);
```

#### `comparison_history`
```sql
CREATE TABLE comparison_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  plan_ids UUID[],
  share_code TEXT UNIQUE,
  insurance_type TEXT,
  filters JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `leads`
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES insurance_plans(id),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  status TEXT DEFAULT 'new', -- 'new' | 'contacted' | 'converted' | 'closed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes
```sql
CREATE INDEX idx_plans_type ON insurance_plans(type);
CREATE INDEX idx_plans_company ON insurance_plans(company_id);
CREATE INDEX idx_plans_active ON insurance_plans(is_active);
CREATE INDEX idx_saved_user ON saved_plans(user_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_comparison_share ON comparison_history(share_code);
```

---

## 🎨 UI/UX Specifications

### Design System

#### Colors (Sky Blue Theme - Bangkok Life Style)
```css
/* Primary - Cyan/Sky Blue */
--primary-50: #ECFEFF;
--primary-100: #CFFAFE;
--primary-500: #06B6D4;  /* Cyan */
--primary-600: #0891B2;
--primary-700: #0E7490;

/* Secondary - Sky Blue */
--secondary-500: #0EA5E9; /* Sky */
--secondary-600: #0284C7;

/* Neutral */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-500: #6B7280;
--gray-900: #1A365D;  /* Dark Blue */

/* Semantic */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #0EA5E9;
```

#### Typography
```css
/* Font Family */
font-family: 'Noto Sans Thai', 'Inter', sans-serif;

/* Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

#### Spacing
```css
/* Based on 4px grid */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
```

#### Components
- Buttons: Rounded corners (8px), Clear hover states
- Cards: Light shadow, 12px padding, 8px border-radius
- Forms: Clear labels, Inline validation
- Tables: Zebra striping, Sticky header

### Responsive Breakpoints
```css
/* Mobile First */
sm: 640px   /* Large phones */
md: 768px   /* iPad Portrait */
lg: 1024px  /* iPad Landscape / Laptops */
xl: 1280px  /* Desktops */
```

### Device-Specific Layouts

| Device | Grid Columns | Card Padding | Modal Style |
|--------|-------------|--------------|-------------|
| iPhone | 1 col | 16px | Slide up from bottom |
| iPad Portrait | 2 cols | 24px | Center modal |
| iPad Landscape | 3 cols | 24px | Center modal |
| Desktop | 3 cols | 24px | Center modal |

### Touch Optimization
- Minimum touch target: 44x44px (Apple HIG)
- Input font-size: 16px (prevents iOS zoom)
- Touch feedback: `active:scale-[0.98]`
- Safe area support for notch devices

---

## 🔐 Security Requirements

### Authentication
- Password minimum 8 characters
- Email verification
- Rate limiting on login attempts
- Secure session management (Supabase handles this)

### Data Protection
- All API routes require authentication (except public pages)
- Row Level Security (RLS) on Supabase tables
- Sanitize user inputs
- HTTPS only

### RLS Policies
```sql
-- Users can only see their own saved plans
CREATE POLICY "Users view own saved plans" ON saved_plans
  FOR SELECT USING (auth.uid() = user_id);

-- Only admins can modify insurance plans
CREATE POLICY "Admins manage plans" ON insurance_plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

---

## 📁 Project Structure

```
easy-insurance/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (main)/
│   │   │   ├── page.tsx                    # Landing
│   │   │   ├── compare/
│   │   │   │   ├── page.tsx                # Select type
│   │   │   │   └── [type]/
│   │   │   │       ├── page.tsx            # Input form
│   │   │   │       └── results/page.tsx    # Results
│   │   │   ├── plan/[id]/page.tsx          # Plan detail
│   │   │   └── share/[code]/page.tsx       # Shared comparison
│   │   ├── dashboard/
│   │   │   ├── page.tsx                    # User dashboard
│   │   │   ├── saved/page.tsx              # Saved plans
│   │   │   └── history/page.tsx            # Comparison history
│   │   ├── admin/
│   │   │   ├── page.tsx                    # Admin dashboard
│   │   │   ├── plans/page.tsx              # Manage plans
│   │   │   └── leads/page.tsx              # View leads
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                             # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   └── Modal.tsx
│   │   ├── forms/
│   │   │   ├── HealthForm.tsx
│   │   │   ├── LifeForm.tsx
│   │   │   └── CarForm.tsx
│   │   ├── compare/
│   │   │   ├── PlanCard.tsx
│   │   │   ├── CompareTable.tsx
│   │   │   └── FilterBar.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── Sidebar.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                   # Browser client
│   │   │   ├── server.ts                   # Server client
│   │   │   └── middleware.ts
│   │   ├── utils.ts
│   │   └── pdf.ts                          # PDF generation
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePlans.ts
│   │   └── useComparison.ts
│   └── types/
│       ├── database.ts                     # Supabase generated types
│       └── index.ts
├── public/
│   ├── images/
│   └── icons/
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── SPEC.md
├── CLAUDE.md
├── README.md
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## 🚀 Deployment

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# App
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Deployment Steps
1. Push to GitHub
2. Connect Vercel to GitHub repo
3. Set environment variables in Vercel
4. Auto-deploy on push to main

---

## 📊 Success Metrics (MVP)

| Metric | Target |
|--------|--------|
| Page Load Time | < 3 seconds |
| Mobile Responsive | 100% |
| Core Web Vitals | All green |
| Uptime | 99.9% |

---

## 🗓️ MVP Scope

### In Scope ✅
- 3 insurance types (Health, Life, Car)
- User authentication
- Plan comparison (up to 3 plans)
- Save plans
- Share comparison link
- PDF export
- Admin panel (basic CRUD)
- Mobile responsive

### Out of Scope ❌ (Future phases)
- Online payment
- AI recommendations
- Chat support
- Multi-language
- Mobile app
- Integration with insurance company APIs
- Commission tracking
- Advanced analytics

---

## 🆕 Version 1.1 Features (Post-MVP)

### Authentication & Error Handling
- ✅ Login/Register with Supabase Auth
- ✅ Thai error messages throughout the app
- ✅ Toast notifications for user feedback
- ✅ Form validation with inline errors
- ✅ **Forgot Password** - Email-based password reset
- ✅ **Reset Password** - Secure password update page

### Save Plans
- ✅ Save plans to user account
- ✅ View saved plans in dashboard
- ✅ Toggle save/unsave from compare modal
- ✅ Real-time sync with Supabase

### Dashboard
- ✅ User stats overview
- ✅ Recent saved plans
- ✅ **Comparison History** - View, share, and delete past comparisons
- ✅ Quick actions

### Loading States
- ✅ Skeleton loaders for all data-fetching pages
- ✅ Loading spinners for async operations
- ✅ Smooth transitions

### Share Link
- ✅ Generate unique share codes
- ✅ Save to comparison_history table
- ✅ Share page for viewing shared comparisons
- ✅ Copy link to clipboard

### Email Notification (Webhook Ready)
- ✅ API endpoint for Supabase webhook
- ✅ Supports Resend/SendGrid integration
- 📋 Configure in Supabase Dashboard > Database Webhooks

### PWA Support
- ✅ Web App Manifest
- ✅ Service Worker for offline caching
- ✅ Install as app on iPad/iPhone
- ✅ Home screen icon support
- ✅ **PWA Icons** - All sizes (72-512px) + favicon
- ✅ **OG Image** - Social sharing preview

### Admin Features
- ✅ Dashboard with stats overview
- ✅ Plans management (CRUD)
- ✅ **Leads Management** - Real-time data from Supabase
- ✅ Status updates with toast feedback
- ✅ Filter by status

### Admin Analytics Dashboard
- ✅ Real-time statistics
- ✅ Lead status distribution
- ✅ Plans by type chart
- ✅ Comparisons by type chart
- ✅ Conversion rate metrics

### SEO
- ✅ Meta tags (Open Graph, Twitter)
- ✅ Sitemap.xml auto-generated
- ✅ Robots.txt configured
- ✅ Structured data ready

---

## 📝 Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-19 | Initial MVP specification |
| 1.1.0 | 2026-03-19 | Added: Toast notifications, Save plans, Share links, PWA, Analytics, SEO |
| 1.2.0 | 2026-03-19 | Added: PWA Icons, Forgot/Reset Password, Dashboard History, Leads Supabase integration |
