import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios, { AxiosResponse } from "axios";
import { AlertCircle, Car, Clock, Cloud, IndianRupee, MapPin, Receipt, Shield, X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface TrafficStats {
  hours: string[];
  volumes: number[];
}

interface MarkerData {
  locationName: string;
  lat: number;
  lng: number;
  address: string;
  accidents: { today: number; overall: number };
  violations: { total: number; reported: number };
  challans: { 
    total: number; 
    collected_amount: number;
    breakdown: {
      Speeding: number;
      'Red Light': number;
      'No Helmet': number;
      'Drunk Driving': number;
      'Wrong Way Driving': number;
      'No License': number;
      'Invalid Insurance': number;
      'Illegal Parking': number;
      'Lane Violation': number;
      'Modified Vehicle': number;
    };
  };
  weather_conditions: string;
  enforcement_officers: number;
  peak_hour: boolean;
  trafficStats?: TrafficStats;
}

interface MapMarker {
  locationName: string;
  lat: number;
  lng: number;
  address: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  mapMarker: MapMarker | null;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, mapMarker }) => {
  const [markerData, setMarkerData] = useState<MarkerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mapMarker?.lat && mapMarker?.lng) {
      setLoading(true);
      setError(null);

      axios
        .post("/api/centre", { lat: mapMarker.lat, lng: mapMarker.lng })
        .then((response: AxiosResponse) => {
          setMarkerData({
            locationName: response.data.location.zone,
            lat: response.data.location.coordinates.latitude,
            lng: response.data.location.coordinates.longitude,
            address: `District ${response.data.location.district}`,
            accidents: response.data.accidents,
            violations: response.data.violations,
            challans: response.data.challans,
            weather_conditions: response.data.weather_conditions,
            enforcement_officers: response.data.enforcement_officers,
            peak_hour: response.data.peak_hour,
            trafficStats: response.data.trafficStats,
          });
        })
        .catch(() => setError("Failed to fetch data"))
        .finally(() => setLoading(false));
    }
  }, [mapMarker?.lat, mapMarker?.lng]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // console.log("test formatter ", formatCurrency(markerData))

  console.log("MArker data" ,markerData)
  return (
    <div
      className={`fixed right-0 top-0 h-full bg-zinc-800 shadow-xl transition-transform duration-300 transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } w-96 z-50`}
    >
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-bold">{markerData?.locationName || "Loading..."}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <p className="text-gray-500 text-center">Loading data...</p>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : markerData ? (
            <>
              {/* Status Overview */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                    <p className="text-sm text-gray-600">Accidents Today</p>
                    <p className="text-2xl font-bold">{markerData.accidents.today}</p>
                    <p className="text-xs text-gray-500">Total: {markerData.accidents.overall}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center">
                    <Car className="h-8 w-8 text-orange-500 mb-2" />
                    <p className="text-sm text-gray-600">Violations</p>
                    <p className="text-2xl font-bold">{markerData.violations.total}</p>
                    <p className="text-xs text-gray-500">Reported: {markerData.violations.reported}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Current Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Conditions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Weather</p>
                      <p className="font-semibold">{markerData.weather_conditions}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600">Officers</p>
                      <p className="font-semibold">{markerData.enforcement_officers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Challan Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Challan Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-purple-500" />
                      <p className="text-sm text-gray-600">Total Challans</p>
                    </div>
                    <p className="font-bold">{markerData.challans.total}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-5 w-5 text-green-500" />
                      <p className="text-sm text-gray-600">Amount Collected</p>
                    </div>
                    <p className="font-bold">{formatCurrency(markerData.challans.collected_amount || 5716)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Violation Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Violation Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(markerData.challans.breakdown).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">{type}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{count}</span>
                          <div 
                            className="w-16 bg-gray-200 h-2 rounded-full overflow-hidden"
                          >
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ 
                                width: `${(count / Math.max(...Object.values(markerData.challans.breakdown))) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Peak Hour Status */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm text-gray-600">Peak Hour Status</p>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${markerData.peak_hour ? 'bg-red-500' : 'bg-green-500'}`} />
                        <p className="font-semibold">{markerData.peak_hour ? 'Peak Hours' : 'Normal Traffic'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <p className="text-gray-500 text-center">Select a marker to view details</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;