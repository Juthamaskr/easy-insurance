'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, Button, Input, useToast } from '@/components/ui';
import { ArrowLeft, Settings, Bell, Shield, Database } from 'lucide-react';

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    showToast({
      type: 'success',
      title: 'บันทึกสำเร็จ',
      message: 'อัพเดทการตั้งค่าเรียบร้อยแล้ว',
    });
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            กลับไป Admin Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">ตั้งค่าระบบ</h1>
          <p className="text-gray-600">จัดการการตั้งค่าทั่วไปของระบบ</p>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <Card variant="bordered">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                <Settings size={20} className="text-cyan-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">ตั้งค่าทั่วไป</h2>
                <p className="text-sm text-gray-500">ข้อมูลพื้นฐานของระบบ</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อเว็บไซต์
                </label>
                <Input defaultValue="Easy Insurance" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  คำอธิบายเว็บไซต์
                </label>
                <Input defaultValue="ระบบเปรียบเทียบประกันที่ใช้งานง่าย" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อีเมลติดต่อ
                </label>
                <Input type="email" placeholder="contact@example.com" />
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card variant="bordered">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Bell size={20} className="text-yellow-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">การแจ้งเตือน</h2>
                <p className="text-sm text-gray-500">ตั้งค่าการแจ้งเตือนต่างๆ</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">แจ้งเตือน Lead ใหม่</p>
                  <p className="text-sm text-gray-500">รับอีเมลเมื่อมีลูกค้าสนใจ</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">สรุปรายวัน</p>
                  <p className="text-sm text-gray-500">รับรายงานสรุปทุกวัน</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>
            </div>
          </Card>

          {/* Security Settings */}
          <Card variant="bordered">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Shield size={20} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">ความปลอดภัย</h2>
                <p className="text-sm text-gray-500">การตั้งค่าความปลอดภัย</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">เพิ่มความปลอดภัยด้วยการยืนยันตัวตน 2 ขั้นตอน</p>
                </div>
                <Button variant="outline" size="sm">
                  ตั้งค่า
                </Button>
              </div>
            </div>
          </Card>

          {/* Database Info */}
          <Card variant="bordered">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Database size={20} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">ข้อมูลระบบ</h2>
                <p className="text-sm text-gray-500">สถานะและข้อมูลระบบ</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">เวอร์ชัน</p>
                <p className="font-semibold text-gray-900">1.3.0</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Database</p>
                <p className="font-semibold text-gray-900">Supabase PostgreSQL</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Framework</p>
                <p className="font-semibold text-gray-900">Next.js 14</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Hosting</p>
                <p className="font-semibold text-gray-900">Vercel</p>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} isLoading={saving}>
              บันทึกการตั้งค่า
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
