import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users, TrendingUp } from 'lucide-react';

/**
 * Japanese Minimalist Card Component
 * Follows Ma (間) - negative space principle
 * Standard sizes: h-48 (192px) for most cards
 */
export function JpCard({ 
  image, 
  title, 
  description, 
  badge,
  footer,
  onClick,
  href,
  imageHeight = 'h-48',
  padding = 'p-5',
  className = '',
  children
}) {
  const Wrapper = href ? 'a' : 'div';
  const wrapperProps = href ? { href } : onClick ? { onClick } : {};

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group"
    >
      <Wrapper
        {...wrapperProps}
        className={`jp-card jp-card-hover rounded-xl overflow-hidden block ${className}`}
      >
        {/* Image Section */}
        {image && (
          <div className={`relative ${imageHeight} overflow-hidden`}>
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Badge overlay */}
            {badge && (
              <div className="absolute top-4 right-4">
                {badge}
              </div>
            )}
            
            {/* Japanese gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        {/* Content Section */}
        <div className={padding}>
          {children || (
            <>
              {/* Title */}
              {title && (
                <h3 className="text-lg font-bold text-slate-800 mb-3 group-hover:text-red-500 transition-colors line-clamp-2">
                  {title}
                </h3>
              )}

              {/* Description */}
              {description && (
                <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                  {description}
                </p>
              )}

              {/* Footer */}
              {footer && (
                <div className="pt-4 border-t border-slate-200">
                  {footer}
                </div>
              )}
            </>
          )}
        </div>
      </Wrapper>
    </motion.div>
  );
}

// ===== PRESET VARIANTS =====

/**
 * Service Card - For services listing
 * Image height: 160px, Padding: 24px
 */
export function JpServiceCard({ onClick, href, ...props }) {
  return (
    <JpCard
      {...props}
      imageHeight="h-40"
      padding="p-6"
      onClick={onClick}
      href={href}
      footer={
        <div className="flex items-center text-red-500 font-medium text-sm">
          <span>Xem chi tiết</span>
          <ArrowRight className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
        </div>
      }
    />
  );
}

/**
 * Class Card - For classes listing
 * Image height: 160px, Padding: 20px
 */
export function JpClassCard({ enrolled, capacity, instructor, price, status, onClick, ...props }) {
  return (
    <JpCard
      {...props}
      imageHeight="h-40"
      padding="p-5"
      onClick={onClick}
      badge={
        status && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            status === 'active' || status === 'ongoing'
              ? 'bg-green-500 text-white' 
              : status === 'upcoming'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-500 text-white'
          }`}>
            {status === 'active' || status === 'ongoing' ? 'Đang mở' : 
             status === 'upcoming' ? 'Sắp mở' : 'Đã đóng'}
          </span>
        )
      }
      footer={
        <div className="space-y-3">
          {/* Capacity bar */}
          {capacity && (
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-600">Đã đăng ký</span>
                <span className="text-xs font-medium">{enrolled || 0}/{capacity}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((enrolled || 0) / capacity) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Instructor & Price */}
          <div className="flex items-center justify-between">
            {instructor && (
              <div className="flex items-center text-slate-600">
                <Users className="h-4 w-4 mr-1" />
                <span className="text-xs">
                  {typeof instructor === 'object' ? instructor.fullName : instructor}
                </span>
              </div>
            )}
            {price && (
              <span className="text-sm font-bold text-slate-800">
                {price.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>
        </div>
      }
    />
  );
}

/**
 * Compact Card - For lists, smaller spaces
 * Image height: 128px, Padding: 16px
 */
export function JpCompactCard(props) {
  return <JpCard {...props} imageHeight="h-32" padding="p-4" />;
}

/**
 * Feature Card - For featured content
 * Image height: 208px, Padding: 24px
 */
export function JpFeatureCard(props) {
  return <JpCard {...props} imageHeight="h-52" padding="p-6" />;
}

/**
 * Hero Card - For hero sections (MAX size)
 * Image height: 256px, Padding: 32px
 */
export function JpHeroCard(props) {
  return <JpCard {...props} imageHeight="h-64" padding="p-8" />;
}

export default JpCard;
