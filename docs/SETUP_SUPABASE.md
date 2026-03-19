# คู่มือ Setup Supabase (ทีละขั้นตอน)

## สิ่งที่ต้องเตรียม
- อีเมลสำหรับสมัครบัญชี (ใช้ Gmail ได้)
- โปรเจค Easy Insurance ที่โคลนมาแล้ว

---

## ขั้นตอนที่ 1: สร้างบัญชี Supabase

1. ไปที่ **[https://supabase.com](https://supabase.com)**
2. คลิก **"Start your project"** (ปุ่มสีเขียว)
3. เลือก **"Continue with GitHub"** หรือ **"Continue with Google"**
4. อนุญาตให้ Supabase เข้าถึงบัญชี

---

## ขั้นตอนที่ 2: สร้างโปรเจคใหม่

1. คลิก **"New Project"**
2. กรอกข้อมูล:
   - **Name:** `easy-insurance`
   - **Database Password:** สร้างรหัสผ่านที่แข็งแรง (เก็บไว้!)
   - **Region:** เลือก `Southeast Asia (Singapore)` ใกล้ไทยที่สุด
3. คลิก **"Create new project"**
4. รอ 1-2 นาที ให้โปรเจคสร้างเสร็จ

---

## ขั้นตอนที่ 3: คัดลอก API Keys

1. ไปที่ **Project Settings** (ไอคอนฟันเฟือง ด้านซ้ายล่าง)
2. เลือก **API** ในเมนูด้านซ้าย
3. คัดลอกค่าต่อไปนี้:

```
Project URL:      https://xxxxxxxx.supabase.co
anon public:      eyJhbGciOiJIUzI1NiIsInR5cCI6...
service_role:     eyJhbGciOiJIUzI1NiIsInR5cCI6... (เก็บเป็นความลับ!)
```

---

## ขั้นตอนที่ 4: ตั้งค่า Environment Variables

1. เปิดไฟล์ `.env.local` ในโปรเจค Easy Insurance
2. แก้ไขค่า:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. บันทึกไฟล์

---

## ขั้นตอนที่ 5: สร้าง Database Tables

1. ใน Supabase Dashboard ไปที่ **SQL Editor** (เมนูด้านซ้าย)
2. คลิก **"New query"**
3. เปิดไฟล์ `supabase/migrations/001_initial_schema.sql` ในโปรเจค
4. Copy ทั้งหมด แล้ว Paste ใน SQL Editor
5. คลิก **"Run"** (หรือกด Ctrl/Cmd + Enter)
6. ควรเห็น "Success. No rows returned"

---

## ขั้นตอนที่ 6: เพิ่มข้อมูลตัวอย่าง (Seed Data)

1. ยังอยู่ใน SQL Editor คลิก **"New query"**
2. เปิดไฟล์ `supabase/seed.sql` ในโปรเจค
3. Copy ทั้งหมด แล้ว Paste ใน SQL Editor
4. คลิก **"Run"**
5. ควรเห็น "Success. No rows returned"

---

## ขั้นตอนที่ 7: ตั้งค่า Authentication

1. ไปที่ **Authentication** > **Providers**
2. ตรวจสอบว่า **Email** เปิดอยู่ (Enable)
3. (Optional) ตั้งค่า **Site URL** เป็น `http://localhost:3000`

### ตั้งค่า Email Templates (Optional)
1. ไปที่ **Authentication** > **Email Templates**
2. แก้ไข template ให้เป็นภาษาไทย

---

## ขั้นตอนที่ 8: สร้าง Admin User

1. ไปที่ **Authentication** > **Users**
2. คลิก **"Add user"** > **"Create new user"**
3. กรอกข้อมูล:
   - Email: `admin@easyinsurance.com` (หรืออีเมลของคุณ)
   - Password: รหัสผ่านที่ต้องการ
4. คลิก **"Create user"**

### ตั้งค่า Admin Role
1. ไปที่ **SQL Editor**
2. รัน SQL นี้ (แทนที่อีเมลเป็นของคุณ):

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@easyinsurance.com'
);
```

---

## ขั้นตอนที่ 9: ทดสอบการเชื่อมต่อ

1. รัน development server:
```bash
cd ~/Projects/easy-insurance
npm run dev
```

2. เปิด **http://localhost:3000**
3. ไปที่หน้า **เปรียบเทียบประกัน** ควรเห็นข้อมูลแผนประกัน
4. ลอง **Login** ด้วย admin account ที่สร้างไว้

---

## แก้ไขปัญหาที่พบบ่อย

### ไม่เห็นข้อมูลแผนประกัน
- ตรวจสอบว่ารัน seed.sql แล้ว
- ตรวจสอบ RLS policies

### Login ไม่ได้
- ตรวจสอบ API keys ถูกต้อง
- ตรวจสอบว่า Email provider เปิดอยู่

### Error: "Row Level Security"
- ตรวจสอบว่ารัน migrations ครบถ้วน
- ดู Policies ใน Authentication > Policies

---

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase](https://supabase.com/docs/guides/auth/server-side/nextjs)

---

## ขั้นตอนถัดไป

หลังจาก setup Supabase เสร็จแล้ว:
1. อ่านคู่มือ [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) เพื่อ deploy ขึ้น production
