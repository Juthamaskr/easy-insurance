'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Select, Modal, Skeleton, useToast } from '@/components/ui';
import { ArrowLeft, Phone, Mail, MessageSquare, Check, X, RefreshCw, StickyNote, Calendar, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Lead, LeadStatus } from '@/types';

const statusLabels: Record<LeadStatus, string> = {
  new: 'ใหม่',
  contacted: 'ติดต่อแล้ว',
  converted: 'ปิดการขาย',
  closed: 'ปิด',
};

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-green-100 text-green-700',
  contacted: 'bg-blue-100 text-blue-700',
  converted: 'bg-purple-100 text-purple-700',
  closed: 'bg-gray-100 text-gray-500',
};

type LeadWithPlan = Lead & { plan_name?: string; notes?: string; follow_up_date?: string };

interface CustomerNote {
  id: string;
  content: string;
  note_type: string;
  created_at: string;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadWithPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<LeadWithPlan | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [customerNotes, setCustomerNotes] = useState<CustomerNote[]>([]);
  const [followUpDate, setFollowUpDate] = useState('');
  const { showToast } = useToast();
  const supabase = createClient();

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          plan:insurance_plans(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedLeads: LeadWithPlan[] = (data || []).map((lead) => ({
        ...lead,
        plan_name: lead.plan?.name || 'ไม่ระบุ',
      }));

      setLeads(formattedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      showToast({
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถโหลดข้อมูล Leads ได้',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    if (selectedLead) {
      fetchNotes(selectedLead.id);
      setFollowUpDate(selectedLead.follow_up_date || '');
    }
  }, [selectedLead?.id]);

  const fetchNotes = async (leadId: string) => {
    try {
      const { data, error } = await supabase
        .from('customer_notes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomerNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const addNote = async () => {
    if (!selectedLead || !newNote.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('customer_notes')
        .insert({
          lead_id: selectedLead.id,
          user_id: user.id,
          content: newNote,
          note_type: 'general',
        });

      if (error) throw error;

      showToast({
        type: 'success',
        title: 'บันทึกสำเร็จ',
        message: 'เพิ่มบันทึกเรียบร้อยแล้ว',
      });

      setNewNote('');
      fetchNotes(selectedLead.id);
    } catch (error) {
      console.error('Error adding note:', error);
      showToast({
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถเพิ่มบันทึกได้',
      });
    }
  };

  const updateFollowUp = async () => {
    if (!selectedLead) return;

    try {
      const { error } = await supabase
        .from('leads')
        .update({ follow_up_date: followUpDate || null })
        .eq('id', selectedLead.id);

      if (error) throw error;

      showToast({
        type: 'success',
        title: 'บันทึกสำเร็จ',
        message: 'ตั้งวันติดตามเรียบร้อยแล้ว',
      });

      setLeads(leads.map(l =>
        l.id === selectedLead.id ? { ...l, follow_up_date: followUpDate } : l
      ));
    } catch (error) {
      console.error('Error updating follow up:', error);
    }
  };

  const filteredLeads = leads.filter((lead) =>
    statusFilter === 'all' || lead.status === statusFilter
  );

  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;

      setLeads(leads.map((l) =>
        l.id === leadId ? { ...l, status: newStatus } : l
      ));
      setSelectedLead(null);

      showToast({
        type: 'success',
        title: 'อัพเดทสำเร็จ',
        message: `เปลี่ยนสถานะเป็น "${statusLabels[newStatus]}" แล้ว`,
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      showToast({
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถอัพเดทสถานะได้',
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    const days = Math.floor(hours / 24);
    return `${days} วันที่แล้ว`;
  };

  const newLeadsCount = leads.filter(l => l.status === 'new').length;

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
              <h1 className="text-2xl font-bold text-gray-900">จัดการ Leads</h1>
              <p className="text-gray-600">
                ทั้งหมด {leads.length} รายการ | ใหม่ {newLeadsCount} รายการ
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={fetchLeads}
                disabled={loading}
              >
                <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                รีเฟรช
              </Button>
              <Select
                options={[
                  { label: 'ทุกสถานะ', value: 'all' },
                  { label: 'ใหม่', value: 'new' },
                  { label: 'ติดต่อแล้ว', value: 'contacted' },
                  { label: 'ปิดการขาย', value: 'converted' },
                  { label: 'ปิด', value: 'closed' },
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-48"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} variant="bordered" className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-48" />
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Leads List */}
            <div className="space-y-4">
              {filteredLeads.map((lead) => (
                <Card
                  key={lead.id}
                  variant="bordered"
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedLead(lead)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[lead.status]}`}>
                          {statusLabels[lead.status]}
                        </span>
                      </div>
                      <p className="text-sm text-cyan-600 mb-1">{lead.plan_name}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Phone size={14} className="mr-1" />
                          {lead.phone}
                        </span>
                        {lead.email && (
                          <span className="flex items-center">
                            <Mail size={14} className="mr-1" />
                            {lead.email}
                          </span>
                        )}
                      </div>
                      {lead.message && (
                        <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <MessageSquare size={14} className="inline mr-1" />
                          {lead.message}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{getTimeAgo(lead.created_at)}</p>
                      <p className="text-xs text-gray-400">{formatDate(lead.created_at)}</p>
                    </div>
                  </div>
                </Card>
              ))}

              {filteredLeads.length === 0 && (
                <Card variant="bordered" className="text-center py-12">
                  <p className="text-gray-500">
                    {leads.length === 0
                      ? 'ยังไม่มี Lead ในระบบ'
                      : 'ไม่มี Lead ในสถานะนี้'}
                  </p>
                </Card>
              )}
            </div>
          </>
        )}

        {/* Lead Detail Modal */}
        <Modal
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          title="รายละเอียด Lead"
          size="lg"
        >
          {selectedLead && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{selectedLead.name}</h3>
                <span className={`px-3 py-1 rounded-full text-sm ${statusColors[selectedLead.status]}`}>
                  {statusLabels[selectedLead.status]}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">แผนที่สนใจ</p>
                <p className="font-medium text-cyan-600">{selectedLead.plan_name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">เบอร์โทร</p>
                  <a href={`tel:${selectedLead.phone}`} className="text-cyan-600 hover:underline">
                    {selectedLead.phone}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-500">อีเมล</p>
                  {selectedLead.email ? (
                    <a href={`mailto:${selectedLead.email}`} className="text-cyan-600 hover:underline">
                      {selectedLead.email}
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              </div>

              {selectedLead.message && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">ข้อความ</p>
                  <p className="bg-gray-50 p-3 rounded-lg">{selectedLead.message}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500">เวลาที่ส่ง</p>
                <p>{formatDate(selectedLead.created_at)}</p>
              </div>

              {/* Follow-up Date */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-yellow-600" />
                  <p className="text-sm font-medium text-yellow-800">วันนัดติดตาม</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                  <Button size="sm" onClick={updateFollowUp}>
                    บันทึก
                  </Button>
                </div>
              </div>

              {/* Customer Notes */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <StickyNote size={16} className="text-gray-600" />
                  <p className="font-medium text-gray-900">บันทึกการติดต่อ</p>
                </div>

                {/* Add Note */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="เพิ่มบันทึก..."
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && addNote()}
                  />
                  <Button size="sm" onClick={addNote} disabled={!newNote.trim()}>
                    <Send size={14} />
                  </Button>
                </div>

                {/* Notes List */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {customerNotes.length > 0 ? (
                    customerNotes.map((note) => (
                      <div key={note.id} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-800">{note.content}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(note.created_at)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">
                      ยังไม่มีบันทึก
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {selectedLead.status === 'new' && (
                  <Button
                    onClick={() => updateLeadStatus(selectedLead.id, 'contacted')}
                    disabled={updating}
                  >
                    <Phone size={16} className="mr-2" />
                    ติดต่อแล้ว
                  </Button>
                )}
                {(selectedLead.status === 'new' || selectedLead.status === 'contacted') && (
                  <Button
                    variant="secondary"
                    onClick={() => updateLeadStatus(selectedLead.id, 'converted')}
                    disabled={updating}
                  >
                    <Check size={16} className="mr-2" />
                    ปิดการขาย
                  </Button>
                )}
                {selectedLead.status !== 'closed' && (
                  <Button
                    variant="outline"
                    onClick={() => updateLeadStatus(selectedLead.id, 'closed')}
                    disabled={updating}
                  >
                    <X size={16} className="mr-2" />
                    ปิด Lead
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
