import type { Metadata } from "next";
import Response from "@/components/map";

export const metadata: Metadata = {
  title: "Traffic Management System",
  description: "Real-time traffic monitoring and management dashboard with interactive map visualization",
  keywords: "traffic management, monitoring, map visualization, real-time tracking",
};

export default function MapPage() {
  return (
    <main className="min-h-screen relative">
      <Response />
    </main>
  );
}