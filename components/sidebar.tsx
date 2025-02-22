import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, MapPin, Car, Receipt, X } from 'lucide-react';
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
import { Bar } from 'react-chartjs-2';

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

interface MarkerData {
  locationName: string;
  lat: number;
  lng: number;
  address: string;
  accidents?: {
    today: number;
    overall: number;
  };
  violations?: {
    total: number;
    reported: number;
  };
  challans?: {
    total: number;
    collected_amount: number;
  };
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  markerData: MarkerData | null;
}

type TabType = 'overview' | 'violations' | 'statistics';

const chartData = {
  labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
  datasets: [{
    label: 'Traffic Volume',
    data: [65, 90, 75, 85, 95, 60],
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
    borderColor: 'rgb(59, 130, 246)',
    borderWidth: 1
  }]
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: 'category' as const, 
      grid: {
        display: false
      }
    },
    y: {
      type: 'linear' as const,
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      enabled: true
    }
  }
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, markerData }) => {
  const [selectedTab, setSelectedTab] = useState<TabType>('overview');

  const sidebarContent = markerData ? (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-bold">{markerData.locationName}</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b">
        {(['overview', 'violations', 'statistics'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`flex-1 p-4 text-sm font-medium transition-colors
              ${selectedTab === tab 
                ? 'border-b-2 border-blue-500 text-blue-500' 
                : 'text-gray-600 hover:text-blue-500'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col items-center">
              <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
              <p className="text-sm text-gray-600">Accidents Today</p>
              <p className="text-2xl font-bold">{markerData.accidents?.today || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center">
              <Car className="h-8 w-8 text-orange-500 mb-2" />
              <p className="text-sm text-gray-600">Violations</p>
              <p className="text-2xl font-bold">{markerData.violations?.total || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Card>
          <CardHeader>
            <CardTitle>Hourly Traffic Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Status Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-2 hover:bg-gray-50 rounded">
                <Receipt className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <p className="font-medium">Traffic Update {i + 1}</p>
                  <p className="text-sm text-gray-600">Status update for the location...</p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-500">Select a marker to view details</p>
    </div>
  );

  return (
    <div 
      className={`fixed right-0 top-0 h-full bg-zinc-800 shadow-xl transition-transform duration-300 transform
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        w-96 z-50`}
    >
      {sidebarContent}
    </div>
  );
};

export default Sidebar;