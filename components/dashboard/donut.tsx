"use client"

import * as React from "react"
import { Pie } from "react-chartjs-2"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend)

export function Component({ accidents_number }: { accidents_number: string }) {
  const data = {
    labels: ["Accidents"],
    datasets: [
      {
        data: [parseInt(accidents_number)],
        backgroundColor: ["#3B82F6"],
        hoverBackgroundColor: ["#1E40AF"],
      },
    ],
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Accidents - (All time)</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <Pie data={data} />
      </CardContent>
      <CardFooter className="text-muted-foreground text-sm">
        Showing total accidents for the last 6 months
      </CardFooter>
    </Card>
  )
}
