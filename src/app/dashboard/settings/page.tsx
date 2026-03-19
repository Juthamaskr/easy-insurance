'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, Input, useToast } from '@/components/ui';
import { ArrowLeft, User, Phone, Mail, Shield, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const { showToast } = useToast();

  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?redirect=/dashboard/settings');
        return;
      }

      setEmail(user.email || '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || '');
        setPhone(profile.phone || '');
        setRole(profile.role || 'customer');
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
        })
        .eq('id', user.id);

      if (error) throw error;

      showToast({
        type: 'success',
        title: 'บันทึกสำเร็จ',
        message: 'อัพเดทข้อมูลเรียบร้อยแล้ว',
      });
    } catch (error) {
      console.error('Error saving:', error);
      showToast({
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถบันทึกข้อมูลได้',
      });
    } finally {
      setSaving(false);
    }
  };

  const roleLabels: Record<string, { label: string; color: string }> = {
    admin: { label: 'Admin', color: 'bg-red-100 text-red-700' },
    agent: { label: 'Agent', color: 'bg-yellow-100 text-yellow-700' },
    customer: { label: 'Customer', color: 'bg-green-100 text-green-700' },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            กลับไป Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">ตั้งค่าบัญชี</h1>
          <p className="text-gray-600">จัดการข้อมูลส่วนตัวของคุณ</p>
        </div>

        {/* Profile Card */}
        <Card variant="bordered" className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center">
              <span className="text-cyan-600 font-bold text-2xl">
                {fullName?.charAt(0) || email?.charAt(0) || '?'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {fullName || 'ไม่ระบุชื่อ'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleLabels[role]?.color || 'bg-gray-100'}`}>
                  <Shield size={12} />
                  {roleLabels[role]?.label || role}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User size={16} className="inline mr-2" />
                ชื่อ-นามสกุล
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="กรอกชื่อ-นามสกุล"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail size={16} className="inline mr-2" />
                อีเมล
              </label>
              <Input
                value={email}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">ไม่สามารถเปลี่ยนอีเมลได้</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone size={16} className="inline mr-2" />
                เบอร์โทรศัพท์
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0xx-xxx-xxxx"
              />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button onClick={handleSave} isLoading={saving}>
              <Save size={16} className="mr-2" />
              บันทึกการเปลี่ยนแปลง
            </Button>
          </div>
        </Card>

        {/* Change Password */}
        <Card variant="bordered">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">เปลี่ยนรหัสผ่าน</h3>
          <p className="text-gray-600 mb-4">
            ต้องการเปลี่ยนรหัสผ่าน? เราจะส่งลิงก์รีเซ็ตไปที่อีเมลของคุณ
          </p>
          <Link href="/forgot-password">
            <Button variant="outline">
              ส่งลิงก์รีเซ็ตรหัสผ่าน
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
