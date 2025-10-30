
import React from 'react';

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerAccessory?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, icon, children, className = '', headerAccessory }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-slate-100 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
            <div className="text-amber-500 mr-3">{icon}</div>
            <h2 className="text-lg font-semibold text-indigo-900">{title}</h2>
        </div>
        {headerAccessory && <div>{headerAccessory}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
};