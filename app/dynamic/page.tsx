"use client"
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const initialTraffic = [
  { way: "NORTH", count: Math.floor(Math.random() * 20) },
  { way: "SOUTH", count: Math.floor(Math.random() * 20) },
  { way: "EAST", count: Math.floor(Math.random() * 20) },
  { way: "WEST", count: Math.floor(Math.random() * 20) },
];

export default function TrafficSimulation() {
  const [trafficData, setTrafficData] = useState(initialTraffic);
  const [activeWay, setActiveWay] = useState("NORTH");
  const [yellowWay, setYellowWay] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTraffic = trafficData.map((t) => ({
        ...t,
        count: Math.floor(Math.random() * 20),
      }));
      setTrafficData(newTraffic);

      const maxWay = newTraffic.reduce((prev, curr) =>
        curr.count > prev.count ? curr : prev
      ).way;
      setYellowWay(activeWay);
      setTimeout(() => setActiveWay(maxWay), 2000);
    }, 6000);

    return () => clearInterval(interval);
  }, [trafficData, activeWay]);

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-semibold">🚦 Traffic Light Simulation 🚗</h1>
      <div className="relative w-96 h-96 border-4 border-gray-700 grid grid-cols-3 grid-rows-3 bg-gray-800 rounded-lg shadow-lg">
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
              className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-white text-lg shadow-md transition-all duration-500 ${
                activeWay === way
                  ? "bg-green-500"
                  : yellowWay === way
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            >
              {way[0]}
            </div>
            <span className="text-md mt-2 bg-gray-700 px-2 py-1 rounded-md shadow-md">{count} Cars</span>
          </div>
        ))}
        <motion.div
          className="absolute bg-blue-500 w-8 h-8 rounded-full shadow-lg"
          animate={{
            x: activeWay === "EAST" ? 80 : activeWay === "WEST" ? -80 : 0,
            y: activeWay === "SOUTH" ? 80 : activeWay === "NORTH" ? -80 : 0,
          }}
          transition={{ duration: 1 }}
          style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
        />
      </div>
      <BarChart width={400} height={250} data={trafficData} className="mt-4 bg-gray-800 p-4 rounded-lg shadow-md">
        <XAxis dataKey="way" stroke="#fff" />
        <YAxis stroke="#fff" />
        <Tooltip wrapperStyle={{ backgroundColor: "#333", color: "#fff" }} />
        <Bar dataKey="count" fill="#4CAF50" barSize={40} radius={[5, 5, 0, 0]} />
      </BarChart>
      <p className="text-xl mt-4">Current Green Light: <b className="text-green-400">{activeWay}</b></p>
    </div>
  );
}
