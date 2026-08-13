import React from 'react';
import { motion } from 'framer-motion';

const BespokeBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#F8FAFC]">
      {/* Dynamic Ambient Gradient Sphere 1 (Primary Orange Glow) */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -60, 40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-primary/8 blur-[120px]"
      />

      {/* Dynamic Ambient Gradient Sphere 2 (Navy Slate Glow) */}
      <motion.div
        animate={{
          x: [0, -30, 50, 0],
          y: [0, 50, -30, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-[10%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-secondary/6 blur-[150px]"
      />

      {/* Dynamic Ambient Gradient Sphere 3 (Accent Green Glow) */}
      <motion.div
        animate={{
          x: [0, 20, -40, 0],
          y: [0, 40, -40, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[40%] left-[30%] w-[35vw] h-[35vw] rounded-full bg-accent/4 blur-[130px]"
      />
    </div>
  );
};

export default BespokeBackground;
