"use client";
import { useState, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { gql, useMutation } from "@apollo/client";

const ADD_ADMIN_MUTATION = gql`
  mutation AddAdmin($centerID: ID!, $password: String!, $lat: Float!, $lng: Float!, $centerName: String!) {
    addAdmin(centerID: $centerID, password: $password, lat: $lat, lng: $lng, centerName: $centerName) {
      centerID
    }
  }
`;

export default function AddAdminForm() {
  const [formData, setFormData] = useState({
    centerID: "",
    password: "",
    lat: "", 
    lng: "", 
    centerName: ""
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const [addAdmin, { data, loading, error }] = useMutation(ADD_ADMIN_MUTATION);
  console.log(data)
  if (loading) return 'Submitting...';
  if (error) return `Submission error! ${error.message}`;

  const handleSubmit = async (e : React.FormEvent) => {
    e.preventDefault();
    addAdmin({ 
      variables: { 
        centerID: formData.centerID,
        password: formData.password,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        centerName : formData.centerName
      } 
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg p-8 shadow-xl rounded-lg text-[#e0e0e0] bg-zinc-800 mx-auto"
      >
        <h2 className="text-2xl font-semibold mb-6 text-lime-400">Add Admin</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* centerID Field */}
          <div>
            <label
              htmlFor="centerID"
              className="block text-sm font-medium mb-1 text-[#aaff00]"
            >
              Center ID
            </label>
            <input
              type="text"
              id="centerID"
              name="centerID"
              value={formData.centerID}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-[#333333] text-white placeholder-gray-400 focus:ring-2 focus:ring-lime-400 focus:outline-none transition-all duration-200"
              placeholder="New Center ID"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1 text-[#aaff00]"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-[#333333] text-white placeholder-gray-400 focus:ring-2 focus:ring-lime-400 focus:outline-none transition-all duration-200"
              placeholder="New Password"
              required
            />
          </div>

          {/* Latitude Field */}
          <div>
            <label
              htmlFor="lat"
              className="block text-sm font-medium mb-1 text-[#aaff00]"
            >
              Latitude
            </label>
            <input
              type="number"
              id="lat"
              name="lat"
              value={formData.lat}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-[#333333] text-white placeholder-gray-400 focus:ring-2 focus:ring-lime-400 focus:outline-none transition-all duration-200"
              placeholder="Latitude"
              required
            />
          </div>

          {/* Longitude Field */}
          <div>
            <label
              htmlFor="lng"
              className="block text-sm font-medium mb-1 text-[#aaff00]"
            >
              Longitude
            </label>
            <input
              type="number"
              id="lng"
              name="lng"
              value={formData.lng}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-[#333333] text-white placeholder-gray-400 focus:ring-2 focus:ring-lime-400 focus:outline-none transition-all duration-200"
              placeholder="Longitude"
              required
            />
          </div>

          {/* Center Name Field */}
          <div>
            <label
              htmlFor="centerName"
              className="block text-sm font-medium mb-1 text-[#aaff00]"
            >
              Center Name
            </label>
            <input
              type="text"
              id="centerName"
              name="centerName"
              value={formData.centerName}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-[#333333] text-white placeholder-gray-400 focus:ring-2 focus:ring-lime-400 focus:outline-none transition-all duration-200"
              placeholder="Center Name"
              required
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-lime-400 to-yellow-500 text-black font-semibold rounded-lg hover:scale-105 transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              Add Admin
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
