export interface Location {
    coordinates: unknown;
    zone: string;
    district: number;
    latitude: number;
    longitude: number;
  }
  
  export interface TrafficData {
    location: Location;
    violations: {
      total: number;
      reported: number;
    };
    challans: {
      breakdown: unknown;
      total: number;
      collected_amount: number;
    };
    accidents: {
      today: number;
      overall: number;
    };
    centerId: string;
    date: string;
    weather_conditions: string;
    peak_hour: boolean;
    enforcement_officers: number;
  }