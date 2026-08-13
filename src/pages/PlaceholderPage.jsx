import React from 'react';
import Card from '../components/ui/Card';
import { FiTool } from 'react-icons/fi';

const PlaceholderPage = ({ title }) => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Card glass={true} className="p-8 text-center flex flex-col items-center justify-center gap-6">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
          <FiTool size={28} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-secondary tracking-tight">{title}</h1>
          <p className="text-sm text-secondary/50 max-w-md mx-auto">
            This module is scheduled for implementation in a subsequent development phase. All routing, design layouts, and Tailwind classes are configured and active.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
