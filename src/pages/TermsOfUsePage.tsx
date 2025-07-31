// src/pages/TermsOfUsePage.tsx
import React from 'react';

const TermsOfUsePage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-3 animate-fade-in-up">
          Terms of <span className="text-yellow-300">Use</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          Understanding your rights and responsibilities when using our services.
        </p>
      </section>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 prose max-w-none">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using the SHIPPITIN website and services, you agree to be bound by these Terms of Use and all terms incorporated by reference. If you do not agree to all of these terms, do not use our website or services.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">2. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. All changes will be effective immediately upon their posting to our website. Your continued use of our services after any such changes constitutes your acceptance of the new Terms.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">3. User Conduct</h2>
          <p>
            You agree to use our services only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of SHIPPITIN. Prohibited behavior includes harassing or causing distress or inconvenience to any other user, transmitting obscene or offensive content, or disrupting the normal flow of dialogue within our services.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">4. Intellectual Property</h2>
          <p>
            All content on this website, including text, graphics, logos, images, and software, is the property of SHIPPITIN or its content suppliers and protected by international copyright laws.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">5. Disclaimers and Limitation of Liability</h2>
          <p>
            The information on this website is provided "as is" without any representations or warranties, express or implied. SHIPPITIN makes no representations or warranties in relation to this website or the information and materials provided on this website.
          </p>
          <p>
            SHIPPITIN will not be liable to you (whether under the law of contact, the law of torts or otherwise) in relation to the contents of, or use of, or otherwise in connection with, this website:
          </p>
          <ul>
            <li>for any indirect, special or consequential loss; or</li>
            <li>for any business losses, loss of revenue, income, profits or anticipated savings, loss of contracts or business relationships, loss of reputation or goodwill, or loss or corruption of information or data.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">6. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
          </p>

          <p className="mt-8 text-sm text-gray-600">
            Last updated: July 21, 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUsePage;
