/**
 * Temporary compatibility wrappers for Vintage -> Japanese migration
 * These will be removed after full migration
 */

import React from 'react';
import { JpCard } from '../common/JapaneseCard';

// Vintage wrappers using Japanese components
export function VintageContainer({ children, className = '' }) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function VintageSection({ children, className = '' }) {
  return (
    <section className={`py-12 ${className}`}>
      {children}
    </section>
  );
}

export function VintageCard({ children, className = '' }) {
  return (
    <div className={`jp-card rounded-xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export function VintageHeading({ level = 2, children, className = '' }) {
  const sizes = {
    1: 'text-4xl font-bold',
    2: 'text-3xl font-bold',
    3: 'text-2xl font-bold',
    4: 'text-xl font-bold',
    5: 'text-lg font-bold',
    6: 'text-base font-bold'
  };
  
  const Tag = `h${level}`;
  return (
    <Tag className={`${sizes[level] || sizes[2]} text-slate-800 ${className}`}>
      {children}
    </Tag>
  );
}

export function VintageText({ variant = 'body', children, className = '' }) {
  const variants = {
    lead: 'text-lg text-slate-600',
    body: 'text-base text-slate-700',
    small: 'text-sm text-slate-600',
    caption: 'text-xs text-slate-500'
  };
  
  return (
    <p className={`${variants[variant] || variants.body} ${className}`}>
      {children}
    </p>
  );
}

export function VintageButton({ variant = 'primary', children, onClick, className = '' }) {
  const variants = {
    primary: 'jp-btn-primary',
    secondary: 'jp-btn-secondary',
    outline: 'jp-btn-outline'
  };
  
  return (
    <button 
      onClick={onClick}
      className={`${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}

export function VintageGrid({ cols = 3, children, className = '' }) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };
  
  return (
    <div className={`grid ${colClasses[cols] || colClasses[3]} gap-6 ${className}`}>
      {children}
    </div>
  );
}

// Re-export for compatibility
export default {
  VintageContainer,
  VintageSection,
  VintageCard,
  VintageHeading,
  VintageText,
  VintageButton,
  VintageGrid
};
