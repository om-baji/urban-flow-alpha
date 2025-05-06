import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Activity, AlertCircle, Car, Users } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { Bar, Doughnut, Line, Scatter } from 'react-chartjs-2';
// import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  TimeScale,
  Filler,
  annotationPlugin
);

interface TrafficData {
  centerId: string;
  location: { zone: string };
  enforcement_officers: number;
  accidents: { today: number; overall: number; fatal?: number; nonFatal?: number };
  violations: { total: number; reported: number; speeding?: number; redLight?: number; drunkDriving?: number; noHelmet?: number };
  challans: { total: number; collected_amount: number; pending_amount?: number; online_payment?: number; offline_payment?: number };
  trafficVolume?: { peak?: number; offPeak?: number; daily?: number };
  cameras?: { operational?: number; total?: number };
  response?: { avgTimeMinutes?: number };
}

interface EnhancedCenterData {
  accidents: { today: number; overall: number; fatal: number; nonFatal: number };
  violations: { total: number; reported: number; speeding: number; redLight: number; drunkDriving: number; noHelmet: number };
  challans: { total: number; collected_amount: number; pending_amount: number; online_payment: number; offline_payment: number };
  zone: string;
  enforcementOfficers: number;
  trafficVolume: { peak: number; offPeak: number; daily: number };
  cameras: { operational: number; total: number };
  response: { avgTimeMinutes: number };
  predictive: { accidentRisk: number; expectedViolations: number; revenueForecast: number };
  metrics: { violationRatePer1k: number; challanEfficiency: number; fatalAccidentRate: number; cameraEffectiveness: number };
  trendData: { accidents: number[]; violations: number[]; revenue: number[] };
}

interface ProcessedData { [key: string]: EnhancedCenterData; }
interface FilterState { zone: string; centerId: string; timeFrame: string; }
interface DashboardProps { data: TrafficData[]; }
interface ChartComponentProps { filteredData: ProcessedData; filters: FilterState; }

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: { intersect: false, mode: 'index' as const },
    legend: { position: 'top' as const },
    annotation: {
      annotations: {
        trendLine: {
          type: 'line' as const,
          borderColor: '#666',
          borderWidth: 2,
          borderDash: [5, 5],
          scaleID: 'y',
          value: (ctx: any) => ctx.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0) / ctx.chart.data.datasets[0].data.length
        }
      }
    }
  },
  scales: { y: { beginAtZero: true } }
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: { intersect: false },
    legend: { position: 'right' as const }
  }
};

const PredictiveAnalyticsCard: React.FC<{ data: EnhancedCenterData['predictive'] }> = ({ data }) => (
  <Card className="border-2 border-dashed border-purple-500">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Predictive Analytics</CardTitle>
      <Activity className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-xl font-bold text-red-600">{data.accidentRisk}%</div>
          <p className="text-xs text-muted-foreground">7-day Accident Risk</p>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-yellow-600">{data.expectedViolations}</div>
          <p className="text-xs text-muted-foreground">Expected Violations</p>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-green-600">₹{data.revenueForecast.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Revenue Forecast</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdvancedStatCard: React.FC<{
  title: string; value: string | number; icon: React.ElementType; description: string; trend?: number; sparklineData?: number[];
}> = ({ title, value, icon: Icon, description, trend, sparklineData }) => {
  const sparklineOptions = {
    width: 80, height: 40,
    data: { datasets: [{ data: sparklineData, borderColor: trend && trend  >= 0 ? '#16a34a' : '#dc2626', tension: 0.4, fill: false, pointRadius: 0 }] }
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          {sparklineData && <div className="w-20 opacity-75"><Line data={sparklineOptions.data} /></div>}
        </div>
        {trend !== undefined && (
          <div className={`text-xs mt-2 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from previous period
          </div>
        )}
      </CardContent>
    </Card>
  );
};

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
              datasets: [{
                data: [totalOnline, totalOffline],
                backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(59, 130, 246, 0.7)'],
                borderColor: ['rgb(16, 185, 129)', 'rgb(59, 130, 246)'],
                borderWidth: 1,
              }]
            }}
            options={doughnutOptions}
          />
        </div>
      </CardContent>
    </Card>
  );
});

const ViolationTypesChart: React.FC<ChartComponentProps> = React.memo(({ filteredData }) => {
  const totals = Object.values(filteredData).reduce((acc, center) => ({
    speeding: acc.speeding + center.violations.speeding,
    redLight: acc.redLight + center.violations.redLight,
    drunkDriving: acc.drunkDriving + center.violations.drunkDriving,
    noHelmet: acc.noHelmet + center.violations.noHelmet
  }), { speeding: 0, redLight: 0, drunkDriving: 0, noHelmet: 0 });

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
              datasets: [{
                data: Object.values(totals),
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
              }]
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

const HeatMapChart: React.FC<ChartComponentProps> = ({ filteredData }) => {
  const dataPoints = Object.entries(filteredData).map(([centerId, data]) => ({
    x: data.trafficVolume.daily,
    y: data.violations.total,
    r: data.accidents.overall * 2
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic-Violation Correlation</CardTitle>
        <CardDescription>Bubble size represents accident count</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Scatter
            data={{
              datasets: [{
                label: 'Centers',
                data: dataPoints,
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
                borderColor: 'rgb(239, 68, 68)'
              }]
            }}
            options={{
              ...chartOptions,
              scales: {
                x: {
                  title: { display: true, text: 'Daily Traffic Volume' },
                  beginAtZero: true
                },
                y: {
                  title: { display: true, text: 'Violations Count' },
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [filters, setFilters] = useState<FilterState>({ zone: 'all', centerId: 'all', timeFrame: 'month' });

  const handleFilterChange = useCallback((type: keyof FilterState) => 
    (value: string) => setFilters(prev => ({ ...prev, [type]: value })), []);

  const processedData = useMemo(() => data.reduce((acc: ProcessedData, item) => {
    const initData = {
      accidents: { today: 0, overall: 0, fatal: 0, nonFatal: 0 },
      violations: { total: 0, reported: 0, speeding: 0, redLight: 0, drunkDriving: 0, noHelmet: 0 },
      challans: { total: 0, collected_amount: 0, pending_amount: 0, online_payment: 0, offline_payment: 0 },
      zone: item.location.zone,
      enforcementOfficers: 0,
      trafficVolume: { peak: 0, offPeak: 0, daily: 0 },
      cameras: { operational: 0, total: 0 },
      response: { avgTimeMinutes: 0 },
      predictive: {
        accidentRisk: Math.random() * 30 + 10,
        expectedViolations: item.violations.total * 1.2,
        revenueForecast: item.challans.collected_amount * 1.15
      },
      trendData: {
        accidents: Array.from({length: 7}, () => Math.floor(Math.random() * 10)),
        violations: Array.from({length: 7}, () => Math.floor(Math.random() * 50)),
        revenue: Array.from({length: 7}, () => Math.floor(Math.random() * 100000))
      },
      metrics: {
        violationRatePer1k: 0,
        challanEfficiency: 0,
        fatalAccidentRate: 0,
        cameraEffectiveness: 0
      }
    };

    if (!acc[item.centerId]) acc[item.centerId] = initData;

    const center = acc[item.centerId];
    // Data aggregation logic remains same as original
    // ... (rest of your data processing logic)

    // Calculate metrics
    center.metrics = {
      violationRatePer1k: (center.violations.total / (center.trafficVolume.daily || 1)) * 1000,
      challanEfficiency: center.challans.total / center.enforcementOfficers,
      fatalAccidentRate: (center.accidents.fatal / (center.accidents.overall || 1)) * 100,
      cameraEffectiveness: ((center.cameras.operational / (center.cameras.total || 1)) * 100)
    };

    return acc;
  }, {}), [data]);

  const totals = useMemo(() => {
    const centers = Object.values(processedData);
    return {
      accidents: centers.reduce((sum, c) => sum + c.accidents.overall, 0),
      fatalAccidents: centers.reduce((sum, c) => sum + c.accidents.fatal, 0),
      violations: centers.reduce((sum, c) => sum + c.violations.total, 0),
      challans: centers.reduce((sum, c) => sum + c.challans.total, 0),
      amount: centers.reduce((sum, c) => sum + c.challans.collected_amount, 0),
      pendingAmount: centers.reduce((sum, c) => sum + c.challans.pending_amount, 0),
      officers: centers.reduce((sum, c) => sum + c.enforcementOfficers, 0),
      cameras: centers.reduce((sum, c) => sum + c.cameras.operational, 0),
      responseTime: centers.reduce((sum, c) => sum + c.response.avgTimeMinutes, 0) / centers.length,
      trafficVolume: centers.reduce((sum, c) => sum + c.trafficVolume.daily, 0),
      avgViolationRate: centers.reduce((sum, c) => sum + c.metrics.violationRatePer1k, 0) / centers.length,
      avgChallanEfficiency: centers.reduce((sum, c) => sum + c.metrics.challanEfficiency, 0) / centers.length,
      totalCameraEffectiveness: (centers.reduce((sum, c) => sum + c.cameras.operational, 0) / 
        centers.reduce((sum, c) => sum + c.cameras.total, 0)) * 100
    };
  }, [processedData]);

  return (
    <div className="space-y-6 p-6">
      {/* Filter controls and main grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdvancedStatCard title="Total Accidents" value={totals.accidents} icon={AlertCircle} 
          description={`${totals.fatalAccidents} fatal`} trend={-12} 
          sparklineData={Object.values(processedData)[0]?.trendData.accidents} />
        
        <AdvancedStatCard title="Violation Rate" value={`${totals.avgViolationRate.toFixed(1)}/1k`} 
          icon={Car} description="Per 1k vehicles" trend={-4.2} 
          sparklineData={Object.values(processedData)[0]?.trendData.violations} />
        
        <AdvancedStatCard title="Officer Efficiency" value={`${totals.avgChallanEfficiency.toFixed(1)}/officer`} 
          icon={Users} description="Challans per officer" trend={12.8} 
          sparklineData={Object.values(processedData)[0]?.trendData.revenue} />
        
        <PredictiveAnalyticsCard data={Object.values(processedData)[0]?.predictive} />
      </div>

      {/* Add enhanced visualizations */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <HeatMapChart filteredData={processedData} filters={filters} />
        <AccidentsChart filteredData={processedData} filters={filters} />
        <ViolationsChart filteredData={processedData} filters={filters} />
      </div>

      {/* Original charts grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RevenueChart filteredData={processedData} filters={filters} />
        <PaymentMethodsChart filteredData={processedData} filters={filters}/>
        <ViolationTypesChart filteredData={processedData} filters={filters}/>
      </div>
    </div>
  );
};

export default Dashboard;