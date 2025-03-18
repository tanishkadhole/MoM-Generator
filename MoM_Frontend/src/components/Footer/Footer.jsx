export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-16">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-start px-6">

                {/* Left Section - Logo & Tagline */}
                <div className="w-full md:w-1/3 mb-8 md:mb-0">
                    <h2 className="text-2xl font-bold">MeetCapture</h2>
                    <p className="text-sm text-gray-400 mt-1">Smooth Meetings and Notes</p>
                    <p className="text-sm text-gray-500 mt-2">Transform your meetings with AI-powered insights.</p>
                </div>

                {/* Middle Section - Resources & Legal */}
                <div className="w-full md:w-1/3 flex justify-between">
                    
                    {/* Resources */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Resources</h3>
                        <ul className="space-y-1 text-gray-300">
                            <li><a href="/blog" className="hover:text-white transition">Blog</a></li>
                            <li><a href="/userguidelines" className="hover:text-white transition">User Guides</a></li>
                            <li><a href="/api" className="hover:text-white transition">API Documentation</a></li>
                            <li><a href="/help" className="hover:text-white transition">Help Center</a></li>
                        </ul>
                    </div>

                    {/* Legal & Support */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Legal & Support</h3>
                        <ul className="space-y-1 text-gray-300">
                            <li><a href="/terms" className="hover:text-white transition">Terms of Service</a></li>
                            <li><a href="/privacy" className="hover:text-white transition">Privacy Policy</a></li>
                            <li><a href="/support" className="hover:text-white transition">Contact Support</a></li>
                        </ul>
                    </div>
                </div>

                {/* Right Section - Social Media & Copyright */}
                <div className="w-full md:w-1/3 text-center md:text-right mt-8 md:mt-0">
                    <div className="flex justify-center md:justify-end space-x-4">
                        <a href="https://linkedin.com" className="hover:text-blue-400">
                            <i className="fab fa-linkedin"></i>
                        </a>
                        <a href="https://github.com" className="hover:text-gray-300">
                            <i className="fab fa-github"></i>
                        </a>
                        <a href="https://twitter.com" className="hover:text-blue-400">
                            <i className="fab fa-twitter"></i>
                        </a>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">© {new Date().getFullYear()} MeetCapture. All rights reserved.</p>
                </div>

            </div>
        </footer>
    );
}