import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import BespokeBackground from '../components/common/BespokeBackground';
import { 
  FiSearch, FiMapPin, FiArrowRight, FiStar, FiChevronDown, FiArrowUpRight
} from 'react-icons/fi';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

const Landing = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const [categories, setCategories] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [artisans, setArtisans] = useState([]);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        // Fetch Categories
        const catSnap = await getDocs(collection(db, 'categories'));
        const catList = [];
        catSnap.forEach((doc) => catList.push({ id: doc.id, ...doc.data() }));
        setCategories(catList);

        // Fetch FAQs
        const faqSnap = await getDocs(collection(db, 'faqs'));
        const faqList = [];
        faqSnap.forEach((doc) => faqList.push({ id: doc.id, ...doc.data() }));
        setFaqs(faqList);

        // Fetch Testimonials
        const testSnap = await getDocs(collection(db, 'testimonials'));
        const testList = [];
        testSnap.forEach((doc) => testList.push({ id: doc.id, ...doc.data() }));
        setTestimonials(testList);

        // Fetch Artisans
        const artisanSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'artisan')));
        const artisanList = [];
        artisanSnap.forEach((doc) => {
          const data = doc.data();
          const profile = data.profile || {};
          artisanList.push({
            id: doc.id,
            name: data.name,
            avatarText: data.avatarText,
            isVerified: data.isVerified,
            isEmergency: data.isEmergency,
            category: profile.category || 'Professional',
            categoryId: profile.categoryId || '',
            rating: profile.rating || 5.0,
            hourlyRate: profile.hourlyRate || 5000,
            location: profile.location || 'Lagos',
            bio: profile.bio || '',
            responseTime: profile.responseTime || '30 mins',
            skills: profile.skills || [],
            certifications: profile.certifications || [],
            completedJobs: profile.completedJobs || 0,
            reviewsCount: profile.reviewsCount || 0
          });
        });
        setArtisans(artisanList);
      } catch (err) {
        console.error('Error fetching landing data:', err);
      }
    };
    fetchLandingData();
  }, []);

  const filteredArtisans = activeTab === 'all' 
    ? artisans 
    : artisans.filter(a => a.categoryId === activeTab || a.category.toLowerCase().includes(activeTab));

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/customer', { state: { searchQuery, locationQuery } });
  };

  const stats = [
    { label: 'Active Service Experts', value: '1,420+' },
    { label: 'Escrow Guarantee Rate', value: '100%' },
    { label: 'Customer Rating Average', value: '4.91/5' },
    { label: 'Completed Appointments', value: '28,400+' },
  ];

  return (
    <div className="relative bg-slate-50">
      <BespokeBackground />

      {/* Hero & Search Console */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <Badge variant="primary" size="md" pulse={true} dot={true}>
            Escrow-Backed Service Workspace
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-secondary leading-tight">
            Find Trusted Artisans <br />
            <span className="text-gradient">Near You, Guaranteed.</span>
          </h1>
          <p className="text-base sm:text-lg text-secondary/60 max-w-2xl mx-auto leading-relaxed">
            Fix-It pairs customers with vetted professionals for home, automobile, and technology installations. Escrow accounts hold funds securely until delivery validation.
          </p>
        </div>

        {/* Stripe-like glass search widget */}
        <form 
          onSubmit={handleSearch}
          className="max-w-4xl mx-auto bg-white/70 backdrop-blur-md p-3 rounded-2xl sm:rounded-3xl border border-white/40 shadow-xl flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1 flex items-center gap-3 px-4 py-2 border-b sm:border-b-0 sm:border-r border-secondary/5">
            <FiSearch className="text-secondary/40 shrink-0" size={18} />
            <input 
              type="text" 
              placeholder="What trade do you need? e.g. Solar, Plumber..." 
              className="w-full bg-transparent border-none outline-none text-sm text-secondary placeholder-secondary/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex-1 flex items-center gap-3 px-4 py-2">
            <FiMapPin className="text-secondary/40 shrink-0" size={18} />
            <input 
              type="text" 
              placeholder="Location e.g. Lekki Phase 1..." 
              className="w-full bg-transparent border-none outline-none text-sm text-secondary placeholder-secondary/40"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary" className="!rounded-xl sm:!rounded-2xl py-3 px-6 shrink-0">
            Search Registry
          </Button>
        </form>
      </section>

      {/* Popular Categories Grid */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-secondary">
              Popular Service Segments
            </h2>
            <p className="text-sm text-secondary/50 mt-1">Explore verified trade experts across leading sectors.</p>
          </div>
          <span onClick={() => navigate('/login')} className="text-sm font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer">
            Explore All <FiArrowRight />
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((cat) => (
            <Card 
              key={cat.id} 
              hoverable={true} 
              onClick={() => {
                setSearchQuery(cat.name);
                navigate('/customer');
              }}
              className="p-5 text-center flex flex-col items-center justify-between min-h-[140px] cursor-pointer bg-white/40 border-white/20 backdrop-blur-sm"
            >
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                {cat.name[0]}
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-secondary truncate w-full">{cat.name}</h4>
                <p className="text-[10px] text-secondary/40 font-medium">{cat.count} Experts</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Vetted Artisans */}
      <section className="relative py-16 bg-white/40 backdrop-blur-sm border-y border-secondary/5 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-secondary">
                Featured Verified Experts
              </h2>
              <p className="text-sm text-secondary/50 mt-1">Check verified ratings and active trade certs.</p>
            </div>
            
            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-full pb-1">
              <button 
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shrink-0 ${activeTab === 'all' ? 'bg-secondary text-white' : 'bg-secondary/5 text-secondary/65 hover:bg-secondary/10'}`}
              >
                All Trades
              </button>
              <button 
                onClick={() => setActiveTab('solar-installer')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shrink-0 ${activeTab === 'solar-installer' ? 'bg-secondary text-white' : 'bg-secondary/5 text-secondary/65 hover:bg-secondary/10'}`}
              >
                Solar
              </button>
              <button 
                onClick={() => setActiveTab('interior-designer')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shrink-0 ${activeTab === 'interior-designer' ? 'bg-secondary text-white' : 'bg-secondary/5 text-secondary/65 hover:bg-secondary/10'}`}
              >
                Design
              </button>
              <button 
                onClick={() => setActiveTab('home-cleaning')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shrink-0 ${activeTab === 'home-cleaning' ? 'bg-secondary text-white' : 'bg-secondary/5 text-secondary/65 hover:bg-secondary/10'}`}
              >
                Cleaning
              </button>
            </div>
          </div>

          {/* Artisans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredArtisans.map((artisan) => (
              <Card key={artisan.id} hoverable={true} className="p-6 bg-white border-secondary/5 flex flex-col justify-between min-h-[360px]">
                <div className="space-y-4">
                  {/* Top Line badges */}
                  <div className="flex justify-between items-start">
                    <div className="h-11 w-11 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                      {artisan.avatarText}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {artisan.isVerified && <Badge.Verified size="sm" />}
                      {artisan.isEmergency && <Badge.Emergency size="sm" />}
                    </div>
                  </div>

                  {/* Profile title details */}
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-secondary tracking-tight">{artisan.name}</h3>
                    <p className="text-xs text-primary font-bold">{artisan.category}</p>
                    <p className="text-xs text-secondary/45 flex items-center gap-1">
                      <FiMapPin size={11} /> {artisan.location}
                    </p>
                  </div>

                  <p className="text-xs text-secondary/60 leading-relaxed line-clamp-3">
                    {artisan.bio}
                  </p>
                </div>

                {/* Rating details & CTA button */}
                <div className="pt-4 mt-4 border-t border-secondary/5 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1 font-bold text-secondary">
                      <FiStar className="text-warning fill-warning" size={13} />
                      {artisan.rating} <span className="text-secondary/40 font-normal">({artisan.reviewsCount} reviews)</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-secondary/40 uppercase font-bold">Hourly Rate</p>
                      <p className="font-extrabold text-secondary">₦{artisan.hourlyRate.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => navigate('/login')} 
                    variant="outline" 
                    size="sm" 
                    className="w-full flex items-center justify-center gap-1 font-bold"
                  >
                    Request Booking <FiArrowUpRight size={13} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Architectural Steps */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-secondary">How Fix-It Works</h2>
          <p className="text-sm text-secondary/50 max-w-md mx-auto">Get your tasks resolved in four simple phases.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Search & Match', desc: 'Query our vetted register by trade, credentials, response rates, and proximity.' },
            { step: '02', title: 'Get AI Estimate', desc: 'Input problem descriptions to get detailed hourly or flat cost approximations.' },
            { step: '03', title: 'Fund Escrow', desc: 'Accept terms and fund the contract securely via Paystack. Funds are kept safe.' },
            { step: '04', title: 'Validate Delivery', desc: 'Confirm work completion. Payment is released to the artisan automatically.' }
          ].map((item, idx) => (
            <Card key={idx} hoverable={false} className="p-6 bg-white/30 border-white/20 backdrop-blur-sm relative">
              <span className="absolute top-5 right-5 text-4xl font-black text-secondary/5 font-headings">{item.step}</span>
              <div className="space-y-3 pt-6">
                <h4 className="text-base font-bold text-secondary">{item.title}</h4>
                <p className="text-xs text-secondary/55 leading-relaxed">{item.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Stripe-like Grid: Why Choose Fix-It */}
      <section className="relative py-16 bg-secondary text-white z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Structured Platform Security</h2>
            <p className="text-sm text-white/50 max-w-md mx-auto">We eliminate transaction uncertainty for both clients and trades.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 p-6 bg-white/5 rounded-2xl border border-white/5">
              <div className="h-10 w-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">✓</div>
              <h3 className="text-base font-bold">100% Insured Escrows</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Artisans work knowing payment is locked. Customers pay knowing funds release solely upon validation.
              </p>
            </div>

            <div className="space-y-3 p-6 bg-white/5 rounded-2xl border border-white/5">
              <div className="h-10 w-10 rounded-lg bg-accent/20 text-accent flex items-center justify-center font-bold">✓</div>
              <h3 className="text-base font-bold">AI Support Assistants</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Get pricing verification suggestions and scam detection indicators to review contract logs dynamically.
              </p>
            </div>

            <div className="space-y-3 p-6 bg-white/5 rounded-2xl border border-white/5">
              <div className="h-10 w-10 rounded-lg bg-warning/20 text-warning flex items-center justify-center font-bold">✓</div>
              <h3 className="text-base font-bold">Vetted Certificates Directory</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                National IDs, addresses, and professional trade certificates are manually validated before approval.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic statistics */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-white/40 border border-white/30 backdrop-blur-md p-8 rounded-3xl shadow-sm">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center space-y-1">
              <p className="text-2xl sm:text-4xl font-extrabold text-secondary tracking-tight">{stat.value}</p>
              <p className="text-xs text-secondary/45 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Slider Section */}
      <section className="relative py-16 bg-white/20 z-10 border-t border-secondary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-secondary tracking-tight">Vouched by Nigerian Homeowners</h2>
          
          {testimonials.length > 0 && (
            <div className="p-8 bg-white border border-secondary/5 rounded-3xl shadow-sm space-y-6">
              <p className="text-lg text-secondary/70 leading-relaxed italic">
                "{testimonials[0]?.quote}"
              </p>
              <div>
                <h4 className="font-bold text-secondary">{testimonials[0]?.name}</h4>
                <p className="text-xs text-secondary/40 mt-0.5">{testimonials[0]?.role}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FAQ accordion section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto z-10 space-y-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-secondary tracking-tight text-center">Frequently Asked Queries</h2>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <Card 
              key={idx} 
              hoverable={false} 
              className="bg-white border-secondary/5 overflow-hidden"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-5 flex items-center justify-between font-bold text-secondary text-left text-sm"
              >
                <span>{faq.question}</span>
                <FiChevronDown 
                  size={16} 
                  className={`text-secondary/40 transition-transform duration-200 ${activeFaq === idx ? 'rotate-180' : ''}`} 
                />
              </button>
              
              <AnimatePresence initial={false}>
                {activeFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    <div className="px-6 pb-5 pt-1 text-xs text-secondary/60 leading-relaxed border-t border-secondary/5">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Conversion Block */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="bg-secondary rounded-[32px] overflow-hidden p-8 sm:p-12 relative text-white border border-white/5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent pointer-events-none" />
          <div className="max-w-xl space-y-4 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to verify your service needs?</h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Register in under 5 minutes. Find certified builders near you, or apply as a verified artisan to double your booking volumes.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 relative z-10 shrink-0">
            <Button onClick={() => navigate('/signup?role=customer')} variant="primary" size="lg" iconRight={<FiArrowRight />}>
              Find Experts
            </Button>
            <Button onClick={() => navigate('/signup?role=artisan')} variant="outline" size="lg" className="!border-white/20 !text-white hover:!bg-white/5">
              Apply as Artisan
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
