# คู่มือ Deploy ขึ้น Vercel (ฟรี)

## สิ่งที่ต้องเตรียม
- บัญชี GitHub (มีโค้ดอยู่แล้ว)
- Supabase setup เรียบร้อย (ดู SETUP_SUPABASE.md)
- API Keys จาก Supabase

---

## ขั้นตอนที่ 1: Push Code ไป GitHub

### ถ้ายังไม่มี Git Repository

```bash
cd ~/Projects/easy-insurance

# Initialize git (ถ้ายังไม่มี)
git init

# เพิ่มไฟล์ทั้งหมด
git add .

# Commit
git commit -m "Initial commit: Easy Insurance MVP"
```

### สร้าง Repository บน GitHub

1. ไปที่ **[github.com/new](https://github.com/new)**
2. ตั้งชื่อ: `easy-insurance`
3. เลือก **Private** (แนะนำ)
4. คลิก **Create repository**
5. รันคำสั่งที่ GitHub แสดง:

```bash
git remote add origin https://github.com/YOUR_USERNAME/easy-insurance.git
git branch -M main
git push -u origin main
```

---

## ขั้นตอนที่ 2: สมัครบัญชี Vercel

1. ไปที่ **[vercel.com](https://vercel.com)**
2. คลิก **"Start Deploying"**
3. เลือก **"Continue with GitHub"**
4. อนุญาตให้ Vercel เข้าถึง GitHub

---

## ขั้นตอนที่ 3: Import Project

1. คลิก **"Add New..."** > **"Project"**
2. ค้นหา repository `easy-insurance`
3. คลิก **"Import"**

---

## ขั้นตอนที่ 4: ตั้งค่า Environment Variables

ในหน้า Configure Project:

1. เลื่อนลงไปที่ **"Environment Variables"**
2. เพิ่มตัวแปรทีละตัว:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1Ni...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1Ni...` |
| `NEXT_PUBLIC_APP_URL` | (ใส่ทีหลังหลัง deploy) |

3. คลิก **"Deploy"**

---

## ขั้นตอนที่ 5: รอ Deploy

1. Vercel จะ build และ deploy อัตโนมัติ
2. รอประมาณ 1-3 นาที
3. เมื่อเสร็จ จะได้ URL เช่น:
   - `https://easy-insurance-xxx.vercel.app`

---

## ขั้นตอนที่ 6: Update App URL

1. ไปที่ **Project Settings** > **Environment Variables**
2. แก้ไข `NEXT_PUBLIC_APP_URL` เป็น URL ที่ได้
3. คลิก **Save**
4. ไปที่ **Deployments** > คลิก **"Redeploy"**

---

## ขั้นตอนที่ 7: ตั้งค่า Supabase สำหรับ Production

### Update Auth Settings

1. ไปที่ Supabase Dashboard > **Authentication** > **URL Configuration**
2. เพิ่ม URL ใน **Site URL**: `https://easy-insurance-xxx.vercel.app`
3. เพิ่ม URL ใน **Redirect URLs**: `https://easy-insurance-xxx.vercel.app/**`

---

## ขั้นตอนที่ 8: ทดสอบ Production

1. เปิด URL ที่ได้จาก Vercel
2. ทดสอบ:
   - [x] หน้าแรกแสดงถูกต้อง
   - [x] เปรียบเทียบประกันทำงาน
   - [x] Login/Register ทำงาน
   - [x] Admin Panel เข้าถึงได้

---

## ตั้งค่า Custom Domain (Optional)

### ถ้าต้องการใช้โดเมนของตัวเอง

1. ไปที่ **Project Settings** > **Domains**
2. เพิ่มโดเมน เช่น `easyinsurance.com`
3. ทำตามคำแนะนำเพื่อตั้งค่า DNS

### ตัวอย่าง DNS Settings
```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

---

## Auto Deploy

Vercel จะ deploy อัตโนมัติทุกครั้งที่ push code ไป GitHub:

```bash
# แก้ไขโค้ด
git add .
git commit -m "Update feature X"
git push

# Vercel จะ deploy อัตโนมัติ!
```

---

## ดู Logs & Analytics

1. **Deployments** - ดูประวัติการ deploy
2. **Analytics** - ดูสถิติการใช้งาน (Free tier จำกัด)
3. **Logs** - ดู runtime logs

---

## Free Tier Limits

Vercel Free Tier ให้:
- **Bandwidth:** 100GB/เดือน
- **Builds:** 100/วัน
- **Serverless Functions:** 100GB-Hours/เดือน
- **Edge Functions:** 500K invocations/เดือน

สำหรับเว็บประกันขนาดเล็ก-กลาง ฟรีเพียงพอครับ!

---

## แก้ไขปัญหาที่พบบ่อย

### Build Failed

1. ดู Build Logs ใน Vercel
2. ตรวจสอบ Environment Variables
3. รัน `npm run build` ใน local ก่อน

### Auth ไม่ทำงาน

1. ตรวจสอบ Site URL ใน Supabase
2. ตรวจสอบ Redirect URLs
3. Clear cookies และลองใหม่

### 500 Error

1. ดู Function Logs
2. ตรวจสอบ Supabase connection
3. ตรวจสอบ API Keys

---

## Resources

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI](https://vercel.com/docs/cli)

---

## สรุป

หลัง deploy เสร็จ คุณจะได้:
- URL สำหรับแชร์ให้ลูกค้า
- Auto deploy เมื่อ push code
- HTTPS และ CDN ฟรี
- ไม่มีค่าใช้จ่าย (Free tier)

ขอให้โชคดีกับการขายประกันครับ! 🎉
