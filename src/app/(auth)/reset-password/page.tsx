'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, Button, Input, useToast } from '@/components/ui';
import { CheckCircle, Lock, AlertCircle } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  const supabase = createClient();

  // Check if user has valid session from email link
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsValidSession(!!session);
    };
    checkSession();

    // Listen for auth state changes (when user clicks email link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const validatePassword = () => {
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return false;
    }
    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePassword()) return;

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        if (updateError.message.includes('same password')) {
          setError('กรุณาใช้รหัสผ่านใหม่ที่ไม่เหมือนเดิม');
        } else {
          setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        }
        return;
      }

      setIsSuccess(true);
      showToast({
        type: 'success',
        title: 'เปลี่ยนรหัสผ่านสำเร็จ',
        message: 'คุณสามารถใช้รหัสผ่านใหม่เข้าสู่ระบบได้แล้ว',
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isValidSession === null) {
    return (
      <Card variant="elevated" className="w-full max-w-md p-8 text-center">
        <div className="animate-pulse">กำลังตรวจสอบ...</div>
      </Card>
    );
  }

  // Invalid or expired link
  if (!isValidSession) {
    return (
      <Card variant="elevated" className="w-full max-w-md p-8">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              ลิงก์หมดอายุ
            </h2>
            <p className="text-gray-600">
              ลิงก์รีเซ็ตรหัสผ่านหมดอายุแล้ว หรือถูกใช้ไปแล้ว
            </p>
          </div>
          <Link href="/forgot-password">
            <Button className="w-full">
              ขอลิงก์ใหม่
            </Button>
          </Link>
          <Link
            href="/login"
            className="inline-block text-gray-600 hover:text-gray-900 text-sm"
          >
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </Card>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <Card variant="elevated" className="w-full max-w-md p-8">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              เปลี่ยนรหัสผ่านสำเร็จ!
            </h2>
            <p className="text-gray-600">
              คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว
            </p>
            <p className="text-sm text-gray-500 mt-2">
              กำลังนำคุณไปหน้าเข้าสู่ระบบ...
            </p>
          </div>
          <Link href="/login">
            <Button className="w-full">
              เข้าสู่ระบบ
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="w-full max-w-md p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center space-x-2 mb-4">
          <span className="text-3xl">🛡️</span>
          <span className="font-bold text-xl text-gray-900">Easy Insurance</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">ตั้งรหัสผ่านใหม่</h1>
        <p className="text-gray-600 mt-2">
          กรอกรหัสผ่านใหม่ที่คุณต้องการใช้
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="relative">
          <Input
            label="รหัสผ่านใหม่"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Lock
            className="absolute right-3 top-9 text-gray-400"
            size={18}
          />
          <p className="text-xs text-gray-500 mt-1">อย่างน้อย 6 ตัวอักษร</p>
        </div>

        <div className="relative">
          <Input
            label="ยืนยันรหัสผ่านใหม่"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            error={confirmPassword && password !== confirmPassword ? 'รหัสผ่านไม่ตรงกัน' : undefined}
          />
          <Lock
            className="absolute right-3 top-9 text-gray-400"
            size={18}
          />
        </div>

        <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
          ตั้งรหัสผ่านใหม่
        </Button>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Suspense fallback={
        <Card variant="elevated" className="w-full max-w-md p-8 text-center">
          <div className="animate-pulse">กำลังโหลด...</div>
        </Card>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
