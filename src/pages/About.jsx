import React from 'react';
import { motion } from 'framer-motion';
import { FiTarget, FiShield, FiUsers, FiAward, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const About = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: <FiShield className="text-primary" size={24} />,
      title: 'Security First',
      description: 'We safeguard all transactions via automated escrow. Funds are only disbursed once you approve the completed service.',
    },
    {
      icon: <FiAward className="text-accent" size={24} />,
      title: 'Vetted Quality',
      description: 'Every artisan undergoes background, certification, and identity checks before they can accept customer bookings.',
    },
    {
      icon: <FiUsers className="text-blue-500" size={24} />,
      title: 'Empowering Communities',
      description: 'We enable local trade practitioners and specialists to grow sustainable businesses by connecting them with stable work.',
    },
    {
      icon: <FiTarget className="text-purple-500" size={24} />,
      title: 'Direct Transparency',
      description: 'No hidden finder fees or middle-man rates. You view verified feedback, hourly estimates, and message directly.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Search & Match',
      description: 'Browse local profiles, audit specialty trade documents, check proximity sectors, and compare ratings.',
    },
    {
      number: '02',
      title: 'Book with Escrow',
      description: 'Detail your service needs, get an automated cost estimate, and lock payment safely in our escrow system.',
    },
    {
      number: '03',
      title: 'Direct Resolution',
      description: 'Artisans complete work on-site, message updates in real-time, and get paid once you release the escrow.',
    },
  ];

  const stats = [
    { label: 'Verified Artisans', value: '5,000+' },
    { label: 'Completed Jobs', value: '45,000+' },
    { label: 'Escrow Volume', value: '₦120M+' },
    { label: 'Satisfaction Rate', value: '98.6%' },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <motion.span 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-black tracking-widest text-primary uppercase bg-primary/10 px-3 py-1.5 rounded-full"
            >
              Who We Are
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-extrabold text-secondary tracking-tight leading-tight"
            >
              Bridging the gap between <span className="text-gradient">trusted skills</span> and local needs
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-secondary/60 leading-relaxed"
            >
              Fix-It is a modern escrow-backed marketplace for vetted trade professionals. We empower skilled plumbers, solar installers, designers, and handymen to manage secure transactions while providing consumers with verified services.
            </motion.p>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Stats Bar */}
      <section className="bg-secondary py-12 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-primary">{stat.value}</h3>
                <p className="text-xs text-white/50 font-bold uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-secondary tracking-tight">How Fix-It Works</h2>
          <p className="text-xs sm:text-sm text-secondary/50">Our flow ensures maximum security and complete clarity for both sides.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <Card key={idx} hoverable={true} className="p-8 bg-white border-secondary/5 relative group">
              <span className="text-5xl font-black text-secondary/5 absolute top-6 right-6 select-none group-hover:text-primary/10 transition-colors duration-300">
                {step.number}
              </span>
              <div className="space-y-4">
                <h4 className="text-base font-extrabold text-secondary">{step.title}</h4>
                <p className="text-xs sm:text-sm text-secondary/60 leading-relaxed">{step.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-secondary tracking-tight">Our Core Values</h2>
          <p className="text-xs sm:text-sm text-secondary/50">The principles driving every line of code and customer interaction.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, idx) => (
            <Card key={idx} hoverable={false} className="p-6 bg-white border-secondary/5 space-y-4">
              <div className="p-3 bg-secondary/5 rounded-2xl w-fit flex items-center justify-center">
                {v.icon}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-secondary">{v.title}</h4>
                <p className="text-xs text-secondary/60 leading-relaxed">{v.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust CTA banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-premium rounded-[32px] p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to experience modern trade services?
            </h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed">
              Join thousands of customers who rely on verified, escrow-protected expertise, or become a registered artisan to list services and scale your trade.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button onClick={() => navigate('/signup')} variant="primary" className="!bg-white !text-secondary hover:!bg-slate-100 flex items-center gap-2">
                Join Fix-It Free <FiArrowRight />
              </Button>
              <Button onClick={() => navigate('/contact')} variant="outline" className="!border-white/20 !text-white hover:!bg-white/10">
                Contact Support Desk
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
