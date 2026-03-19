'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Input, Select, Modal, useToast, SkeletonTable } from '@/components/ui';
import { Plus, Pencil, Trash2, Search, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { formatPrice, getInsuranceTypeLabel } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { InsurancePlan, InsuranceCompany } from '@/types';

export default function AdminPlansPage() {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InsurancePlan | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    company_id: '',
    type: 'health',
    premium_yearly: '',
    premium_monthly: '',
    sum_insured: '',
    description: '',
    benefits: '',
    exclusions: '',
    waiting_period_days: '30',
    min_age: '',
    max_age: '',
  });

  const supabase = createClient();

  // Fetch plans and companies
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, companiesRes] = await Promise.all([
        supabase
          .from('insurance_plans')
          .select('*, company:insurance_companies(*)')
          .order('created_at', { ascending: false }),
        supabase
          .from('insurance_companies')
          .select('*')
          .order('name'),
      ]);

      if (plansRes.error) {
        throw plansRes.error;
      }
      if (companiesRes.error) {
        throw companiesRes.error;
      }

      if (plansRes.data) setPlans(plansRes.data);
      if (companiesRes.data) setCompanies(companiesRes.data);
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'โหลดข้อมูลไม่สำเร็จ',
        message: error.message || 'กรุณาลองใหม่อีกครั้ง',
      });
    }
    setLoading(false);
  };

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch = plan.name.toLowerCase().includes(search.toLowerCase()) ||
      plan.company?.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || plan.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (planId: string) => {
    setDeleting(true);
    const { error } = await supabase
      .from('insurance_plans')
      .delete()
      .eq('id', planId);

    if (error) {
      showToast({
        type: 'error',
        title: 'ลบไม่สำเร็จ',
        message: 'ไม่สามารถลบแผนประกันได้ กรุณาลองใหม่',
      });
    } else {
      setPlans(plans.filter((p) => p.id !== planId));
      showToast({
        type: 'success',
        title: 'ลบแล้ว',
        message: 'ลบแผนประกันเรียบร้อยแล้ว',
      });
    }
    setDeleting(false);
    setDeleteConfirm(null);
  };

  const handleToggleActive = async (planId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('insurance_plans')
      .update({ is_active: !currentStatus })
      .eq('id', planId);

    if (error) {
      showToast({
        type: 'error',
        title: 'เปลี่ยนสถานะไม่สำเร็จ',
        message: 'กรุณาลองใหม่อีกครั้ง',
      });
    } else {
      setPlans(plans.map((p) =>
        p.id === planId ? { ...p, is_active: !currentStatus } : p
      ));
      showToast({
        type: 'success',
        title: currentStatus ? 'ปิดใช้งานแล้ว' : 'เปิดใช้งานแล้ว',
      });
    }
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      company_id: companies[0]?.id || '',
      type: 'health',
      premium_yearly: '',
      premium_monthly: '',
      sum_insured: '',
      description: '',
      benefits: '',
      exclusions: '',
      waiting_period_days: '30',
      min_age: '1',
      max_age: '65',
    });
    setShowAddModal(true);
  };

  const openEditModal = (plan: InsurancePlan) => {
    setFormData({
      name: plan.name,
      company_id: plan.company_id,
      type: plan.type,
      premium_yearly: plan.premium_yearly?.toString() || '',
      premium_monthly: plan.premium_monthly?.toString() || '',
      sum_insured: plan.sum_insured?.toString() || '',
      description: plan.description || '',
      benefits: plan.benefits?.join('\n') || '',
      exclusions: plan.exclusions?.join('\n') || '',
      waiting_period_days: plan.waiting_period_days?.toString() || '30',
      min_age: plan.min_age?.toString() || '',
      max_age: plan.max_age?.toString() || '',
    });
    setEditingPlan(plan);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const planData = {
      name: formData.name,
      company_id: formData.company_id,
      type: formData.type,
      premium_yearly: parseFloat(formData.premium_yearly) || 0,
      premium_monthly: parseFloat(formData.premium_monthly) || null,
      sum_insured: parseFloat(formData.sum_insured) || 0,
      description: formData.description,
      benefits: formData.benefits.split('\n').filter(b => b.trim()),
      exclusions: formData.exclusions.split('\n').filter(e => e.trim()),
      waiting_period_days: parseInt(formData.waiting_period_days) || 30,
      min_age: parseInt(formData.min_age) || null,
      max_age: parseInt(formData.max_age) || null,
    };

    try {
      if (editingPlan) {
        // Update
        const { error } = await supabase
          .from('insurance_plans')
          .update(planData)
          .eq('id', editingPlan.id);

        if (error) throw error;

        showToast({
          type: 'success',
          title: 'บันทึกสำเร็จ',
          message: 'แก้ไขแผนประกันเรียบร้อยแล้ว',
        });
      } else {
        // Insert
        const { error } = await supabase
          .from('insurance_plans')
          .insert(planData);

        if (error) throw error;

        showToast({
          type: 'success',
          title: 'เพิ่มสำเร็จ',
          message: 'เพิ่มแผนประกันใหม่เรียบร้อยแล้ว',
        });
      }

      // Refresh data
      await fetchData();
      setShowAddModal(false);
      setEditingPlan(null);
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'บันทึกไม่สำเร็จ',
        message: error.message || 'กรุณาลองใหม่อีกครั้ง',
      });
    }

    setSaving(false);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingPlan(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <SkeletonTable />
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-gray-900">จัดการแผนประกัน</h1>
              <p className="text-gray-600">ทั้งหมด {plans.length} แผน</p>
            </div>
            <Button onClick={openAddModal}>
              <Plus size={20} className="mr-2" />
              เพิ่มแผนใหม่
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card variant="bordered" className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="ค้นหาชื่อแผนหรือบริษัท..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              options={[
                { label: 'ทุกประเภท', value: 'all' },
                { label: 'ประกันสุขภาพ', value: 'health' },
                { label: 'ประกันชีวิต', value: 'life' },
                { label: 'ประกันรถยนต์', value: 'car' },
              ]}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full md:w-48"
            />
          </div>
        </Card>

        {/* Plans Table */}
        <Card variant="bordered" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ชื่อแผน</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">บริษัท</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ประเภท</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">เบี้ย/ปี</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">สถานะ</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map((plan) => (
                  <tr key={plan.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{plan.name}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">{plan.description}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{plan.company?.name}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                        {getInsuranceTypeLabel(plan.type)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatPrice(plan.premium_yearly)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(plan.id, plan.is_active)}
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          plan.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {plan.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(plan)}
                          className="p-2 text-gray-400 hover:text-cyan-600 transition-colors"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(plan.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPlans.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              ไม่พบแผนประกันที่ตรงกับการค้นหา
            </div>
          )}
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showAddModal || !!editingPlan}
          onClose={closeModal}
          title={editingPlan ? 'แก้ไขแผนประกัน' : 'เพิ่มแผนประกันใหม่'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="ชื่อแผน"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="เช่น AIA Health Plus"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="บริษัท"
                options={companies.map(c => ({ label: c.name, value: c.id }))}
                value={formData.company_id}
                onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
              />
              <Select
                label="ประเภท"
                options={[
                  { label: 'ประกันสุขภาพ', value: 'health' },
                  { label: 'ประกันชีวิต', value: 'life' },
                  { label: 'ประกันรถยนต์', value: 'car' },
                ]}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="เบี้ยประกัน/ปี (บาท)"
                type="number"
                value={formData.premium_yearly}
                onChange={(e) => setFormData({ ...formData, premium_yearly: e.target.value })}
                placeholder="12000"
                required
              />
              <Input
                label="เบี้ยประกัน/เดือน (บาท)"
                type="number"
                value={formData.premium_monthly}
                onChange={(e) => setFormData({ ...formData, premium_monthly: e.target.value })}
                placeholder="1000"
              />
              <Input
                label="ทุนประกัน (บาท)"
                type="number"
                value={formData.sum_insured}
                onChange={(e) => setFormData({ ...formData, sum_insured: e.target.value })}
                placeholder="500000"
                required
              />
            </div>
            <Input
              label="คำอธิบาย"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="รายละเอียดแผนประกัน"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ความคุ้มครอง (บรรทัดละรายการ)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  rows={4}
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  placeholder="ค่าห้องพัก 3,000 บาท/วัน&#10;OPD 1,500 บาท/ครั้ง&#10;ค่าผ่าตัดตามจริง"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ข้อยกเว้น (บรรทัดละรายการ)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  rows={4}
                  value={formData.exclusions}
                  onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })}
                  placeholder="โรคที่เป็นมาก่อน&#10;การรักษาทางทันตกรรม"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="ระยะรอคอย (วัน)"
                type="number"
                value={formData.waiting_period_days}
                onChange={(e) => setFormData({ ...formData, waiting_period_days: e.target.value })}
                placeholder="30"
              />
              <Input
                label="อายุขั้นต่ำ"
                type="number"
                value={formData.min_age}
                onChange={(e) => setFormData({ ...formData, min_age: e.target.value })}
                placeholder="1"
              />
              <Input
                label="อายุสูงสุด"
                type="number"
                value={formData.max_age}
                onChange={(e) => setFormData({ ...formData, max_age: e.target.value })}
                placeholder="65"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModal}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 size={18} className="mr-2 animate-spin" />}
                {editingPlan ? 'บันทึกการแก้ไข' : 'เพิ่มแผน'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="ยืนยันการลบ"
          size="sm"
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle size={32} className="text-red-600" />
            </div>
            <p className="text-gray-600 mb-6">
              คุณแน่ใจหรือไม่ที่จะลบแผนประกันนี้?<br />
              <span className="text-sm text-gray-500">การดำเนินการนี้ไม่สามารถย้อนกลับได้</span>
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                ยกเลิก
              </Button>
              <Button
                variant="danger"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleting}
              >
                {deleting && <Loader2 size={18} className="mr-2 animate-spin" />}
                ลบแผน
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
