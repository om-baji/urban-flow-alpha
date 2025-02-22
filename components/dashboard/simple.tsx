"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, ArcElement } from "chart.js";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, ArcElement);

const Dashboard = ({ data }: { data: any }) => {
  const totalAccidents = data.reduce((sum: number, item: any) => sum + item.accidents.overall, 0);
  const todayAccidents = data.reduce((sum: number, item: any) => sum + item.accidents.today, 0);
  const totalViolations = data.reduce((sum: number, item: any) => sum + item.violations.total, 0);
  const todayViolations = data.reduce((sum: number, item: any) => sum + item.violations.reported, 0);
  const totalChallans = data.reduce((sum: number, item: any) => sum + item.challans.total, 0);

  const accidentData = {
    labels: ["Today", "All Time"],
    datasets: [
      {
        data: [todayAccidents, totalAccidents],
        backgroundColor: ["#ef4444", "#3b82f6"],
      },
    ],
  };

  const violationData = {
    labels: ["Today", "All Time"],
    datasets: [
      {
        data: [todayViolations, totalViolations],
        backgroundColor: ["#f59e0b", "#10b981"],
      },
    ],
  };

  const challanData = {
    labels: data.map((item: any) => item.centerId),
    datasets: [
      {
        label: "Challans Issued",
        data: data.map((item: any) => item.challans.total),
        backgroundColor: "#6366f1",
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Accidents</CardTitle>
        </CardHeader>
        <CardContent>
          <Doughnut data={accidentData} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Violations</CardTitle>
        </CardHeader>
        <CardContent>
          <Doughnut data={violationData} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Challans</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar data={challanData} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
