import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdClose } from 'react-icons/io';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className = '',
  closeOnOverlayClick = true,
}) => {

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] h-[95vh]',
  };

  const selectedSize = sizes[size] || sizes.md;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeOnOverlayClick ? onClose : undefined}
            className="fixed inset-0 bg-secondary/35 backdrop-blur-[6px]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`
              relative w-full ${selectedSize} bg-white rounded-3xl border border-secondary/5 
              shadow-[0_20px_50px_rgba(17,24,39,0.15)] overflow-hidden z-10 flex flex-col
              ${className}
            `}
          >
            {/* Header */}
            {title && (
              <div className="px-6 py-5 flex items-center justify-between border-b border-secondary/5">
                <h3 className="text-lg font-bold text-secondary tracking-tight">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl hover:bg-secondary/5 text-secondary/50 hover:text-secondary transition-colors duration-200"
                >
                  <IoMdClose size={20} />
                </button>
              </div>
            )}

            {/* If no title, still provide close button at top-right */}
            {!title && (
              <button
                onClick={onClose}
                className="absolute top-5 right-5 z-20 p-1.5 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-secondary/5 text-secondary/50 hover:text-secondary border border-secondary/5 transition-colors duration-200"
              >
                <IoMdClose size={18} />
              </button>
            )}

            {/* Content Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {children}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
