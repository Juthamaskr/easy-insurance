'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, Button, Input, useToast } from '@/components/ui';

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'กรุณากรอกชื่อ-นามสกุล';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!formData.password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (formData.password.length < 8) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
          },
        },
      });

      if (error) {
        // Map Supabase errors to Thai messages
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          setErrors({ ...errors, email: 'อีเมลนี้ถูกใช้งานแล้ว' });
        } else if (error.message.includes('valid email')) {
          setErrors({ ...errors, email: 'รูปแบบอีเมลไม่ถูกต้อง' });
        } else if (error.message.includes('password')) {
          setErrors({ ...errors, password: 'รหัสผ่านไม่ปลอดภัยพอ กรุณาใช้ตัวอักษรผสมตัวเลข' });
        } else {
          setGeneralError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        }
        return;
      }

      showToast({
        type: 'success',
        title: 'สมัครสมาชิกสำเร็จ!',
        message: 'กรุณาเข้าสู่ระบบ',
      });

      // Success - redirect to login
      router.push('/login?registered=true');
    } catch {
      setGeneralError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card variant="elevated" className="w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <span className="text-3xl">🛡️</span>
            <span className="font-bold text-xl text-gray-900">Easy Insurance</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">สมัครสมาชิก</h1>
          <p className="text-gray-600 mt-2">
            สร้างบัญชีเพื่อบันทึกแผนประกันที่สนใจ
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {generalError && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {generalError}
            </div>
          )}

          <Input
            label="ชื่อ-นามสกุล"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="ชื่อจริง นามสกุล"
            error={errors.fullName}
            required
          />

          <Input
            label="อีเมล"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            error={errors.email}
            required
          />

          <Input
            label="เบอร์โทรศัพท์"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="08x-xxx-xxxx"
            hint="ไม่บังคับ"
          />

          <Input
            label="รหัสผ่าน"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="อย่างน้อย 8 ตัวอักษร"
            hint={errors.password ? undefined : 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'}
            error={errors.password}
            required
          />

          <Input
            label="ยืนยันรหัสผ่าน"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="กรอกรหัสผ่านอีกครั้ง"
            error={errors.confirmPassword}
            required
          />

          <div className="flex items-start">
            <input type="checkbox" className="mt-1 mr-2" required />
            <label className="text-sm text-gray-600">
              ฉันยอมรับ{' '}
              <a href="#" className="text-cyan-600 hover:text-cyan-700">
                ข้อกำหนดการใช้งาน
              </a>{' '}
              และ{' '}
              <a href="#" className="text-cyan-600 hover:text-cyan-700">
                นโยบายความเป็นส่วนตัว
              </a>
            </label>
          </div>

          <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
            สมัครสมาชิก
          </Button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          มีบัญชีอยู่แล้ว?{' '}
          <Link href="/login" className="text-cyan-600 hover:text-cyan-700 font-medium">
            เข้าสู่ระบบ
          </Link>
        </p>
      </Card>
    </div>
  );
}
