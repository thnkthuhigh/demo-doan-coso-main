import React from 'react';
import { motion } from 'framer-motion';

/**
 * Japanese Minimalist Stats Card
 * Compact and reusable statistics display component
 */
export function StatsCard({ number, label, icon: Icon, gradient = 'from-blue-500 to-purple-500', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="jp-card p-5 text-center group"
    >
      {/* Icon */}
      <div className="mb-3 flex justify-center">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${gradient} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
          {Icon && <Icon className="h-5 w-5" />}
        </div>
      </div>

      {/* Number */}
      <div className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-1`}>
        {number}
      </div>

      {/* Label */}
      <p className="text-sm text-slate-600 font-medium line-clamp-2">
        {label}
      </p>
    </motion.div>
  );
}

/**
 * Stats Grid Container
 * Responsive grid for stats cards
 */
export function StatsGrid({ children, cols = 4 }) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[cols] || gridCols[4]} gap-4`}>
      {children}
    </div>
  );
}

/**
 * Large Stats Card for Hero Sections
 * Slightly larger with more visual impact
 */
export function HeroStatsCard({ number, label, icon: Icon, gradient = 'from-blue-500 to-purple-500', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, rotateY: 5 }}
      className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-5 hover:bg-white/20 transition-all duration-500 shadow-lg group"
    >
      {/* Background Glow */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />

      <div className="relative z-10 text-center">
        {/* Icon */}
        <div className="mb-3 flex justify-center">
          <div className={`p-2.5 rounded-lg bg-gradient-to-r ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {Icon && <Icon className="h-6 w-6" />}
          </div>
        </div>

        {/* Number */}
        <div className={`text-3xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-1.5 group-hover:scale-105 transition-transform duration-300`}>
          {number}
        </div>

        {/* Label */}
        <p className="text-white/90 text-xs font-semibold line-clamp-2">
          {label}
        </p>
      </div>
    </motion.div>
  );
}

export default StatsCard;
