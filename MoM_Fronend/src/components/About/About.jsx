import React from 'react';

export default function About() {
    return (
        <div className="py-10 bg-[#a4a69c] text-[#2b2b2b]"> {/* Darker text for better contrast */}
            <div className="container mx-auto px-6 md:px-12 xl:px-6">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    
                    {/* Left Side - Image */}
                    <div className="w-full md:w-1/2 flex justify-center">
                        <img 
                            src="/mom_about.png" // Ensure this is placed in public/
                            alt="MeetCapture Illustration" 
                            className="w-full h-full object-cover rounded-lg shadow-lg"
                        />
                    </div>

                    {/* Right Side - Content */}
                    <div className="w-full md:w-1/2">
                        <h2 className="text-3xl font-bold md:text-4xl text-center md:text-left text-[#1f1f1f]">
                            MeetCapture - Smooth Meetings and Notes
                        </h2>
                        <p className="mt-4 text-lg text-justify leading-relaxed">
                            MeetCapture is <strong>your AI-powered assistant</strong> for capturing and structuring meetings effortlessly. 
                            Whether you're in a corporate boardroom, a client discussion, or a remote team call, 
                            MeetCapture <strong>automates minutes of meetings (MoM)</strong> so you never miss key decisions.
                        </p>
                        <p className="mt-3 text-lg text-justify leading-relaxed">
                            Our system <strong>identifies action points, records attendee contributions, and organizes discussions</strong> into a structured, easy-to-read format. No more manually jotting down notes or struggling to recall 
                            what was decided last week—MeetCapture does the work for you.
                        </p>
                        
                        {/* Key Features - Now properly spaced */}
                        <div className="mt-5">
                        <h3 className="text-2xl font-semibold text-[#1f1f1f] text-left">Key Features:</h3>
                            <ul className="mt-2 space-y-2 list-disc list-inside text-lg text-justify">
                                <li><strong>Automated MoM Generation</strong> – Let AI handle note-taking.</li>
                                <li><strong>Action Item Tracking</strong> – Assign and follow up on tasks.</li>
                                <li><strong>Seamless Integration</strong> – Works with your workflow effortlessly.</li>
                            </ul>
                        </div>

                        <p className="mt-5 text-lg text-justify leading-relaxed">
                            <strong>Boost your meeting productivity today</strong> with MeetCapture. Stay focused, stay organized, 
                            and let technology handle the rest.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
