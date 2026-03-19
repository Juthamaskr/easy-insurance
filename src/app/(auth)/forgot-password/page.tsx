'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, Button, Input, useToast } from '@/components/ui';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { showToast } = useToast();

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        if (resetError.message.includes('rate limit')) {
          setError('คุณส่งคำขอบ่อยเกินไป กรุณารอสักครู่');
        } else {
          setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        }
        return;
      }

      setIsSubmitted(true);
      showToast({
        type: 'success',
        title: 'ส่งอีเมลแล้ว',
        message: 'กรุณาตรวจสอบอีเมลของคุณ',
      });
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
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
          <h1 className="text-2xl font-bold text-gray-900">ลืมรหัสผ่าน</h1>
          <p className="text-gray-600 mt-2">
            กรอกอีเมลที่ใช้สมัคร เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                ส่งอีเมลแล้ว!
              </h2>
              <p className="text-gray-600">
                เราส่งลิงก์รีเซ็ตรหัสผ่านไปที่
              </p>
              <p className="font-medium text-cyan-600 mt-1">{email}</p>
            </div>
            <div className="text-sm text-gray-500">
              <p>ไม่ได้รับอีเมล? ตรวจสอบโฟลเดอร์ spam</p>
              <p className="mt-1">หรือ</p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="text-cyan-600 hover:text-cyan-700 font-medium mt-1"
              >
                ส่งอีเมลอีกครั้ง
              </button>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={16} className="mr-2" />
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        ) : (
          <>
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="relative">
                <Input
                  label="อีเมล"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
                <Mail
                  className="absolute right-3 top-9 text-gray-400"
                  size={18}
                />
              </div>

              <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
                ส่งลิงก์รีเซ็ตรหัสผ่าน
              </Button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 text-sm"
              >
                <ArrowLeft size={16} className="mr-2" />
                กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
