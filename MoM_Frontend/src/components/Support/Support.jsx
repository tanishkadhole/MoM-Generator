import React, { useState } from "react";
import { FaSearch, FaQuestionCircle, FaHeadset, FaComments, FaEnvelope, FaPhoneAlt } from "react-icons/fa";

export default function Support() {
    const [searchQuery, setSearchQuery] = useState("");

    // List of FAQs
    const faqs = [
        { question: "How do I reset my password?", answer: "Go to settings and click on 'Forgot Password'." },
        { question: "How can I contact support?", answer: "Use live chat, email us, or call our helpline." },
        { question: "What payment methods do you accept?", answer: "We accept credit cards, PayPal, and Razorpay." },
    ];

    return (
        <div className="min-h-screen bg-[#A4A69C] py-12">
            {/* Hero Section */}
            <div className="text-center text-white">
                <FaHeadset size={50} className="mx-auto text-[#00BFFF]" />
                <h1 className="text-4xl font-bold mt-4">How Can We Help You?</h1>
                <p className="text-lg mt-2">Find answers or get in touch with our team.</p>
            </div>

            {/* Searchable Knowledge Base */}
            <div className="max-w-4xl mx-auto mt-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search for help..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-4 pl-10 border rounded-lg shadow-md"
                    />
                    <FaSearch className="absolute left-3 top-4 text-gray-500" />
                </div>
            </div>

            {/* FAQs Section */}
            <div className="max-w-6xl mx-auto px-6 mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-[#152c39] flex items-center">
                        <FaQuestionCircle className="mr-2 text-[#00BFFF]" /> Frequently Asked Questions
                    </h2>
                    <ul className="mt-4 text-gray-700 space-y-3">
                        {faqs.map((faq, index) => (
                            <li key={index} className="border-b pb-2">
                                <strong>Q:</strong> {faq.question} <br />
                                <strong>A:</strong> {faq.answer}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact Options */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-[#152c39] flex items-center">
                        <FaHeadset className="mr-2 text-[#FF007F]" /> Need More Help?
                    </h2>
                    <p className="text-gray-600 mt-2">If you couldn't find your answer, reach out to us.</p>
                    <div className="mt-4 space-y-3">
                        <div className="flex items-center p-3 bg-[#152c39] text-white rounded-lg">
                            <FaPhoneAlt className="mr-3 text-[#FF007F]" />
                            <span>+44 123 456 7890</span>
                        </div>
                        <div className="flex items-center p-3 bg-[#152c39] text-white rounded-lg">
                            <FaEnvelope className="mr-3 text-[#00BFFF]" />
                            <span>support@example.com</span>
                        </div>
                        <div className="flex items-center p-3 bg-[#152c39] text-white rounded-lg">
                            <FaComments className="mr-3 text-[#00BFFF]" />
                            <span>Live Chat (Available 24/7)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
