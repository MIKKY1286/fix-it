import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/authContextValue';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  FiCreditCard, FiMapPin, FiSliders, FiPlus, FiAlertCircle
} from 'react-icons/fi';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, updateProfile } = useAuth();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showOnlyEmergency, setShowOnlyEmergency] = useState(false);

  // Booking Wizard states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedArtisan, setSelectedArtisan] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [problemDesc, setProblemDesc] = useState('');
  const [aiPriceRange, setAiPriceRange] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Wallet states
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletHistory, setWalletHistory] = useState([]);
  const [isDepositing, setIsDepositing] = useState(false);

  // active bookings
  const [activeBookings, setActiveBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [artisans, setArtisans] = useState([]);

  // Sync wallet balance
  useEffect(() => {
    if (userProfile) {
      setWalletBalance(userProfile.walletBalance || 0);
    }
  }, [userProfile]);

  // Load Firestore data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;
      try {
        // Fetch Categories
        const catSnap = await getDocs(collection(db, 'categories'));
        const catList = [];
        catSnap.forEach((doc) => catList.push({ id: doc.id, ...doc.data() }));
        setCategories(catList);

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

        // Fetch Active Bookings
        const bookingsSnap = await getDocs(query(collection(db, 'bookings'), where('customerId', '==', currentUser.uid)));
        const bookingsList = [];
        bookingsSnap.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'pending' || data.status === 'accepted') {
            bookingsList.push({
              id: doc.id,
              name: data.artisanName,
              category: data.category,
              location: data.location || 'Lagos',
              date: data.date,
              time: data.time,
              status: data.status,
              price: data.price
            });
          }
        });
        setActiveBookings(bookingsList);

        // Fetch Transactions history for wallet ledger
        const txSnap = await getDocs(query(collection(db, 'transactions'), where('userId', '==', currentUser.uid)));
        const txList = [];
        txSnap.forEach((doc) => {
          txList.push({ id: doc.id, ...doc.data() });
        });
        txList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setWalletHistory(txList);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
      }
    };
    fetchDashboardData();
  }, [currentUser]);

  // Filter artisans based on inputs
  const filteredArtisans = artisans.filter((artisan) => {
    const matchesSearch = 
      artisan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artisan.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artisan.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = selectedCategory === '' || artisan.categoryId === selectedCategory;
    const matchesEmergency = !showOnlyEmergency || artisan.isEmergency;

    return matchesSearch && matchesCategory && matchesEmergency;
  });

  // Handle Wizard Booking triggers
  const openBookingWizard = (artisan) => {
    setSelectedArtisan(artisan);
    setBookingStep(1);
    setBookingDate('');
    setBookingTime('');
    setProblemDesc('');
    setAiPriceRange('');
    setIsBookingOpen(true);
  };

  const handleNextStep = () => {
    if (bookingStep === 1) {
      if (!bookingDate || !bookingTime) return;
      setBookingStep(2);
    } else if (bookingStep === 2) {
      if (!problemDesc) return;
      // Simulate AI Price Estimation
      setIsSubmittingBooking(true);
      setTimeout(() => {
        setIsSubmittingBooking(false);
        const baseRate = selectedArtisan.hourlyRate;
        const lower = Math.round(baseRate * 1.8);
        const upper = Math.round(baseRate * 2.5);
        setAiPriceRange(`₦${lower.toLocaleString()} - ₦${upper.toLocaleString()}`);
        setBookingStep(3);
      }, 1000);
    }
  };

  const handleConfirmBooking = async () => {
    setIsSubmittingBooking(true);
    try {
      const totalCost = selectedArtisan.hourlyRate * 2;
      const createdAt = new Date().toISOString();
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        customerId: currentUser.uid,
        customerName: userProfile?.name || currentUser.email,
        artisanId: selectedArtisan.id,
        artisanName: selectedArtisan.name,
        category: selectedArtisan.category,
        location: selectedArtisan.location,
        date: bookingDate,
        time: bookingTime,
        description: problemDesc,
        status: 'pending',
        price: totalCost,
        createdAt
      });
      await addDoc(collection(db, 'transactions'), {
        userId: currentUser.uid,
        bookingId: bookingRef.id,
        desc: `Escrow hold - Booking: ${selectedArtisan.name}`,
        amount: totalCost,
        type: 'escrow',
        status: 'held',
        date: 'Today',
        createdAt
      });
      const nextBalance = walletBalance - totalCost;
      await updateProfile({ walletBalance: nextBalance });
      setWalletBalance(nextBalance);
      setActiveBookings([
        {
          id: bookingRef.id,
          name: selectedArtisan.name,
          category: selectedArtisan.category,
          location: selectedArtisan.location,
          date: bookingDate,
          time: bookingTime,
          status: 'pending',
          price: totalCost
        },
        ...activeBookings
      ]);
      setWalletHistory([
        { id: bookingRef.id, desc: `Escrow hold - Booking: ${selectedArtisan.name}`, amount: totalCost, type: 'escrow', date: 'Today', createdAt },
        ...walletHistory
      ]);

      setBookingStep(4);
    } catch (err) {
      console.error('Error creating booking:', err);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Deposit trigger
  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || isNaN(depositAmount)) return;
    setIsDepositing(true);
    try {
      const depositVal = parseFloat(depositAmount);
      const nextBalance = walletBalance + depositVal;
      const createdAt = new Date().toISOString();
      await updateProfile({ walletBalance: nextBalance });
      const txRef = await addDoc(collection(db, 'transactions'), {
        userId: currentUser.uid,
        desc: 'Paystack topup - Card deposit',
        amount: depositVal,
        type: 'deposit',
        status: 'success',
        date: 'Today',
        createdAt
      });
      setWalletBalance(nextBalance);
      setWalletHistory([
        { id: txRef.id, desc: 'Paystack topup - Card deposit', amount: depositVal, type: 'deposit', date: 'Today', createdAt },
        ...walletHistory
      ]);
      setDepositAmount('');
      setIsWalletOpen(false);
    } catch (err) {
      console.error('Error depositing funds:', err);
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-secondary/5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-secondary">
            Welcome Back, <span className="text-primary">{userProfile?.name || 'Fix-It User'}</span>
          </h1>
          <p className="text-xs text-secondary/45 mt-1">{userProfile?.isVerified ? 'Verified' : 'Registered'} Client Account</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsWalletOpen(true)} className="flex items-center gap-1.5 font-bold">
            <FiCreditCard /> Balance: ₦{walletBalance.toLocaleString()}
          </Button>
          <Button variant="primary" size="sm" onClick={() => setSelectedCategory('')} className="flex items-center gap-1">
            <FiPlus /> New Service Call
          </Button>
        </div>
      </div>

      {/* Main Search Panel & Filter controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Filter Panels */}
        <Card hoverable={false} className="lg:col-span-1 p-6 space-y-6 bg-white border-secondary/5 self-start">
          <h3 className="text-xs font-bold text-secondary uppercase tracking-widest flex items-center gap-1.5 pb-3 border-b border-secondary/5">
            <FiSliders /> Service Filters
          </h3>

          {/* Search Inputs */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-secondary/50 uppercase">Instant Search</label>
            <Input 
              placeholder="e.g. Inverter, leak..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="!py-1"
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-secondary/50 uppercase">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white text-secondary text-sm border border-secondary/10 rounded-xl px-3 py-2.5 outline-none hover:border-secondary/20 transition-all duration-200"
            >
              <option value="">All Services</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Checkbox triggers */}
          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="emergency-box" 
              checked={showOnlyEmergency} 
              onChange={() => setShowOnlyEmergency(!showOnlyEmergency)}
              className="accent-primary rounded h-4 w-4"
            />
            <label htmlFor="emergency-box" className="text-xs font-semibold text-secondary/70 select-none cursor-pointer">
              Emergency Night Support Only
            </label>
          </div>
        </Card>

        {/* Right Side: Artisans Registry & Active Bookings */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Active Bookings Log */}
          {activeBookings.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Active Service Requests</h3>
              <div className="space-y-3">
                {activeBookings.map((booking) => (
                  <Card key={booking.id} hoverable={true} className="p-5 border-l-4 border-l-primary bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="primary" size="sm">{booking.date} • {booking.time}</Badge>
                        <span className="text-xs text-secondary/45 font-bold">{booking.category}</span>
                      </div>
                      <h4 className="text-sm font-extrabold text-secondary">{booking.name}</h4>
                      <p className="text-[11px] text-secondary/50 flex items-center gap-1">
                        <FiMapPin size={11} /> {booking.location} • Escrow Amount: ₦{booking.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={booking.status === 'pending' ? 'warning' : 'success'}>
                        {booking.status}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => navigate('/customer/messages')} className="!px-3">
                        Chat
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Artisans list grid */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Available Experts ({filteredArtisans.length})</h3>
            </div>

            {filteredArtisans.length === 0 ? (
              <Card glass={true} className="p-8 text-center text-secondary/50 text-xs">
                No matching trade artisans found in your location. Try adjusting filters.
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredArtisans.map((artisan) => (
                  <Card key={artisan.id} hoverable={true} className="p-6 bg-white border-secondary/5 flex flex-col justify-between min-h-[300px]">
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-start">
                        <div className="h-10 w-10 rounded-full bg-secondary/5 flex items-center justify-center font-bold text-xs">
                          {artisan.avatarText}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {artisan.isVerified && <Badge.Verified size="sm" />}
                          {artisan.isEmergency && <Badge.Emergency size="sm" />}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-secondary tracking-tight">{artisan.name}</h4>
                        <p className="text-xs text-primary font-bold">{artisan.category}</p>
                        <p className="text-[11px] text-secondary/45 flex items-center gap-1 mt-0.5">
                          <FiMapPin size={11} /> {artisan.location}
                        </p>
                      </div>

                      <p className="text-xs text-secondary/60 leading-relaxed line-clamp-2">
                        {artisan.bio}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-secondary/5 mt-4 flex justify-between items-center">
                      <div className="text-xs font-bold text-secondary">
                        ₦{artisan.hourlyRate.toLocaleString()}<span className="text-secondary/40 font-normal">/hr</span>
                      </div>
                      <Button variant="primary" size="sm" onClick={() => openBookingWizard(artisan)}>
                        Book Expert
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* --- MOCK BOOKING WIZARD MODAL --- */}
      <Modal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        title={selectedArtisan ? `Book ${selectedArtisan.name}` : 'Booking Wizard'}
        size="md"
      >
        {selectedArtisan && (
          <div className="space-y-6">
            
            {/* Step Progress indicators */}
            <div className="flex justify-between items-center pb-4 border-b border-secondary/5">
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex items-center gap-1.5">
                  <div className={`
                    h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${bookingStep >= stepNum 
                      ? 'bg-primary text-white' 
                      : 'bg-secondary/5 text-secondary/40'
                    }
                  `}>
                    {stepNum}
                  </div>
                  <span className="text-[10px] font-bold text-secondary/40 hidden sm:inline">
                    {stepNum === 1 && 'Schedule'}
                    {stepNum === 2 && 'Problem'}
                    {stepNum === 3 && 'AI Estimate'}
                    {stepNum === 4 && 'Confirm'}
                  </span>
                </div>
              ))}
            </div>

            {/* Step 1: Scheduling */}
            {bookingStep === 1 && (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-secondary/50">Select your preferred date and starting time slot.</p>
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Date"
                    type="date"
                    min="2026-08-05"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                  />
                  <Input 
                    label="Start Time"
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button 
                    variant="primary" 
                    onClick={handleNextStep}
                    disabled={!bookingDate || !bookingTime}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Problem Description */}
            {bookingStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-secondary/70">Describe the issue in detail</label>
                  <textarea
                    rows={4}
                    placeholder="Provide details about the electrical panel leak, solar battery faults..."
                    className="w-full bg-white text-secondary text-sm border border-secondary/10 hover:border-secondary/20 transition-all rounded-xl p-3 outline-none focus:border-primary"
                    value={problemDesc}
                    onChange={(e) => setProblemDesc(e.target.value)}
                  />
                </div>
                
                {/* Photo Simulation */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-secondary/70">Upload reference photos (Optional)</label>
                  <div className="p-6 border border-dashed border-secondary/20 rounded-2xl text-center bg-secondary/[0.01]">
                    <p className="text-xs text-secondary/40">Drag images or click to browse reference file</p>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setBookingStep(1)}>Back</Button>
                  <Button 
                    variant="primary" 
                    onClick={handleNextStep}
                    disabled={!problemDesc || isSubmittingBooking}
                    loading={isSubmittingBooking}
                  >
                    Analyze with AI
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: AI Price Estimation */}
            {bookingStep === 3 && (
              <div className="space-y-5">
                <Card className="p-5 border-l-4 border-l-accent bg-accent-light/30">
                  <div className="flex gap-2">
                    <FiAlertCircle className="text-accent shrink-0 mt-0.5" size={18} />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-secondary">AI Escrow Estimate Analysis</h4>
                      <p className="text-xs text-secondary/60 leading-relaxed">
                        Based on historical listings of <span className="font-bold">{selectedArtisan.category}</span>, local parts indexes, and the Lekki corridor complex task parameters, your estimated budget range is:
                      </p>
                      <p className="text-lg font-extrabold text-accent pt-1">{aiPriceRange}</p>
                    </div>
                  </div>
                </Card>

                <div className="p-4 bg-secondary/5 rounded-2xl text-xs text-secondary/60 space-y-1.5">
                  <p>• Estimated base: 2 hours at ₦{selectedArtisan.hourlyRate.toLocaleString()}/hr.</p>
                  <p>• escrows hold funds securely; Paystack escrows require positive balance validation.</p>
                </div>

                {walletBalance < selectedArtisan.hourlyRate * 2 ? (
                  <div className="p-4 bg-danger-light/35 border border-danger/10 text-danger text-xs rounded-xl font-medium">
                    Insufficient Balance. Wallet: ₦{walletBalance.toLocaleString()}. Deposit required.
                  </div>
                ) : null}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setBookingStep(2)}>Back</Button>
                  <Button 
                    variant="primary" 
                    onClick={handleConfirmBooking}
                    disabled={walletBalance < selectedArtisan.hourlyRate * 2 || isSubmittingBooking}
                    loading={isSubmittingBooking}
                  >
                    Lock Escrow & Book
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Success confirmation */}
            {bookingStep === 4 && (
              <div className="text-center py-6 space-y-4">
                <div className="h-12 w-12 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xl mx-auto shadow-md">
                  ✓
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-extrabold text-secondary">Booking Successfully Funded</h3>
                  <p className="text-xs text-secondary/55 leading-relaxed max-w-sm mx-auto">
                    Escrow funds are held securely. {selectedArtisan.name} has been notified and scheduled for <span className="font-bold text-secondary">{bookingDate}</span>.
                  </p>
                </div>
                <div className="pt-4">
                  <Button variant="primary" onClick={() => setIsBookingOpen(false)}>Done</Button>
                </div>
              </div>
            )}

          </div>
        )}
      </Modal>

      {/* --- MOCK WALLET TOPUP MODAL --- */}
      <Modal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        title="Top Up Wallet via Paystack"
        size="sm"
      >
        <form onSubmit={handleDeposit} className="space-y-4">
          <Input 
            label="Deposit Amount (NGN)"
            type="number"
            placeholder="e.g. 10000"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
          <div className="p-4 bg-secondary/5 rounded-2xl text-[11px] text-secondary/55 space-y-1">
            <p>• Secured credit cards checkout alignment.</p>
            <p>• Sandbox mock logs will return immediate callbacks.</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsWalletOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={isDepositing} disabled={!depositAmount}>
              Execute Paystack Escrow
            </Button>
          </div>
        </form>

        {/* Transaction History ledger list */}
        <div className="mt-8 border-t border-secondary/5 pt-6 space-y-3">
          <h4 className="text-xs font-bold text-secondary uppercase tracking-wider">Transaction Logs</h4>
          <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
            {walletHistory.map((w) => (
              <div key={w.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-bold text-secondary truncate max-w-[180px]">{w.desc}</p>
                  <p className="text-[10px] text-secondary/40 mt-0.5">{w.date}</p>
                </div>
                <span className={`font-extrabold ${w.type === 'deposit' || w.type === 'refund' ? 'text-accent' : 'text-danger'}`}>
                  {w.type === 'deposit' || w.type === 'refund' ? '+' : '-'}₦{w.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Modal>
      
    </div>
  );
};

export default CustomerDashboard;
