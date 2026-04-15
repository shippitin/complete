// src/components/HomeSections/AboutSection.tsx
import React from 'react';
// 1. Import Variants and Transition types from framer-motion
import { motion } from 'framer-motion';
import type { Variants, Transition } from 'framer-motion';
import { Truck, Rocket, Zap, Shield } from 'lucide-react'; 

// ... (keyHighlights data remains the same) ...
const keyHighlights: any[] = [
  // ...
];
// 2. Explicitly type the transition object
const springTransition: Transition = {
    type: 'spring',
    stiffness: 100
};
// 3. Explicitly type the Variants objects
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    // 4. Use the explicitly typed transition object here
    transition: springTransition,
  },
};
  const AboutSection: React.FC = () => {
    return (
      <section className="py-20 bg-gray-50 text-gray-800">
      <motion.div
        className="container mx-auto px-6 max-w-7xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants} // Error occurs here due to incorrect typing
      >
        {/* --- 1. Main Content Row --- */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl font-extrabold text-indigo-700 mb-4">
              Our Journey: Driving the Future of Shipping
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              **SHIPPITIN LOGISTICS PRIVATE LIMITED** is a pioneering startup recognized by the Govt. of India. We are dedicated to transforming a complex industry.
            </p>
            <p className="text-lg text-gray-600">
              We recognized the significance of tackling logistics obstacles and simplifying the supply chain for businesses and individuals, delivering speed, transparency, and reliability.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <img
              src="/images/homepage/about-us.jpg"
              alt="Logistics team working"
              className="w-full h-80 object-cover rounded-xl shadow-2xl transition duration-500 hover:scale-[1.02] filter grayscale hover:grayscale-0"
            />
          </motion.div>
        </div>

        {/* --- 2. Key Highlights / Placecards Grid --- */}
        <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-gray-800">Our Core Values</h3>
            <p className="text-gray-500">The pillars that define our service.</p>
        </div>

        <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
        >
          {keyHighlights.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border-t-4 border-indigo-500 flex flex-col items-start"
            >
              <item.icon className="w-8 h-8 text-indigo-600 mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h4>
              <p className="text-gray-500 text-sm">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default AboutSection;