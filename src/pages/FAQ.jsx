import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiSearch, FiHelpCircle, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const FAQ = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'customer', label: 'For Customers' },
    { id: 'artisan', label: 'For Artisans' },
    { id: 'payment', label: 'Escrow & Payments' },
  ];

  const faqs = [
    {
      id: 1,
      category: 'customer',
      question: 'How are Fix-It artisans verified?',
      answer: 'Every artisan on our platform undergoes a thorough verification process. This includes national ID (NIN) document review, business CAC certification verification, address verification, and trade membership audits. Look for the green "Verified" badge on their profile.',
    },
    {
      id: 2,
      category: 'payment',
      question: 'How does the Escrow payment protect me?',
      answer: 'When you book an artisan, you lock the project estimation value in escrow. Funds are securely held by our platform. Only when the artisan completes the job and you confirm completion on your dashboard are the funds released directly to the artisan. This protects you from incomplete or low-quality work.',
    },
    {
      id: 3,
      category: 'artisan',
      question: 'What documents do I need to register as an artisan?',
      answer: 'To get fully verified and unlock customer bookings, you must upload: 1) A copy of your National Identification Number (NIN) slip or card, 2) Valid trade certifications or business registry papers (e.g., REAN, CAC, LSTC certificates), and 3) References from previous projects.',
    },
    {
      id: 4,
      category: 'payment',
      question: 'How do artisans receive payouts?',
      answer: 'Once a customer approves a completed booking, our escrow releases the transaction value. The payout is deposited into your registered wallet. You can request a payout to any registered Nigerian bank account instantly, powered by our Paystack integration.',
    },
    {
      id: 5,
      category: 'customer',
      question: 'What happens if a job is not completed or is low-quality?',
      answer: 'If there is an issue with the job, do not release the escrow payment. Instead, open a dispute log on your bookings page. Our administration team will step in, inspect messages, review photos, and arbitrate. We will refund the customer or pay the artisan depending on our findings.',
    },
    {
      id: 6,
      category: 'artisan',
      question: 'Is there a platform fee for listing my trade services?',
      answer: 'Creating a profile is completely free. Fix-It charges a small 10% commission on completed escrow payments to cover payment gateways, platform upkeep, and arbitration security. You receive 90% of the completed job payout.',
    },
    {
      id: 7,
      category: 'payment',
      question: 'What payment methods are supported on the wallet?',
      answer: 'Fix-It partners with Paystack to support secure funding options: Nigerian debit cards, bank transfers, USSD transfers, and direct bank link authorization. All client wallets are safeguarded.',
    },
  ];

  const handleToggle = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filter FAQs based on query and tab
  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || faq.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-12 pb-20">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs font-black tracking-widest text-primary uppercase bg-primary/10 px-3 py-1.5 rounded-full">
          Help Center
        </span>
        <h1 className="text-3xl font-extrabold text-secondary tracking-tight">
          Frequently Asked <span className="text-gradient">Questions</span>
        </h1>
        <p className="text-sm text-secondary/60">
          Everything you need to know about bookings, verify processes, escrow accounts, and support tickets.
        </p>
      </div>

      {/* Search and Tabs */}
      <div className="space-y-6">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40" size={18} />
          <input
            type="text"
            placeholder="Search help topics or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-secondary text-sm border border-secondary/10 hover:border-secondary/20 transition-all rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-primary shadow-sm"
          />
        </div>

        {/* Categories Tab selectors */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveTab(cat.id);
                setExpandedId(null);
              }}
              className={`
                px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer
                ${activeTab === cat.id 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'bg-secondary/5 text-secondary/60 hover:bg-secondary/10'
                }
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion Panels */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <Card glass={true} className="p-12 text-center text-secondary/40 text-xs">
            No matching questions found in this category. Try adjusting your search query.
          </Card>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div 
                key={faq.id} 
                className="bg-white border border-secondary/5 rounded-2xl overflow-hidden transition-shadow duration-200 shadow-sm"
              >
                {/* Panel Header */}
                <button
                  onClick={() => handleToggle(faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                >
                  <span className="text-sm font-extrabold text-secondary pr-4">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-secondary/40 shrink-0"
                  >
                    <FiChevronDown size={18} />
                  </motion.div>
                </button>

                {/* Panel Body */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-secondary/60 leading-relaxed border-t border-secondary/5">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Help Ticket Desk */}
      <Card hoverable={false} className="p-6 bg-slate-50 border-secondary/5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
            <FiHelpCircle size={20} />
          </div>
          <div className="space-y-0.5 text-center sm:text-left">
            <h4 className="text-sm font-extrabold text-secondary">Still have unresolved questions?</h4>
            <p className="text-xs text-secondary/50">Our customer support desk is available to assist you 24/7.</p>
          </div>
        </div>
        <Button onClick={() => navigate('/contact')} variant="primary" className="flex items-center gap-2 text-xs shrink-0 py-2.5">
          Submit Help Request <FiArrowRight size={14} />
        </Button>
      </Card>
      
    </div>
  );
};

export default FAQ;
