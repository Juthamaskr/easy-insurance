'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface LeadStatusChartProps {
  data: { name: string; value: number; color: string }[];
}

export function LeadStatusChart({ data }: LeadStatusChartProps) {
  if (data.length === 0) {
    return <div className="text-center text-gray-500 py-8">ยังไม่มีข้อมูล</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} รายการ`, '']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface PlanTypeChartProps {
  data: { name: string; count: number }[];
}

export function PlanTypeChart({ data }: PlanTypeChartProps) {
  if (data.length === 0) {
    return <div className="text-center text-gray-500 py-8">ยังไม่มีข้อมูล</div>;
  }

  const COLORS = ['#0891B2', '#8B5CF6', '#10B981'];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => [`${value} แผน`, 'จำนวน']} />
        <Bar dataKey="count" fill="#0891B2">
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface MonthlyTrendChartProps {
  data: { month: string; leads: number; comparisons: number }[];
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  if (data.length === 0) {
    return <div className="text-center text-gray-500 py-8">ยังไม่มีข้อมูล</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="leads"
          name="Leads"
          stroke="#8B5CF6"
          strokeWidth={2}
          dot={{ fill: '#8B5CF6' }}
        />
        <Line
          type="monotone"
          dataKey="comparisons"
          name="การเปรียบเทียบ"
          stroke="#0891B2"
          strokeWidth={2}
          dot={{ fill: '#0891B2' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface CommissionChartProps {
  data: { month: string; amount: number }[];
}

export function CommissionChart({ data }: CommissionChartProps) {
  if (data.length === 0) {
    return <div className="text-center text-gray-500 py-8">ยังไม่มีข้อมูล</div>;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value) => [formatCurrency(Number(value) || 0), 'Commission']} />
        <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface ConversionFunnelProps {
  comparisons: number;
  leads: number;
  converted: number;
}

export function ConversionFunnel({ comparisons, leads, converted }: ConversionFunnelProps) {
  const data = [
    { name: 'เปรียบเทียบ', value: comparisons, color: '#0891B2' },
    { name: 'Leads', value: leads, color: '#8B5CF6' },
    { name: 'ปิดการขาย', value: converted, color: '#10B981' },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={80} />
        <Tooltip formatter={(value) => [`${value} รายการ`, '']} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
