import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  ArcElement,
} from 'chart.js';
import { AlertCircle, AlertTriangle, Clock, Car, Users, Receipt, TrendingUp, TrendingDown } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement, 
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

interface CenterData {
  accidents: { today: number; overall: number; fatal: number; nonFatal: number };
  violations: { total: number; reported: number; speeding: number; redLight: number; drunkDriving: number; noHelmet: number };
  challans: { total: number; collected_amount: number; pending_amount: number; online_payment: number; offline_payment: number };
  zone: string;
  enforcementOfficers: number;
  trafficVolume: { peak: number; offPeak: number; daily: number };
  cameras: { operational: number; total: number };
  response: { avgTimeMinutes: number };
}

interface ProcessedData {
  [key: string]: CenterData;
}

interface FilterState {
  zone: string;
  centerId: string;
  timeFrame: string;
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

interface AccidentData {
  today: number;
  overall: number;
  fatal?: number;
  nonFatal?: number;
}

interface TrafficData {
  centerId: string;
  location: {
    zone: string;
  };
  enforcement_officers: number;
  accidents: AccidentData;
  violations: {
    total: number;
    reported: number;
    speeding?: number;
    redLight?: number;
    drunkDriving?: number;
    noHelmet?: number;
  };
  challans: {
    total: number;
    collected_amount: number;
    pending_amount?: number;
    online_payment?: number;
    offline_payment?: number;
  };
  trafficVolume?: {
    peak?: number;
    offPeak?: number;
    daily?: number;
  };
  cameras?: {
    operational?: number;
    total?: number;
  };
  response?: {
    avgTimeMinutes?: number;
  };
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

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      intersect: false,
    },
    legend: {
      position: 'right' as const
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
            datasets: [
              {
                label: 'Total Accidents',
                data: Object.values(filteredData).map(center => center.accidents.overall),
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
                borderColor: 'rgb(239, 68, 68)',
              },
              {
                label: 'Fatal Accidents',
                data: Object.values(filteredData).map(center => center.accidents.fatal),
                backgroundColor: 'rgba(153, 27, 27, 0.5)',
                borderColor: 'rgb(153, 27, 27)',
              }
            ]
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
      <CardTitle>Violations by Type</CardTitle>
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
            datasets: [
              {
                label: 'Speeding',
                data: Object.values(filteredData).map(center => center.violations.speeding),
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
              },
              {
                label: 'Red Light',
                data: Object.values(filteredData).map(center => center.violations.redLight),
                backgroundColor: 'rgba(220, 38, 38, 0.5)',
                borderColor: 'rgb(220, 38, 38)',
              },
              {
                label: 'Drunk Driving',
                data: Object.values(filteredData).map(center => center.violations.drunkDriving),
                backgroundColor: 'rgba(139, 92, 246, 0.5)',
                borderColor: 'rgb(139, 92, 246)',
              },
              {
                label: 'No Helmet/Seatbelt',
                data: Object.values(filteredData).map(center => center.violations.noHelmet),
                backgroundColor: 'rgba(245, 158, 11, 0.5)',
                borderColor: 'rgb(245, 158, 11)',
              }
            ]
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
            datasets: [
              {
                label: 'Collected Revenue (₹)',
                data: Object.values(filteredData).map(center => center.challans.collected_amount),
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                borderColor: 'rgb(16, 185, 129)',
              },
              {
                label: 'Pending Revenue (₹)',
                data: Object.values(filteredData).map(center => center.challans.pending_amount),
                backgroundColor: 'rgba(245, 158, 11, 0.5)',
                borderColor: 'rgb(245, 158, 11)',
              }
            ]
          }}
          options={chartOptions}
        />
      </div>
    </CardContent>
  </Card>
));

const PaymentMethodsChart: React.FC<ChartComponentProps> = React.memo(({ filteredData }) => {
  const totalOnline = Object.values(filteredData).reduce((sum, center) => sum + center.challans.online_payment, 0);
  const totalOffline = Object.values(filteredData).reduce((sum, center) => sum + center.challans.offline_payment, 0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Online vs Offline payments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Doughnut
            data={{
              labels: ['Online Payments', 'Offline Payments'],
              datasets: [
                {
                  data: [totalOnline, totalOffline],
                  backgroundColor: [
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(59, 130, 246, 0.7)',
                  ],
                  borderColor: [
                    'rgb(16, 185, 129)',
                    'rgb(59, 130, 246)',
                  ],
                  borderWidth: 1,
                }
              ]
            }}
            options={doughnutOptions}
          />
        </div>
      </CardContent>
    </Card>
  );
});

const ViolationTypesChart: React.FC<ChartComponentProps> = React.memo(({ filteredData }) => {
  const speeding = Object.values(filteredData).reduce((sum, center) => sum + center.violations.speeding, 0);
  const redLight = Object.values(filteredData).reduce((sum, center) => sum + center.violations.redLight, 0);
  const drunkDriving = Object.values(filteredData).reduce((sum, center) => sum + center.violations.drunkDriving, 0);
  const noHelmet = Object.values(filteredData).reduce((sum, center) => sum + center.violations.noHelmet, 0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Violation Types Distribution</CardTitle>
        <CardDescription>Breakdown by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Doughnut
            data={{
              labels: ['Speeding', 'Red Light', 'Drunk Driving', 'No Helmet/Seatbelt'],
              datasets: [
                {
                  data: [speeding, redLight, drunkDriving, noHelmet],
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(220, 38, 38, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                  ],
                  borderColor: [
                    'rgb(59, 130, 246)',
                    'rgb(220, 38, 38)',
                    'rgb(139, 92, 246)',
                    'rgb(245, 158, 11)',
                  ],
                  borderWidth: 1,
                }
              ]
            }}
            options={doughnutOptions}
          />
        </div>
      </CardContent>
    </Card>
  );
});

const TrafficVolumeChart: React.FC<ChartComponentProps> = React.memo(({ filteredData, filters }) => (
  <Card>
    <CardHeader>
      <CardTitle>Traffic Volume by Center</CardTitle>
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
            datasets: [
              {
                label: 'Peak Hour Volume',
                data: Object.values(filteredData).map(center => center.trafficVolume.peak),
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
                borderColor: 'rgb(239, 68, 68)',
              },
              {
                label: 'Off-Peak Volume',
                data: Object.values(filteredData).map(center => center.trafficVolume.offPeak),
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                borderColor: 'rgb(16, 185, 129)',
              }
            ]
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
    centerId: 'all',
    timeFrame: 'month'
  });

  const handleZoneChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, zone: value, centerId: 'all' }));
  }, []);

  const handleCenterChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, centerId: value }));
  }, []);

  const handleTimeFrameChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, timeFrame: value }));
  }, []);

  const processedData = useMemo(() => {
    return data.reduce((acc: ProcessedData, item: TrafficData) => {
      if (!acc[item.centerId]) {
        acc[item.centerId] = {
          accidents: { 
            today: 0, 
            overall: 0,
            fatal: 0,
            nonFatal: 0
          },
          violations: { 
            total: 0, 
            reported: 0,
            speeding: 0,
            redLight: 0,
            drunkDriving: 0,
            noHelmet: 0
          },
          challans: { 
            total: 0, 
            collected_amount: 0,
            pending_amount: 0,
            online_payment: 0,
            offline_payment: 0
          },
          zone: item.location.zone,
          enforcementOfficers: item.enforcement_officers,
          trafficVolume: {
            peak: 0,
            offPeak: 0,
            daily: 0
          },
          cameras: {
            operational: 0,
            total: 0
          },
          response: {
            avgTimeMinutes: 0
          }
        };
      }

      const center = acc[item.centerId];
      center.accidents.today += item.accidents.today;
      center.accidents.overall += item.accidents.overall;
      center.accidents.fatal += item.accidents?.fatal || 0;
      center.accidents.nonFatal += item.accidents?.nonFatal || 0;
      
      center.violations.total += item.violations.total;
      center.violations.reported += item.violations.reported;
      center.violations.speeding += item.violations?.speeding || 0;
      center.violations.redLight += item.violations?.redLight || 0;
      center.violations.drunkDriving += item.violations?.drunkDriving || 0;
      center.violations.noHelmet += item.violations?.noHelmet || 0;
      
      center.challans.total += item.challans.total;
      center.challans.collected_amount += item.challans.collected_amount;
      center.challans.pending_amount += item.challans?.pending_amount || 0;
      center.challans.online_payment += item.challans?.online_payment || 0;
      center.challans.offline_payment += item.challans?.offline_payment || 0;
      
      center.trafficVolume.peak += item.trafficVolume?.peak || 0;
      center.trafficVolume.offPeak += item.trafficVolume?.offPeak || 0;
      center.trafficVolume.daily += item.trafficVolume?.daily || 0;
      
      center.cameras.operational += item.cameras?.operational || 0;
      center.cameras.total += item.cameras?.total || 0;
      
      center.response.avgTimeMinutes = item.response?.avgTimeMinutes || 0;

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
      fatalAccidents: centers.reduce((sum, center) => sum + center.accidents.fatal, 0),
      violations: centers.reduce((sum, center) => sum + center.violations.total, 0),
      challans: centers.reduce((sum, center) => sum + center.challans.total, 0),
      amount: centers.reduce((sum, center) => sum + center.challans.collected_amount, 0),
      pendingAmount: centers.reduce((sum, center) => sum + center.challans.pending_amount, 0),
      officers: centers.reduce((sum, center) => sum + center.enforcementOfficers, 0),
      cameras: centers.reduce((sum, center) => sum + center.cameras.operational, 0),
      responseTime: centers.length > 0 
        ? centers.reduce((sum, center) => sum + center.response.avgTimeMinutes, 0) / centers.length 
        : 0,
      trafficVolume: centers.reduce((sum, center) => sum + center.trafficVolume.daily, 0),
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

          <Select
            value={filters.timeFrame}
            onValueChange={handleTimeFrameChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Accidents"
          value={totals.accidents}
          icon={AlertCircle}
          description={`${totals.fatalAccidents} fatal accidents`}
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Revenue"
          value={`₹${totals.pendingAmount.toLocaleString()}`}
          icon={TrendingDown}
          description="Amount yet to be collected"
          trend={-5}
        />
        <StatCard
          title="Response Time"
          value={`${totals.responseTime.toFixed(1)} min`}
          icon={Clock}
          description="Average emergency response time"
          trend={-8}
        />
        <StatCard
          title="Traffic Volume"
          value={totals.trafficVolume.toLocaleString()}
          icon={Car}
          description="Daily vehicle count"
          trend={4}
        />
        <StatCard
          title="Enforcement Officers"
          value={totals.officers}
          icon={Users}
          description="On active duty"
          trend={2}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AccidentsChart filteredData={filteredData} filters={filters} />
        <ViolationsChart filteredData={filteredData} filters={filters} />
        <RevenueChart filteredData={filteredData} filters={filters} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PaymentMethodsChart filteredData={filteredData} filters={filters} />
        <ViolationTypesChart filteredData={filteredData} filters={filters} />
        <TrafficVolumeChart filteredData={filteredData} filters={filters} />
      </div>
    </div>
  );
};

export default Dashboard;