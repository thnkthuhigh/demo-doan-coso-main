import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { JpServiceCard } from '../common/JapaneseCard';
import { Star } from 'lucide-react';

const ServiceCard = ({ service, index, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="h-full"
      onClick={() => onClick && onClick(service.name)}
    >
      <JpServiceCard
        title={service.name}
        description={service.description}
        image={service.image}
        href={`/services/${service.id || service._id}`}
        badge={
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center">
            <Star className="h-3 w-3 mr-1 fill-current" />
            Hot
          </div>
        }
        footer={
          <div className="flex justify-between items-center">
            <span className="text-red-500 font-medium text-sm">
              Xem chi tiết →
            </span>
            {service.price && (
              <div className="bg-slate-100 text-slate-800 px-3 py-1 rounded-lg font-medium text-sm">
                {typeof service.price === "number"
                  ? service.price.toLocaleString("vi-VN") + " đ"
                  : service.price}
              </div>
            )}
          </div>
        }
      />
    </motion.div>
  );
};

export default ServiceCard;