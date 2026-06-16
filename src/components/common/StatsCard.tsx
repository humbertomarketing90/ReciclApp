import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface StatsCardProps {
  id?: string;
  key?: React.Key | number | string;
  title: string;
  value: string | number;
  change?: string;
  Icon: React.ComponentType<any> | any;
  colorClass?: string;
  className?: string;
}

export default function StatsCard({
  id,
  title,
  value,
  change,
  Icon,
  colorClass = 'text-brand-green bg-emerald-50 border-emerald-100',
  className = '',
}: StatsCardProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className={`p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 transition-all duration-200 hover:shadow-md hover:border-slate-200/85 ${className}`}
    >
      <div className={`p-3.5 rounded-xl border flex items-center justify-center ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
        <h4 className="text-2xl font-semibold font-display text-slate-900 mt-1 tracking-tight truncate">
          {value}
        </h4>
        {change && (
          <p className="text-xs text-slate-400 font-medium mt-1 font-mono flex items-center gap-1">
            {change}
          </p>
        )}
      </div>
    </motion.div>
  );
}
