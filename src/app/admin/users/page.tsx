'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Select, Modal, Skeleton, useToast } from '@/components/ui';
import { ArrowLeft, Users, Shield, UserCog, User, RefreshCw, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Profile, UserRole } from '@/types';

const roleLabels: Record<UserRole, { label: string; color: string; icon: typeof User }> = {
  admin: { label: 'Admin', color: 'bg-red-100 text-red-700', icon: Shield },
  agent: { label: 'Agent', color: 'bg-yellow-100 text-yellow-700', icon: UserCog },
  customer: { label: 'Customer', color: 'bg-green-100 text-green-700', icon: User },
};

type UserWithEmail = Profile & { email?: string };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithEmail | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('customer');
  const [updating, setUpdating] = useState(false);
  const { showToast } = useToast();

  const supabase = createClient();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // For each profile, we need to get email from auth.users
      // Since we can't directly query auth.users from client, we'll use the admin API
      // For now, we'll show profiles without email (email can be added via server component or API)
      setUsers(profiles || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast({
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditRole = (user: UserWithEmail) => {
    setSelectedUser(user);
    setNewRole(user.role);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', selectedUser.id);

      if (error) throw error;

      // Update local state
      setUsers(users.map(u =>
        u.id === selectedUser.id ? { ...u, role: newRole } : u
      ));

      setSelectedUser(null);
      showToast({
        type: 'success',
        title: 'อัพเดทสำเร็จ',
        message: `เปลี่ยน role เป็น "${roleLabels[newRole].label}" แล้ว`,
      });
    } catch (error) {
      console.error('Error updating role:', error);
      showToast({
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถอัพเดท role ได้',
      });
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    agent: users.filter(u => u.role === 'agent').length,
    customer: users.filter(u => u.role === 'customer').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            กลับไป Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">จัดการผู้ใช้งาน</h1>
              <p className="text-gray-600">
                ทั้งหมด {stats.total} คน | Admin {stats.admin} | Agent {stats.agent} | Customer {stats.customer}
              </p>
            </div>
            <Button variant="outline" onClick={fetchUsers} disabled={loading}>
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              รีเฟรช
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card variant="bordered" className="text-center">
            <Users size={24} className="mx-auto text-gray-500 mb-2" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-gray-500">ทั้งหมด</p>
          </Card>
          <Card variant="bordered" className="text-center">
            <Shield size={24} className="mx-auto text-red-500 mb-2" />
            <p className="text-2xl font-bold">{stats.admin}</p>
            <p className="text-sm text-gray-500">Admin</p>
          </Card>
          <Card variant="bordered" className="text-center">
            <UserCog size={24} className="mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{stats.agent}</p>
            <p className="text-sm text-gray-500">Agent</p>
          </Card>
          <Card variant="bordered" className="text-center">
            <User size={24} className="mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{stats.customer}</p>
            <p className="text-sm text-gray-500">Customer</p>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, เบอร์โทร, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <Card variant="bordered">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card variant="bordered">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">
                  {users.length === 0 ? 'ยังไม่มีผู้ใช้ในระบบ' : 'ไม่พบผู้ใช้ที่ค้นหา'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">ผู้ใช้</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">เบอร์โทร</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">สมัครเมื่อ</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const RoleIcon = roleLabels[user.role].icon;
                      return (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                                <span className="text-cyan-600 font-medium">
                                  {user.full_name?.charAt(0) || '?'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {user.full_name || 'ไม่ระบุชื่อ'}
                                </p>
                                <p className="text-sm text-gray-500">{user.id.slice(0, 8)}...</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {user.phone || '-'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleLabels[user.role].color}`}>
                              <RoleIcon size={12} />
                              {roleLabels[user.role].label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditRole(user)}
                            >
                              แก้ไข Role
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Edit Role Modal */}
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title="แก้ไข Role"
        >
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center">
                  <span className="text-cyan-600 font-medium text-lg">
                    {selectedUser.full_name?.charAt(0) || '?'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedUser.full_name || 'ไม่ระบุชื่อ'}
                  </p>
                  <p className="text-sm text-gray-500">{selectedUser.phone || '-'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เลือก Role ใหม่
                </label>
                <Select
                  options={[
                    { label: '🔴 Admin - จัดการทุกอย่าง', value: 'admin' },
                    { label: '🟡 Agent - ดู leads และ analytics', value: 'agent' },
                    { label: '🟢 Customer - ใช้งานทั่วไป', value: 'customer' },
                  ]}
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>หมายเหตุ:</strong> การเปลี่ยน role จะมีผลทันที ผู้ใช้จะได้รับสิทธิ์ตาม role ใหม่เมื่อ refresh หน้า
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedUser(null)}
                >
                  ยกเลิก
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleUpdateRole}
                  disabled={updating || newRole === selectedUser.role}
                  isLoading={updating}
                >
                  บันทึก
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
