// src/pages/SupportPage.tsx
import React from "react";
import { FaPhoneAlt, FaEnvelope, FaComments, FaQuestionCircle } from "react-icons/fa"; // Added FaQuestionCircle, FaHeadset

const SupportPage: React.FC = () => {
  // Function to scroll to the chatbot if it's open or try to open it
  const handleStartChat = () => {
    // This is a simplified way to interact with a floating chatbot.
    // A more robust solution might involve a global state management (Context/Redux/Zustand)
    // or a direct ref if the chatbot was passed down.
    // For now, we'll assume the FloatingChatbot has an ID 'floating-chatbot'
    // and we just want to bring focus to it.
    const chatbotElement = document.getElementById('floating-chatbot');
    if (chatbotElement) {
      chatbotElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Optionally, if the chatbot has a method to open itself:
      // chatbotElement.dispatchEvent(new CustomEvent('openChatbot'));
    } else {
      alert("Live chat functionality is not yet fully integrated or the chatbot is not visible.");
      console.log("Attempted to start chat, but chatbot element not found.");
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Hero Section for Support Page - More Subtle */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-3 animate-fade-in-up">
          How Can We <span className="text-yellow-300">Help You?</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          Our dedicated support team is here to assist you every step of the way.
        </p>
      </section>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4 animate-fade-in">
            Get In <span className="text-blue-700">Touch</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "100ms" }}>
            Choose the best way to reach us, and we'll be happy to help with your queries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Call Us Card */}
          <div className="group p-8 border border-gray-200 rounded-xl shadow-lg bg-white
                        hover:shadow-xl hover:border-blue-300 transform hover:-translate-y-2
                        transition duration-300 ease-in-out flex flex-col items-center text-center">
            <FaPhoneAlt className="text-5xl text-blue-600 mb-4 group-hover:text-blue-700 transition-colors" />
            <h3 className="font-bold text-2xl mb-2 text-gray-800 group-hover:text-blue-700">Call Us</h3>
            <p className="text-sm text-gray-600 mb-4">Speak with a support agent directly for immediate assistance.</p>
            <a
              href="tel:+919876543210"
              className="inline-block bg-blue-600 text-white font-semibold py-2 px-6 rounded-full
                         shadow-md hover:bg-blue-700 transition duration-300 transform hover:scale-105"
            >
              +91 98765 43210
            </a>
          </div>

          {/* Email Support Card */}
          <div className="group p-8 border border-gray-200 rounded-xl shadow-lg bg-white
                        hover:shadow-xl hover:border-purple-300 transform hover:-translate-y-2
                        transition duration-300 ease-in-out flex flex-col items-center text-center">
            <FaEnvelope className="text-5xl text-purple-600 mb-4 group-hover:text-purple-700 transition-colors" />
            <h3 className="font-bold text-2xl mb-2 text-gray-800 group-hover:text-purple-700">Email Support</h3>
            <p className="text-sm text-gray-600 mb-4">Send us your detailed queries and we'll get back to you promptly.</p>
            <a
              href="mailto:support@shippitin.com"
              className="inline-block bg-purple-600 text-white font-semibold py-2 px-6 rounded-full
                         shadow-md hover:bg-purple-700 transition duration-300 transform hover:scale-105"
            >
              support@shippitin.com
            </a>
          </div>

          {/* Live Chat Card */}
          <div className="group p-8 border border-gray-200 rounded-xl shadow-lg bg-white
                        hover:shadow-xl hover:border-green-300 transform hover:-translate-y-2
                        transition duration-300 ease-in-out flex flex-col items-center text-center">
            <FaComments className="text-5xl text-green-600 mb-4 group-hover:text-green-700 transition-colors" />
            <h3 className="font-bold text-2xl mb-2 text-gray-800 group-hover:text-green-700">Live Chat</h3>
            <p className="text-sm text-gray-600 mb-4">Chat with our customer service representatives in real-time.</p>
            <button
              onClick={handleStartChat}
              className="inline-block bg-green-600 text-white font-semibold py-2 px-6 rounded-full
                         shadow-md hover:bg-green-700 transition duration-300 transform hover:scale-105"
            >
              Start Chat
            </button>
          </div>
        </div>

        {/* Contact Form Section */}
        <section className="mb-16 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Send Us a Message</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                id="name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
              <input
                type="email"
                id="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john.doe@example.com"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                id="subject"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Inquiry about freight services"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
              <textarea
                id="message"
                rows={5}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message here..."
              ></textarea>
            </div>
            <div className="md:col-span-2 text-center">
              <button
                type="submit"
                className="inline-block bg-blue-600 text-white font-semibold py-3 px-8 rounded-full
                           shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
              >
                Send Message
              </button>
            </div>
          </form>
        </section>

        {/* FAQ Section (Placeholder) */}
        <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {/* FAQ Item 1 */}
            <details className="group border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition">
              <summary className="flex justify-between items-center font-semibold text-gray-800">
                How can I track my shipment?
                <FaQuestionCircle className="text-blue-500 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-2 pl-4 border-l-2 border-blue-200">
                You can track your shipment using the tracking number provided at the time of booking on our <a href="/track" className="text-blue-600 hover:underline">Track Page</a>.
              </p>
            </details>
            {/* FAQ Item 2 */}
            <details className="group border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition">
              <summary className="flex justify-between items-center font-semibold text-gray-800">
                What types of cargo do you handle?
                <FaQuestionCircle className="text-blue-500 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-2 pl-4 border-l-2 border-blue-200">
                We handle a wide range of cargo, from documents and parcels to heavy machinery and hazardous goods. Please refer to our <a href="/services" className="text-blue-600 hover:underline">Services Page</a> for more details.
              </p>
            </details>
            {/* Add more FAQ items as needed */}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SupportPage;
