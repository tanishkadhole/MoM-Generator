import React from "react";
import { FaRocket, FaLock, FaCode, FaMobile, FaChartLine, FaUsers } from "react-icons/fa";

export default function Features() {
    // List of features
    const features = [
        {
            icon: <FaRocket size={40} />,
            title: "Lightning Fast",
            description: "Experience top-notch performance and blazing-fast speed across all devices.",
        },
        {
            icon: <FaLock size={40} />,
            title: "Secure & Reliable",
            description: "Advanced encryption ensures your data stays protected at all times.",
        },
        {
            icon: <FaCode size={40} />,
            title: "Developer Friendly",
            description: "Clean, scalable, and optimized code structure for smooth development.",
        },
        {
            icon: <FaMobile size={40} />,
            title: "Fully Responsive",
            description: "Seamless user experience across desktops, tablets, and mobile devices.",
        },
        {
            icon: <FaChartLine size={40} />,
            title: "Optimized for Growth",
            description: "Built for scalability, ensuring smooth performance as you grow.",
        },
        {
            icon: <FaUsers size={40} />,
            title: "User-Centric Design",
            description: "Designed with users in mind for maximum engagement and satisfaction.",
        },
    ];

    return (
        <div className="min-h-screen bg-[#A4A69C] py-12">
            {/* Hero Section */}
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl font-bold text-[#152c39]">Our Cutting-Edge Features</h1>
                <p className="text-lg sm:text-xl text-gray-700 mt-3">Discover what makes our platform the best.</p>
            </div>

            {/* Features Grid */}
            <div className="max-w-6xl mx-auto px-6 mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transform transition duration-300 hover:-translate-y-2 text-center flex flex-col items-center"
                    >
                        <div className="text-[#00BFFF]">{feature.icon}</div>
                        <h2 className="text-2xl font-semibold text-[#152c39] mt-4">{feature.title}</h2>
                        <p className="text-gray-600 mt-2">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
