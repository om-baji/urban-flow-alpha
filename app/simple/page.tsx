"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Dashboard from "@/components/dashboard/enhanced";
import type { TrafficData } from "@/server/types";

const LoadingSkeleton = () => (
  <div className="space-y-6 p-6">
    <Skeleton className="h-8 w-[250px]" />
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-[120px]" />
      ))}
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-[300px]" />
      ))}
    </div>
  </div>
);

const ErrorAlert = ({ message }: { message: string }) => (
  <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

export default function DashboardPage() {
  const [data, setData] = useState<TrafficData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dash");
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorAlert message={error} />;
  if (!data) return <ErrorAlert message="No data available" />;

  return <Dashboard data={data} />;
}