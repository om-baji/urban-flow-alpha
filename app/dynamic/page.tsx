"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, AlertCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';

// Chart.js registration
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';

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

interface TrafficData {
  way: string;
  count: number;
}

interface JunctionData {
  id: string;
  zone: string;
  congestion: number;
  accidents: number;
  violations: number;
}

interface FilterState {
  zone: string;
  junctionId: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  trend?: number;
}

const chartOptions: ChartOptions<'bar' | 'line'> = {
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

const initialJunctions: JunctionData[] = [
  { id: 'J001', zone: 'North', congestion: 12, accidents: 3, violations: 8 },
  { id: 'J002', zone: 'South', congestion: 18, accidents: 1, violations: 15 },
  { id: 'J003', zone: 'East', congestion: 7, accidents: 0, violations: 5 },
  { id: 'J004', zone: 'West', congestion: 15, accidents: 2, violations: 10 }
];

const initialTraffic: TrafficData[] = [
  { way: "NORTH", count: Math.floor(Math.random() * 20) },
  { way: "SOUTH", count: Math.floor(Math.random() * 20) },
  { way: "EAST", count: Math.floor(Math.random() * 20) },
  { way: "WEST", count: Math.floor(Math.random() * 20) },
];

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, description, trend }) => (
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
);

const TrafficControlDashboard: React.FC = () => {
  const [trafficData, setTrafficData] = useState<TrafficData[]>(initialTraffic);
  const [activeWay, setActiveWay] = useState<string>("NORTH");
  const [yellowWay, setYellowWay] = useState<string | null>(null);
  const [junctionData, setJunctionData] = useState<JunctionData[]>(initialJunctions);
  const [filters, setFilters] = useState<FilterState>({
    zone: 'all',
    junctionId: 'all'
  });
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [selectedJunction, setSelectedJunction] = useState<JunctionData | null>(null);

  // Update traffic data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Update traffic counts
      const newTraffic = trafficData.map((t) => ({
        ...t,
        count: Math.floor(Math.random() * 20),
      }));
      setTrafficData(newTraffic);

      // Set traffic light based on the highest traffic count
      const maxWay = newTraffic.reduce((prev, curr) =>
        curr.count > prev.count ? curr : prev
      ).way;
      
      setYellowWay(activeWay);
      setTimeout(() => setActiveWay(maxWay), 2000);
      
      // Update junction data with random fluctuations
      setJunctionData(prev => 
        prev.map(junction => ({
          ...junction,
          congestion: Math.max(0, junction.congestion + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3)),
          violations: Math.max(0, junction.violations + (Math.random() > 0.7 ? 1 : 0))
        }))
      );
      
      setTimeElapsed(prev => prev + 1);
    }, 6000);

    return () => clearInterval(interval);
  }, [trafficData, activeWay]);

  // Filter for zones
  const zones = useMemo<string[]>(() => 
    [...new Set(junctionData.map(item => item.zone))],
    [junctionData]
  );

  // Filter for junctions
  const junctionIds = useMemo<string[]>(() => {
    if (filters.zone === 'all') {
      return junctionData.map(j => j.id);
    }
    return junctionData
      .filter(j => j.zone === filters.zone)
      .map(j => j.id);
  }, [junctionData, filters.zone]);

  // Filtered junction data based on selected filters
  const filteredJunctionData = useMemo<JunctionData[]>(() => {
    let filtered = [...junctionData];

    if (filters.zone !== 'all') {
      filtered = filtered.filter(j => j.zone === filters.zone);
    }

    if (filters.junctionId !== 'all') {
      filtered = filtered.filter(j => j.id === filters.junctionId);
      if (filtered.length > 0) {
        setSelectedJunction(filtered[0]);
      }
    } else {
      setSelectedJunction(null);
    }

    return filtered;
  }, [junctionData, filters]);

  // Total statistics
  const totals = useMemo(() => {
    return {
      congestion: filteredJunctionData.reduce((sum, j) => sum + j.congestion, 0),
      accidents: filteredJunctionData.reduce((sum, j) => sum + j.accidents, 0),
      violations: filteredJunctionData.reduce((sum, j) => sum + j.violations, 0),
      revenue: filteredJunctionData.reduce((sum, j) => sum + j.violations * 1000, 0), // Assuming ₹1000 per violation
    };
  }, [filteredJunctionData]);

  // Handle filter changes
  const handleZoneChange = (value: string) => {
    setFilters(prev => ({ ...prev, zone: value, junctionId: 'all' }));
  };

  const handleJunctionChange = (value: string) => {
    setFilters(prev => ({ ...prev, junctionId: value }));
  };

  return (
    <div className="space-y-6 p-6 bg-gray-900 text-white">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Traffic Control Dashboard</h2>
        <div className="flex gap-3">
          <Select value={filters.zone} onValueChange={handleZoneChange}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
              <SelectValue placeholder="Select zone" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Zones</SelectItem>
              {zones.map(zone => (
                <SelectItem key={zone} value={zone}>{zone} Zone</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.junctionId} onValueChange={handleJunctionChange}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
              <SelectValue placeholder="Select junction" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Junctions</SelectItem>
              {junctionIds.map(id => (
                <SelectItem key={id} value={id}>{id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Traffic Congestion"
          value={totals.congestion}
          icon={Activity}
          description={`${filters.zone === 'all' ? 'All zones' : `${filters.zone} zone`}`}
          trend={-5}
        />
        <StatCard
          title="Total Accidents"
          value={totals.accidents}
          icon={AlertCircle}
          description="Last 30 days"
          trend={-12}
        />
        <StatCard
          title="Traffic Violations"
          value={totals.violations}
          icon={AlertTriangle}
          description="Recorded violations"
          trend={8}
        />
        <StatCard
          title="Revenue Generated"
          value={`₹${totals.revenue.toLocaleString()}`}
          icon={TrendingUp}
          description="From penalties"
          trend={15}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Traffic simulation panel */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              Traffic Signal Control {selectedJunction ? `- Junction ${selectedJunction.id}` : ''}
            </CardTitle>
            <CardDescription className="text-gray-400">
              Dynamic traffic light control based on vehicle count
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="relative w-64 h-64 border-4 border-gray-700 rounded-lg bg-gray-900 flex items-center justify-center">
                {trafficData.map(({ way, count }) => (
                  <div
                    key={way}
                    className="absolute flex flex-col items-center justify-center text-center"
                    style={{
                      top: way === "NORTH" ? "5%" : way === "SOUTH" ? "85%" : "50%",
                      left: way === "WEST" ? "5%" : way === "EAST" ? "85%" : "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-white text-lg shadow-md transition-all duration-500 ${
                        activeWay === way
                          ? "bg-green-500"
                          : yellowWay === way
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    >
                      {way[0]}
                    </div>
                    <span className="text-xs mt-2 bg-gray-700 px-2 py-1 rounded-md shadow-md">{count}</span>
                  </div>
                ))}
                <div 
                  className="absolute bg-blue-500 w-6 h-6 rounded-full shadow-lg"
                  style={{ 
                    left: "50%", 
                    top: "50%", 
                    transform: `translate(${
                      activeWay === "EAST" ? "30px" : activeWay === "WEST" ? "-30px" : "0"
                    }, ${
                      activeWay === "SOUTH" ? "30px" : activeWay === "NORTH" ? "-30px" : "0"
                    })`,
                    transition: "all 1s ease-in-out",
                  }}
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-36">
                <Bar
                  data={{
                    labels: trafficData.map(t => t.way),
                    datasets: [{
                      label: 'Vehicle Count',
                      data: trafficData.map(t => t.count),
                      backgroundColor: trafficData.map(t => 
                        t.way === activeWay 
                          ? 'rgba(16, 185, 129, 0.6)' 
                          : t.way === yellowWay 
                            ? 'rgba(251, 191, 36, 0.6)'
                            : 'rgba(239, 68, 68, 0.6)'
                      ),
                      borderWidth: 1
                    }]
                  }}
                  options={chartOptions}
                />
              </div>
              <p className="text-center mt-2 text-green-400">
                Current Green Signal: <strong>{activeWay}</strong> | Time Elapsed: {timeElapsed * 6}s
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Traffic congestion chart */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Junction Congestion Analysis</CardTitle>
            <CardDescription className="text-gray-400">
              {filters.zone === 'all' ? 'All zones' : `${filters.zone} zone`}
              {filters.junctionId !== 'all' && ` - Junction ${filters.junctionId}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line
                data={{
                  labels: filteredJunctionData.map(j => j.id),
                  datasets: [{
                    label: 'Congestion Level',
                    data: filteredJunctionData.map(j => j.congestion),
                    backgroundColor: 'rgba(239, 68, 68, 0.5)',
                    borderColor: 'rgb(239, 68, 68)',
                    tension: 0.3
                  }]
                }}
                options={chartOptions}
              />
            </div>
          </CardContent>
        </Card>

        {/* Violations chart */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Traffic Violations by Junction</CardTitle>
            <CardDescription className="text-gray-400">
              {filters.zone === 'all' ? 'All zones' : `${filters.zone} zone`}
              {filters.junctionId !== 'all' && ` - Junction ${filters.junctionId}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar
                data={{
                  labels: filteredJunctionData.map(j => j.id),
                  datasets: [{
                    label: 'Violations',
                    data: filteredJunctionData.map(j => j.violations),
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgb(59, 130, 246)',
                  }]
                }}
                options={chartOptions}
              />
            </div>
          </CardContent>
        </Card>

        {/* Revenue chart */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Revenue by Junction</CardTitle>
            <CardDescription className="text-gray-400">
              {filters.zone === 'all' ? 'All zones' : `${filters.zone} zone`}
              {filters.junctionId !== 'all' && ` - Junction ${filters.junctionId}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line
                data={{
                  labels: filteredJunctionData.map(j => j.id),
                  datasets: [{
                    label: 'Revenue (₹)',
                    data: filteredJunctionData.map(j => j.violations * 1000),
                    backgroundColor: 'rgba(16, 185, 129, 0.5)',
                    borderColor: 'rgb(16, 185, 129)',
                    tension: 0.3
                  }]
                }}
                options={chartOptions}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrafficControlDashboard;