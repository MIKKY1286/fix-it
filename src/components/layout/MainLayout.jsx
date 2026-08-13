import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineMenuAlt3, HiX } from 'react-icons/hi';
import { FiArrowRight } from 'react-icons/fi';
import Button from '../ui/Button';

const MainLayout = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Scroll effect for Navbar styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'FAQ', path: '/faq' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Sticky Header */}
      <header
        className={`
          fixed top-0 left-0 w-full z-40 transition-all duration-300
          ${isScrolled 
            ? 'py-4 bg-white/70 backdrop-blur-md border-b border-secondary/5 shadow-sm' 
            : 'py-6 bg-transparent'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                F
              </div>
              <span className="text-xl font-bold tracking-tight text-secondary group-hover:text-primary transition-colors duration-300">
                Fix-<span className="text-primary">It</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) => `
                    text-sm font-medium transition-colors duration-200
                    ${isActive 
                      ? 'text-primary' 
                      : 'text-secondary/70 hover:text-secondary'
                    }
                  `}
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>

            {/* Desktop Auth CTA */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-secondary/70 hover:text-secondary transition-colors duration-200">
                Sign In
              </Link>
              <Button 
                onClick={() => navigate('/signup')} 
                variant="primary" 
                size="sm"
                iconRight={<FiArrowRight />}
              >
                Join Fix-It
              </Button>
            </div>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-secondary hover:bg-secondary/5 transition-colors duration-200"
            >
              {isMobileMenuOpen ? <HiX size={24} /> : <HiOutlineMenuAlt3 size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <React.Fragment>
            {/* Drawer Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-30 bg-secondary/20 backdrop-blur-sm md:hidden"
            />
            {/* Drawer Side Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 w-[80%] max-w-sm h-full z-30 bg-white border-l border-secondary/5 shadow-2xl p-6 pt-24 flex flex-col justify-between md:hidden"
            >
              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-lg font-semibold text-secondary/80 hover:text-primary transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-3 text-sm font-semibold text-secondary/80 border border-secondary/10 rounded-2xl hover:bg-secondary/5 transition-colors duration-250"
                >
                  Sign In
                </Link>
                <Button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/signup');
                  }}
                  variant="primary"
                  className="w-full py-3"
                >
                  Join Fix-It
                </Button>
              </div>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <main className="flex-1 pt-24">
        <Outlet />
      </main>

      {/* Premium Footer */}
      <footer className="relative z-10 bg-[#111827] text-white/70 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Company Info */}
            <div className="md:col-span-1 space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-primary/20">
                  F
                </div>
                <span className="text-lg font-bold text-white">
                  Fix-<span className="text-primary">It</span>
                </span>
              </Link>
              <p className="text-sm leading-relaxed text-white/50">
                Fix-It connects customers with verified artisans and skilled professionals while helping artisans build their businesses.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/customer/search" className="hover:text-primary transition-colors duration-200">Find Services</Link></li>
                <li><Link to="/signup?role=artisan" className="hover:text-primary transition-colors duration-200">Apply as Artisan</Link></li>
                <li><Link to="/login" className="hover:text-primary transition-colors duration-200">User Dashboard</Link></li>
                <li><Link to="/about" className="hover:text-primary transition-colors duration-200">How it Works</Link></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/about" className="hover:text-primary transition-colors duration-200">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors duration-200">Contact Support</Link></li>
                <li><Link to="/privacy" className="hover:text-primary transition-colors duration-200">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-primary transition-colors duration-200">Terms of Service</Link></li>
              </ul>
            </div>

            {/* Emergency & Social */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact Info</h4>
              <p className="text-sm text-white/50 leading-relaxed">
                Have questions or need emergency assistance? Reach out:
              </p>
              <p className="text-sm text-white font-medium mt-2">support@fixit.com</p>
              <p className="text-sm text-primary font-bold mt-1">+1 (800) FIX-IT</p>
            </div>
          </div>

          <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-white/40">
            <p>© {new Date().getFullYear()} Fix-It Inc. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link to="/privacy" className="hover:text-white transition-colors duration-200">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition-colors duration-200">Terms</Link>
              <Link to="/faq" className="hover:text-white transition-colors duration-200">Sitemap</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
