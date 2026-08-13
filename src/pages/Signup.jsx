import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import BespokeBackground from '../components/common/BespokeBackground';
import { FiMail, FiLock, FiUser, FiArrowRight, FiShield, FiBriefcase } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/authContextValue';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getFriendlyErrorMessage } from '../utils/firebaseErrors';

const Signup = () => {
  const [role, setRole] = useState('customer'); // 'customer' | 'artisan'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [testimonials, setTestimonials] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { signup } = useAuth();

  // Load testimonials from Firestore
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'testimonials'));
        const list = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setTestimonials(list);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
      }
    };
    fetchTestimonials();
  }, []);

  // Testimonials Carousel loop
  useEffect(() => {
    if (testimonials.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials]);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all registration fields.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const { profile } = await signup(email, password, name, role);
      navigate(`/${profile.role}`);
    } catch (err) {
      console.error(err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background">
      <BespokeBackground />

      <div className="flex-1 flex relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-16 gap-8">
        
        {/* Left Column - Slide Testimonials */}
        <div className="hidden lg:flex flex-1 flex-col justify-between p-8 bg-secondary rounded-[32px] text-white relative overflow-hidden shadow-2xl border border-white/5">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="flex items-center gap-2 relative z-10">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center font-black text-lg">F</div>
            <span className="text-lg font-bold tracking-tight">Fix-<span className="text-primary">It</span></span>
          </div>

          <div className="relative my-auto min-h-[220px] flex flex-col justify-center">
            {testimonials.length > 0 && (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    <p className="text-xl sm:text-2xl font-medium leading-relaxed text-white/90 italic">
                      "{testimonials[currentSlide]?.quote}"
                    </p>
                    <div>
                      <h4 className="font-bold text-white text-base">{testimonials[currentSlide]?.name}</h4>
                      <p className="text-xs text-white/40 font-medium mt-0.5">{testimonials[currentSlide]?.role}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="flex gap-2 mt-8">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-6 bg-primary' : 'w-1.5 bg-white/20'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-6 text-xs text-white/40 pt-6 border-t border-white/5 relative z-10">
            <span className="flex items-center gap-1.5"><FiShield className="text-primary" /> SECURED INTEGRATIONS</span>
            <span className="flex items-center gap-1.5"><FiBriefcase className="text-accent" /> EXPAND YOUR SKILLED WORKPLACE</span>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="flex-[1.1] flex items-center justify-center lg:px-6">
          <Card glass={true} className="w-full max-w-md p-8 sm:p-10 border-white/40 shadow-xl space-y-6">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-extrabold text-secondary tracking-tight">Get Started Free</h1>
              <p className="text-sm text-secondary/50">Create your account to browse or list local trades.</p>
            </div>

            {/* Selector Option */}
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-secondary/5 rounded-2xl">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`
                  py-3 text-xs font-bold rounded-xl transition-all duration-200 flex flex-col items-center gap-1
                  ${role === 'customer' 
                    ? 'bg-white text-secondary shadow-sm' 
                    : 'text-secondary/50 hover:text-secondary'
                  }
                `}
              >
                <FiUser size={14} />
                Find Artisans
              </button>
              <button
                type="button"
                onClick={() => setRole('artisan')}
                className={`
                  py-3 text-xs font-bold rounded-xl transition-all duration-200 flex flex-col items-center gap-1
                  ${role === 'artisan' 
                    ? 'bg-white text-secondary shadow-sm' 
                    : 'text-secondary/50 hover:text-secondary'
                  }
                `}
              >
                <FiBriefcase size={14} />
                Offer Services
              </button>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSignup} className="space-y-4">
              <Input
                label={role === 'artisan' ? 'Business / Trade Name' : 'Full Name'}
                type="text"
                placeholder={role === 'artisan' ? 'e.g. Ade Electricals' : 'e.g. Alex Adebayo'}
                iconLeft={<FiUser size={16} />}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. contact@domain.com"
                iconLeft={<FiMail size={16} />}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                iconLeft={<FiLock size={16} />}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
              />

              {error && <p className="text-xs text-danger font-semibold mt-1">{error}</p>}

              <Button
                type="submit"
                className="w-full py-3.5 mt-2"
                loading={isLoading}
                iconRight={<FiArrowRight />}
              >
                Join as {role === 'artisan' ? 'Artisan' : 'Customer'}
              </Button>
            </form>

            <div className="relative flex items-center justify-center">
              <hr className="w-full border-secondary/15" />
              <span className="absolute px-3 bg-[#F8FAFC]/90 backdrop-blur-sm text-xs font-bold text-secondary/40 uppercase tracking-wider">Or</span>
            </div>

            <Button variant="outline" className="w-full flex items-center justify-center gap-3 py-3.5 border-secondary/10 bg-white font-bold text-secondary/70">
              <FcGoogle size={18} />
              Sign Up with Google
            </Button>

            <p className="text-xs text-center text-secondary/50 pt-2">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Signup;
