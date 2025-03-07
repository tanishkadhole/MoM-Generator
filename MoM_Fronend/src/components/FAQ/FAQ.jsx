import React, { useState } from "react";
import { FaSearch, FaChevronDown, FaChevronUp, FaQuestionCircle } from "react-icons/fa";

export default function FAQ() {
    const [searchQuery, setSearchQuery] = useState("");
    const [openIndex, setOpenIndex] = useState(null);

    // FAQ Data (Expanded with More Questions)
    const faqs = [
        { question: "How do I know my work is done?", answer: "As soon as you click on generate it will start downloading the pdf file." }, 
        { question: "What payment methods do you accept?", answer: "We accept Credit Cards, PayPal, UPI, and Razorpay." },
        { question: "How can I contact support?", answer: "Use Live Chat, Email us, or Call our helpline for assistance." },
        { question: "Is my data secure?", answer: "Yes, we use end-to-end encryption to protect your data and privacy." },
        { question: "Do you offer refunds?", answer: "Yes, we offer a 7-day money-back guarantee on all plans." },
        { question: "Is there a free trial available?", answer: "Yes, we offer a 14-day free trial with full features." },
        { question: "Can I use your platform on mobile?", answer: "Absolutely! Our platform is fully responsive and mobile-friendly." },
        { question: "How do I get started?", answer: "Sign up for an account and follow our quick-start guide to begin." },
        { question: "Do you provide customer support 24/7?", answer: "Yes, our support team is available 24/7 to assist you." },
    ];

    // Toggle FAQ answer visibility
    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // Filter FAQs based on search query
    const filteredFAQs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#A4A69C] py-12 px-4">
            {/* Hero Section */}
            <div className="text-center text-white">
                <FaQuestionCircle size={50} className="mx-auto text-[#00BFFF]" />
                <h1 className="text-4xl font-bold mt-4">Frequently Asked Questions</h1>
                <p className="text-lg mt-2">Find answers to your common questions</p>
            </div>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto mt-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search for answers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-4 pl-10 border rounded-lg shadow-md"
                    />
                    <FaSearch className="absolute left-3 top-4 text-gray-500" />
                </div>
            </div>

            {/* FAQs List */}
            <div className="max-w-5xl mx-auto px-6 mt-10 space-y-4">
                {filteredFAQs.length > 0 ? (
                    filteredFAQs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white p-6 rounded-lg shadow-md cursor-pointer"
                            onClick={() => toggleFAQ(index)}
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-[#152c39] text-justify">{faq.question}</h2>
                                {openIndex === index ? (
                                    <FaChevronUp className="text-[#00BFFF]" />
                                ) : (
                                    <FaChevronDown className="text-[#FF007F]" />
                                )}
                            </div>
                            {openIndex === index && <p className="text-gray-600 mt-2 text-justify">{faq.answer}</p>}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-600 text-center mt-4">No results found.</p>
                )}
            </div>
        </div>
    );
}