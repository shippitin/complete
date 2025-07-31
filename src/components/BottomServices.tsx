  import React from 'react';
import { Globe, Shield, Ship, Clock, HelpCircle } from 'lucide-react';
import type { BottomService } from '../types/index.ts';

const BottomServices: React.FC = () => {
  const services: BottomService[] = [
    {
      icon: Globe,
      title: 'Where2Go',
      subtitle: 'Frel',
    },
    {
      icon: Shield,
      title: 'Insurance',
      subtitle: 'For Freight',
    },
    {
      icon: Ship,
      title: 'Explore Global Freight',
      subtitle: 'Worldwide end-to-end',
    },
    {
      icon: Clock,
      title: 'Express',
      subtitle: 'Same-day',
    },
    {
      icon: HelpCircle,
      title: 'MICE',
      subtitle: 'Less tesnar load',
    },
  ];

  return (
    <div className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Icon className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{service.title}</h3>
                  <p className="text-sm text-gray-500">{service.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomServices;