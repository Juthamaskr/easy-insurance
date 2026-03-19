'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, Button, Input, useToast } from '@/components/ui';
import { CheckCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const registered = searchParams.get('registered');
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const supabase = createClient();

  // Show success message if just registered
  useEffect(() => {
    if (registered === 'true') {
      setShowSuccess(true);
    }
  }, [registered]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Map Supabase errors to Thai messages
        if (authError.message.includes('Invalid login credentials')) {
          setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ');
        } else if (authError.message.includes('Too many requests')) {
          setError('คุณลองเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่');
        } else {
          setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        }
        return;
      }

      showToast({
        type: 'success',
        title: 'เข้าสู่ระบบสำเร็จ',
        message: 'ยินดีต้อนรับกลับ!',
      });

      router.push(redirect);
      router.refresh();
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="elevated" className="w-full max-w-md p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center space-x-2 mb-4">
          <span className="text-3xl">🛡️</span>
          <span className="font-bold text-xl text-gray-900">Easy Insurance</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">เข้าสู่ระบบ</h1>
        <p className="text-gray-600 mt-2">
          ยินดีต้อนรับกลับ! กรุณาเข้าสู่ระบบ
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Success message after registration */}
        {showSuccess && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle size={18} />
            <span>สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          label="อีเมล"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
        />

        <Input
          label="รหัสผ่าน"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            จดจำฉัน
          </label>
          <Link href="/forgot-password" className="text-cyan-600 hover:text-cyan-700">
            ลืมรหัสผ่าน?
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
          เข้าสู่ระบบ
        </Button>
      </form>

      {/* Register Link */}
      <p className="mt-6 text-center text-sm text-gray-600">
        ยังไม่มีบัญชี?{' '}
        <Link href="/register" className="text-cyan-600 hover:text-cyan-700 font-medium">
          สมัครสมาชิก
        </Link>
      </p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Suspense fallback={
        <Card variant="elevated" className="w-full max-w-md p-8 text-center">
          <div className="animate-pulse">กำลังโหลด...</div>
        </Card>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
