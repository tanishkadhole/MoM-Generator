import React from "react";

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[#A4A69C] py-12">
            {/* Hero Section */}
            <div className="text-center px-6">
                <h1 className="text-4xl sm:text-5xl font-bold text-[#152c39]">Terms of Service</h1>
                <p className="text-lg sm:text-xl text-gray-700 mt-3 max-w-3xl mx-auto text-justify">
                    Please read these Terms of Service carefully before using MeetCapture. By accessing or using our 
                    platform, you agree to be bound by these terms.
                </p>
            </div>

            {/* Terms Content */}
            <div className="max-w-5xl mx-auto px-6 mt-10 bg-white p-8 rounded-lg shadow-lg">
                {/* Section 1: Introduction */}
                <h2 className="text-2xl font-semibold text-[#152c39]">1. Acceptance of Terms</h2>
                <p className="text-gray-600 mt-2 text-justify">
                    By accessing or using MeetCapture, you acknowledge that you have read, understood, and agree to 
                    comply with these Terms of Service. If you do not agree with any part of these terms, you may not 
                    use our platform.
                </p>

                {/* Section 2: Use of Service */}
                <h2 className="text-2xl font-semibold text-[#152c39] mt-6">2. Use of Our Services</h2>
                <p className="text-gray-600 mt-2 text-justify">
                    Our platform is intended for lawful use only. You agree not to misuse our services, including but 
                    not limited to unauthorized access, hacking, or distributing malicious content.
                </p>

                {/* Section 3: User Accounts */}
                <h2 className="text-2xl font-semibold text-[#152c39] mt-6">3. User Accounts</h2>
                <p className="text-gray-600 mt-2 text-justify">
                    You may need to create an account to access certain features of MeetCapture. You are responsible for 
                    maintaining the confidentiality of your account information and for all activities under your account.
                </p>

                {/* Section 4: Privacy Policy */}
                <h2 className="text-2xl font-semibold text-[#152c39] mt-6">4. Privacy Policy</h2>
                <p className="text-gray-600 mt-2 text-justify">
                    Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your 
                    personal data. By using MeetCapture, you agree to the terms outlined in our Privacy Policy.
                </p>

                {/* Section 5: Intellectual Property */}
                <h2 className="text-2xl font-semibold text-[#152c39] mt-6">5. Intellectual Property</h2>
                <p className="text-gray-600 mt-2 text-justify">
                    All content, logos, and trademarks on MeetCapture are the property of their respective owners. You 
                    may not use, reproduce, or distribute our content without prior written permission.
                </p>

                {/* Section 6: Termination */}
                <h2 className="text-2xl font-semibold text-[#152c39] mt-6">6. Termination</h2>
                <p className="text-gray-600 mt-2 text-justify">
                    We reserve the right to suspend or terminate your access to MeetCapture if you violate these Terms 
                    of Service or engage in harmful activities.
                </p>

                {/* Section 7: Limitation of Liability */}
                <h2 className="text-2xl font-semibold text-[#152c39] mt-6">7. Limitation of Liability</h2>
                <p className="text-gray-600 mt-2 text-justify">
                    We are not liable for any damages or losses resulting from the use of our platform. Our services are 
                    provided "as is" without any warranties.
                </p>

                {/* Section 8: Changes to Terms */}
                <h2 className="text-2xl font-semibold text-[#152c39] mt-6">8. Changes to Terms</h2>
                <p className="text-gray-600 mt-2 text-justify">
                    We may update these Terms of Service at any time. Continued use of MeetCapture after changes 
                    implies acceptance of the new terms.
                </p>

                {/* Section 9: Contact Information */}
                <h2 className="text-2xl font-semibold text-[#152c39] mt-6">9. Contact Us</h2>
                <p className="text-gray-600 mt-2 text-justify">
                    If you have any questions regarding these Terms of Service, please contact us at{" "}
                    <a href="mailto:support@meetcapture.com" className="text-blue-600 hover:underline">
                        support@meetcapture.com
                    </a>
                    .
                </p>
            </div>
        </div>
    );
}