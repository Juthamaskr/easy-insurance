# Easy Insurance 🛡️

ระบบเปรียบเทียบประกันที่ใช้งานง่าย สำหรับตัวแทนขายประกันและลูกค้าทั่วไป

## ✨ Features

### Core Features
- 📊 **เปรียบเทียบประกัน** - เปรียบเทียบแผนประกันสุขภาพ ชีวิต และรถยนต์
- 💾 **บันทึกแผนที่สนใจ** - Login แล้วบันทึกแผนไว้ดูทีหลังได้
- 🔗 **แชร์ผลเปรียบเทียบ** - สร้างลิงก์ unique ส่งให้คนอื่นดูได้
- 📄 **Export PDF** - ดาวน์โหลดผลเปรียบเทียบเป็น PDF
- 👨‍💼 **Admin Panel** - จัดการแผนประกันและดู Analytics
- 📱 **Responsive** - ใช้งานได้ทุกอุปกรณ์ (iPhone, iPad, Desktop)

### New in v1.1
- 📲 **PWA Support** - ติดตั้งเป็น app บน iPad/iPhone ได้
- 📈 **Analytics Dashboard** - ดูสถิติ leads, แผนประกัน, การเปรียบเทียบ
- 🔔 **Toast Notifications** - แจ้งเตือนแบบ modern
- ⚡ **Skeleton Loaders** - UX ที่ดีขึ้นตอนโหลดข้อมูล
- 🔍 **SEO Optimized** - Sitemap, meta tags, Open Graph

### New in v1.2
- 🔑 **Forgot Password** - รีเซ็ตรหัสผ่านผ่านอีเมล
- 📜 **Comparison History** - ดูประวัติการเปรียบเทียบ + แชร์ลิงก์
- 👥 **Leads Management** - เชื่อมต่อ Supabase + อัพเดทสถานะ real-time
- 🎨 **PWA Icons** - ไอคอนครบทุกขนาด + OG Image

### New in v1.3
- 👑 **User Management** - จัดการ role ผู้ใช้งาน (Admin/Agent/Customer)
- 🚀 **First User = Admin** - User คนแรกเป็น Admin อัตโนมัติ ไม่ต้องรัน SQL
- 🔐 **Role-based Access** - แยกสิทธิ์การเข้าถึงตาม role

### New in v1.4 - Agent Tools
- 💰 **Commission Tracker** - ติดตามค่าคอมมิชชั่นและรายได้
- 🧮 **Quote Calculator** - คำนวณเบี้ยประกันตามอายุ/เพศ
- 📝 **Customer Notes** - จดบันทึกลูกค้า + ประวัติการติดต่อ
- ⏰ **Follow-up Reminder** - แจ้งเตือนติดตามลูกค้า
- 🤖 **AI Recommendation** - แนะนำแผนประกันที่เหมาะสม

### New in v1.5 - UX Improvements
- 📊 **Analytics Charts** - กราฟแสดงสถิติด้วย Recharts
- 🌙 **Dark Mode** - โหมดมืดสำหรับใช้งานสบายตา
- 🔍 **Search Plans** - ค้นหาแผนประกันแบบ real-time
- 💬 **AI Chatbot** - ผู้ช่วย AI ตอบคำถามและแนะนำประกัน

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm หรือ yarn
- Supabase account (ฟรี)

### Installation

1. **Clone repository**
```bash
git clone <repo-url>
cd easy-insurance
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup Supabase**
   - สร้างโปรเจคใหม่ที่ [supabase.com](https://supabase.com)
   - Copy URL และ Anon Key

4. **Setup environment variables**
```bash
cp .env.example .env.local
```

แก้ไข `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. **Run database migrations**
```bash
npx supabase db push
```

6. **Seed sample data (optional)**
```bash
npx supabase db seed
```

7. **Start development server**
```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/              # Pages (Next.js App Router)
│   ├── (auth)/       # Login, Register
│   ├── (main)/       # Landing, Compare, Plans
│   ├── dashboard/    # User dashboard
│   └── admin/        # Admin panel
├── components/       # React components
├── lib/              # Utilities
├── hooks/            # Custom hooks
└── types/            # TypeScript types
```

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Supabase | Database + Auth |
| Vercel | Hosting |

## 📝 Available Scripts

```bash
npm run dev        # Development server
npm run build      # Production build
npm run start      # Start production
npm run lint       # Run linter
npm run type-check # Check TypeScript
```

## 🌐 Deployment

### Vercel (Recommended - Free)

1. Push code to GitHub
2. Import project ใน Vercel
3. Add environment variables
4. Deploy!

### Environment Variables (Production)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## 💰 Cost

**$0/เดือน** สำหรับ MVP
- Vercel Free Tier: 100GB bandwidth
- Supabase Free Tier: 500MB database, 50K auth users

## 📖 Documentation

- [USER_MANUAL.md](./USER_MANUAL.md) - **คู่มือการใช้งาน (ภาษาไทย)**
- [SPEC.md](./SPEC.md) - Full specification
- [CLAUDE.md](./CLAUDE.md) - Developer context

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License - ใช้ได้ฟรี ทำอะไรก็ได้

---

Made with ❤️ for insurance agents
