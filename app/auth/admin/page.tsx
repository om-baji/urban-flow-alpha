"use client";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { motion } from "framer-motion";
import { useState } from "react";

type Center = {
    centerID: string,
    centerName: string,
    lat: string,
    lng: string,
    password: string,
}

const GET_ADMIN = gql`
  query authenticateAdmin($centerID: String!, $password: String!) {
    admin(centerID: $centerID, password: $password) {
      centerID
      centerName
      lat
      lng
      password
    }
  }
`;

const GET_CENTERS = gql`
  query getCenters {
    admins {
      centerID
      centerName
      lat
      lng
    }
  }
`;

export default function FormComponent() {
    const [formData, setFormData] = useState({
        centerID: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const [authenticateAdmin, { loading, error, data }] = useLazyQuery(GET_ADMIN);
    const { loading: centersLoading, error: centersError, data: centersData } = useQuery(GET_CENTERS);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        authenticateAdmin({
            variables: {
                centerID: formData.centerID,
                password: formData.password,
            },
        });
    };

    if (loading) return 'Loading...';
    if (error) return `Error! ${error.message}`;
    if (data) console.log(data);

    if (centersLoading) return 'Loading centers...';
    if (centersError) return `Error loading centers! ${centersError.message}`;
    if (centersData) console.log(centersData);

    return (
        <div className="flex items-center justify-center min-h-screen bg-zinc-900 px-4">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg p-8 shadow-xl rounded-lg text-[#e0e0e0] bg-zinc-800 mx-auto"
            >
                <h2 className="text-2xl font-semibold mb-6 text-lime-400">Admin Login</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* centerID Field */}
                    <div>
                        <label
                            htmlFor="centerID"
                            className="block text-sm font-medium mb-1 text-[#aaff00]"
                        >
                            Center ID
                        </label>
                        <select
                            id="centerID"
                            name="centerID"
                            value={formData.centerID}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg bg-[#333333] text-white placeholder-gray-400 focus:ring-2 focus:ring-lime-400 focus:outline-none transition-all duration-200"
                            required
                        >
                            <option value="" disabled>Select Center ID</option>
                            {centersData.admins && centersData.admins.map((center : Center) => (
                                <option key={center.centerID} value={center.centerID}>
                                    {center.centerID}
                                </option>
                            ))}
                        </select>
                    </div>

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
                            placeholder="Your Password"
                            required
                        />
                    </div>
                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            className="w-full py-2 bg-gradient-to-r from-lime-400 to-yellow-500 text-black font-semibold rounded-lg hover:scale-105 transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </motion.div>
            {/* <AddAdminForm /> */}
        </div>
    );
}