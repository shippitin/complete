// src/pages/BlogPage.tsx
import React from 'react';
import { FaPenNib, FaCalendarAlt, FaUserEdit } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const blogPosts = [
  {
    id: '1',
    title: 'The Future of Green Logistics: What to Expect by 2030',
    excerpt: 'Explore how sustainable practices are reshaping the supply chain and what innovations are on the horizon for eco-friendly shipping.',
    date: 'July 10, 2025',
    author: 'SHIPPITIN Insights',
    imageUrl: 'https://placehold.co/400x250/a0d9b4/333333?text=Green+Logistics',
  },
  {
    id: '2',
    title: 'Navigating Customs: A Guide for International Shippers',
    excerpt: 'Understanding customs regulations is crucial for smooth international trade. Our guide simplifies the process for you.',
    date: 'June 28, 2025',
    author: 'Customs Team',
    imageUrl: 'https://placehold.co/400x250/b4a0d9/333333?text=Customs+Guide',
  },
  {
    id: '3',
    title: '5 Ways Technology is Revolutionizing Freight Management',
    excerpt: 'From AI-powered routing to real-time tracking, discover how technology is making logistics more efficient and transparent.',
    date: 'June 15, 2025',
    author: 'Tech Innovations',
    imageUrl: 'https://placehold.co/400x250/d9b4a0/333333?text=Logistics+Tech',
  },
];

const BlogPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-3 animate-fade-in-up">
          Our <span className="text-yellow-300">Blog</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          Insights, news, and expert advice on logistics and supply chain.
        </p>
      </section>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transform hover:scale-105 transition duration-300">
              <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <FaCalendarAlt className="mr-2" /> {post.date}
                  <FaUserEdit className="ml-4 mr-2" /> {post.author}
                </div>
                <p className="text-gray-700 text-sm mb-4">{post.excerpt}</p>
                <Link
                  to={`/blog/${post.id}`} // Link to a hypothetical detailed blog post page
                  className="inline-flex items-center text-blue-600 font-semibold hover:underline"
                >
                  Read More <FaPenNib className="ml-2" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination or More Posts CTA (Placeholder) */}
        <div className="mt-16 text-center">
          <Link
            to="/blog-archive" // Link to a hypothetical blog archive page
            className="inline-block bg-blue-600 text-white font-semibold py-3 px-8 rounded-full
                       shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
          >
            View All Posts
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
