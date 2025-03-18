import React, { useState } from "react";

export default function Contact() {
    // State for form fields
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        tel: "",
        message: "",
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");

    // Handle input change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitted(false);

        const formspreeEndpoint = "https://formspree.io/f/mrbpzbwq"; // Replace with your Formspree endpoint

        try {
            const response = await fetch(formspreeEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setIsSubmitted(true);
                setFormData({ name: "", email: "", tel: "", message: "" }); // Reset form
            } else {
                throw new Error("Failed to send message. Try again later.");
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="relative flex items-top justify-center min-h-[600px] bg-[#A4A69C] sm:items-center sm:pt-0">
            <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
                <div className="mt-8 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Contact Details */}
                        <div className="p-6 mr-2 bg-white sm:rounded-lg shadow-lg">
                            <h1 className="text-3xl sm:text-4xl text-[#152c39] font-extrabold tracking-tight">
                                Get in Touch
                            </h1>
                            <p className="text-lg sm:text-xl font-medium text-[#152c39] mt-2">
                                Fill in the form to start a conversation.
                            </p>
                            <div className="flex items-center mt-8 text-[#152c39]">
                                📍 <span className="ml-4 font-semibold">Dr.D.Y Patil Institute of Technology</span>
                            </div>
                            <div className="flex items-center mt-4 text-[#152c39]">
                                📞 <span className="ml-4 font-semibold">+91 8459708577</span>
                            </div>
                            <div className="flex items-center mt-4 text-[#152c39]">
                                📞 <span className="ml-4 font-semibold">+91 8605702805</span>
                            </div>
                            
                            <div className="flex items-center mt-2 text-[#152c39]">
                                📧 <span className="ml-4 font-semibold">sanskardagade07@gmail.com</span>
                            </div>
                            <div className="flex items-center mt-2 text-[#152c39]">
                                📧 <span className="ml-4 font-semibold">tanishkadhole2992@gmail.com</span>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <form onSubmit={handleSubmit} className="p-6 flex flex-col justify-center bg-white shadow-lg rounded-lg">
                            {isSubmitted && (
                                <p className="text-green-600 text-lg font-bold">✅ Message sent successfully!</p>
                            )}
                            {error && <p className="text-red-600 text-lg font-bold">❌ {error}</p>}

                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full mt-2 py-3 px-4 rounded-lg border border-gray-300 text-[#152c39] font-semibold focus:border-[#152c39] focus:outline-none"
                                required
                            />

                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full mt-2 py-3 px-4 rounded-lg border border-gray-300 text-[#152c39] font-semibold focus:border-[#152c39] focus:outline-none"
                                required
                            />

                            <input
                                type="tel"
                                name="tel"
                                placeholder="Telephone Number"
                                value={formData.tel}
                                onChange={handleChange}
                                className="w-full mt-2 py-3 px-4 rounded-lg border border-gray-300 text-[#152c39] font-semibold focus:border-[#152c39] focus:outline-none"
                            />

                            <textarea
                                name="message"
                                placeholder="Your Message"
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full mt-2 py-3 px-4 rounded-lg border border-gray-300 text-[#152c39] font-semibold focus:border-[#152c39] focus:outline-none"
                                rows="4"
                                required
                            ></textarea>

                            <button
                                type="submit"
                                className="mt-4 bg-[#152c39] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#0f212e] transition ease-in-out duration-300"
                            >
                                Submit
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}