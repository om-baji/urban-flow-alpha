import React, { useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { AlertCircle, TrendingUp, AlertTriangle, Receipt } from 'lucide-react';
import { TrafficData } from '@/server/types';
import useSuper from '@/server/useSuper';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);
 

interface CenterData {
  accidents: { today: number; overall: number };
  violations: { total: number; reported: number };
  challans: { total: number; collected_amount: number };
  zone: string;
  enforcementOfficers: number;
}

interface ProcessedData {
  [key: string]: CenterData;
}

interface FilterState {
  zone: string;
  centerId: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  trend?: number;
}

interface DashboardProps {
  data: TrafficData[];
}

interface ChartComponentProps {
  filteredData: ProcessedData;
  filters: FilterState;
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      intersect: false,
      mode: 'index' as const
    },
    legend: {
      position: 'top' as const
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
};

const StatCard: React.FC<StatCardProps> = React.memo(({ title, value, icon: Icon, description, trend }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
      {trend !== undefined && (
        <div className={`text-xs mt-2 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from previous period
        </div>
      )}
    </CardContent>
  </Card>
));

const AccidentsChart: React.FC<ChartComponentProps> = React.memo(({ filteredData, filters }) => (
  <Card>
    <CardHeader>
      <CardTitle>Accidents by Center</CardTitle>
      <CardDescription>
        {filters.zone === 'all' ? 'All zones' : `${filters.zone} zone`}
        {filters.centerId !== 'all' && ` - Center ${filters.centerId}`}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-[300px]">
        <Line
          data={{
            labels: Object.keys(filteredData),
            datasets: [{
              label: 'Total Accidents',
              data: Object.values(filteredData).map(center => center.accidents.overall),
              backgroundColor: 'rgba(239, 68, 68, 0.5)',
              borderColor: 'rgb(239, 68, 68)',
            }]
          }}
          options={chartOptions}
        />
      </div>
    </CardContent>
  </Card>
));

const ViolationsChart: React.FC<ChartComponentProps> = React.memo(({ filteredData, filters }) => (
  <Card>
    <CardHeader>
      <CardTitle>Violations by Center</CardTitle>
      <CardDescription>
        {filters.zone === 'all' ? 'All zones' : `${filters.zone} zone`}
        {filters.centerId !== 'all' && ` - Center ${filters.centerId}`}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-[300px]">
        <Bar
          data={{
            labels: Object.keys(filteredData),
            datasets: [{
              label: 'Violations',
              data: Object.values(filteredData).map(center => center.violations.total),
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
              borderColor: 'rgb(59, 130, 246)',
            }]
          }}
          options={chartOptions}
        />
      </div>
    </CardContent>
  </Card>
));

const RevenueChart: React.FC<ChartComponentProps> = React.memo(({ filteredData, filters }) => (
  <Card>
    <CardHeader>
      <CardTitle>Revenue by Center</CardTitle>
      <CardDescription>
        {filters.zone === 'all' ? 'All zones' : `${filters.zone} zone`}
        {filters.centerId !== 'all' && ` - Center ${filters.centerId}`}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-[300px]">
        <Line
          data={{
            labels: Object.keys(filteredData),
            datasets: [{
              label: 'Revenue (₹)',
              data: Object.values(filteredData).map(center => center.challans.collected_amount),
              backgroundColor: 'rgba(16, 185, 129, 0.5)',
              borderColor: 'rgb(16, 185, 129)',
            }]
          }}
          options={chartOptions}
        />
      </div>
    </CardContent>
  </Card>
));

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [filters, setFilters] = useState<FilterState>({
    zone: 'all',
    centerId: 'all'
  });

  const handleZoneChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, zone: value, centerId: 'all' }));
  }, []);

  const handleCenterChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, centerId: value }));
  }, []);

  const processedData = useMemo(() => {
    return data.reduce((acc: ProcessedData, item: TrafficData) => {
      if (!acc[item.centerId]) {
        acc[item.centerId] = {
          accidents: { today: 0, overall: 0 },
          violations: { total: 0, reported: 0 },
          challans: { total: 0, collected_amount: 0 },
          zone: item.location.zone,
          enforcementOfficers: item.enforcement_officers
        };
      }

      const center = acc[item.centerId];
      center.accidents.today += item.accidents.today;
      center.accidents.overall += item.accidents.overall;
      center.violations.total += item.violations.total;
      center.violations.reported += item.violations.reported;
      center.challans.total += item.challans.total;
      center.challans.collected_amount += item.challans.collected_amount;

      return acc;
    }, {});
  }, [data]);

  const zones = useMemo(() => 
    [...new Set(data.map(item => item.location.zone))],
    [data]
  );

  const centerIds = useMemo(() => {
    const centers = Object.entries(processedData);
    if (filters.zone === 'all') {
      return centers.map(([id]) => id);
    }
    return centers
      .filter(([_, data]) => data.zone === filters.zone)
      .map(([id]) => id);
  }, [processedData, filters.zone]);

  const filteredData = useMemo(() => {
    let filtered = processedData;

    if (filters.zone !== 'all') {
      filtered = Object.entries(filtered).reduce((acc: ProcessedData, [centerId, data]) => {
        if (data.zone === filters.zone) {
          acc[centerId] = data;
        }
        return acc;
      }, {});
    }

    if (filters.centerId !== 'all') {
      filtered = Object.entries(filtered).reduce((acc: ProcessedData, [centerId, data]) => {
        if (centerId === filters.centerId) {
          acc[centerId] = data;
        }
        return acc;
      }, {});
    }

    return filtered;
  }, [processedData, filters]);

  const totals = useMemo(() => {
    const centers = Object.values(filteredData);
    return {
      accidents: centers.reduce((sum, center) => sum + center.accidents.overall, 0),
      violations: centers.reduce((sum, center) => sum + center.violations.total, 0),
      challans: centers.reduce((sum, center) => sum + center.challans.total, 0),
      amount: centers.reduce((sum, center) => sum + center.challans.collected_amount, 0),
    };
  }, [filteredData]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Traffic Management Dashboard</h2>
        <div className="flex gap-3">
          <Select
            value={filters.zone}
            onValueChange={handleZoneChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zones</SelectItem>
              {zones.map(zone => (
                <SelectItem key={zone} value={zone}>{zone} Zone</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.centerId}
            onValueChange={handleCenterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select center" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Centers</SelectItem>
              {centerIds.map(id => (
                <SelectItem key={id} value={id}>{id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Accidents"
          value={totals.accidents}
          icon={AlertCircle}
          description={`${filters.centerId === 'all' ? 'All centers' : `Center ${filters.centerId}`}`}
          trend={-12}
        />
        <StatCard
          title="Total Violations"
          value={totals.violations}
          icon={AlertTriangle}
          description={`${filters.zone === 'all' ? 'All zones' : `${filters.zone} zone`}`}
          trend={8}
        />
        <StatCard
          title="Total Challans"
          value={totals.challans}
          icon={Receipt}
          description="Challans issued"
          trend={15}
        />
        <StatCard
          title="Revenue Generated"
          value={`₹${totals.amount.toLocaleString()}`}
          icon={TrendingUp}
          description="Total amount collected"
          trend={23}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AccidentsChart filteredData={filteredData} filters={filters} />
        <ViolationsChart filteredData={filteredData} filters={filters} />
        <RevenueChart filteredData={filteredData} filters={filters} />
      </div>
    </div>
  );
};

export default Dashboard;