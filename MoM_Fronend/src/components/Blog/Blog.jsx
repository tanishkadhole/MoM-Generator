import React from "react";

const blogPosts = [
    {
        id: 1,
        title: "How AI is Transforming Meetings",
        image: "/blog1.jpeg",
        excerpt: "Discover how AI-powered tools can enhance productivity and automate note-taking during meetings.",
        date: "March 7, 2025",
        author: "Sanskar",
    },
    {
        id: 2,
        title: "Best Practices for Effective Meetings",
        image: "/blog2.jpeg",
        excerpt: "Learn the top strategies to ensure your meetings are productive and result-oriented.",
        date: "March 5, 2025",
        author: "Tanishka",
    },
    {
        id: 3,
        title: "The Future of Remote Work and Collaboration",
        image: "/blog3.jpeg",
        excerpt: "Explore how remote work trends are shaping the future of collaboration and team efficiency.",
        date: "March 3, 2025",
        author: "Vidit",
    }
];

export default function Blog() {
    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Hero Section */}
            <div className="bg-blue-600 text-white text-center py-16 px-6">
                <h1 className="text-4xl font-bold">Our Blog</h1>
                <p className="mt-2 text-lg">Insights and tips on productivity, AI, and effective meetings.</p>
            </div>

            {/* Blog Content */}
            <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Featured Blog Post */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <img src="/featured.jpeg" alt="Featured Blog" className="w-full h-64 object-cover" />
                        <div className="p-6">
                            <h2 className="text-2xl font-semibold text-gray-800">Featured: Revolutionizing Meeting Management</h2>
                            <p className="text-gray-600 mt-2">Discover how AI and automation are changing the way meetings are managed.</p>
                            <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                                Read More
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-800">Categories</h3>
                    <ul className="mt-3 space-y-2 text-gray-600">
                        <li className="hover:text-blue-600 cursor-pointer">AI & Automation</li>
                        <li className="hover:text-blue-600 cursor-pointer">Productivity</li>
                        <li className="hover:text-blue-600 cursor-pointer">Remote Work</li>
                        <li className="hover:text-blue-600 cursor-pointer">Meeting Strategies</li>
                    </ul>
                </div>
            </div>

            {/* Blog Grid */}
            <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {blogPosts.map((post) => (
                    <div key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-gray-800">{post.title}</h3>
                            <p className="text-gray-600 mt-2">{post.excerpt}</p>
                            <p className="text-gray-400 text-sm mt-2">{post.date} • {post.author}</p>
                            <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                                Read More
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}