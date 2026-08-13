import React, { useEffect, useState } from 'react';
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/authContextValue';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { FiBriefcase, FiDollarSign, FiStar, FiMapPin } from 'react-icons/fi';

const ArtisanDashboard = () => {
  const { currentUser, userProfile, updateProfile } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [withdrawableBalance, setWithdrawableBalance] = useState(0);
  
  // Withdrawal State
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);
  const [withdrawHistory, setWithdrawHistory] = useState([]);

  // Calendar toggle states
  const [availableSlots, setAvailableSlots] = useState([
    { id: 'slot-1', day: 'Monday', time: '09:00 AM - 12:00 PM', active: true },
    { id: 'slot-2', day: 'Monday', time: '02:00 PM - 05:00 PM', active: true },
    { id: 'slot-3', day: 'Tuesday', time: '10:00 AM - 01:00 PM', active: false }
  ]);

  // Jobs Manager state
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (userProfile) {
      setWithdrawableBalance(userProfile.walletBalance || 0);
      setIsOnline(Boolean(userProfile.isEmergency));
    }
  }, [userProfile]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;
      try {
        const [jobsSnap, withdrawalsSnap] = await Promise.all([
          getDocs(query(collection(db, 'bookings'), where('artisanId', '==', currentUser.uid))),
          getDocs(query(collection(db, 'transactions'), where('userId', '==', currentUser.uid), where('type', '==', 'withdrawal')))
        ]);

        setJobs(jobsSnap.docs.map((item) => {
          const data = item.data();
          return {
            id: item.id,
            client: data.customerName || 'Customer',
            service: data.description || data.category || 'Service request',
            location: data.location || 'Lagos',
            time: data.time || data.date || 'Scheduled',
            status: data.status === 'accepted' ? 'active' : data.status,
            price: Number(data.price) || 0
          };
        }));
        setWithdrawHistory(withdrawalsSnap.docs
          .map((item) => ({ id: item.id, ...item.data() }))
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
      } catch (err) {
        console.error('Error fetching artisan dashboard data:', err);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  // Toggle availability slots
  const toggleSlot = (id) => {
    setAvailableSlots(prev => prev.map(slot => 
      slot.id === id ? { ...slot, active: !slot.active } : slot
    ));
  };

  const handleVisibilityToggle = async () => {
    const nextOnlineState = !isOnline;
    setIsOnline(nextOnlineState);
    try {
      await updateProfile({ isEmergency: nextOnlineState });
    } catch (err) {
      console.error('Error updating visibility:', err);
      setIsOnline(!nextOnlineState);
    }
  };

  // Job Actions
  const handleAcceptJob = async (id) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status: 'accepted' });
    } catch (err) {
      console.error('Error accepting job:', err);
      return;
    }
    setJobs(prev => prev.map(job => 
      job.id === id ? { ...job, status: 'active' } : job
    ));
  };

  const handleDeclineJob = async (id) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status: 'cancelled' });
    } catch (err) {
      console.error('Error declining job:', err);
      return;
    }
    setJobs(prev => prev.filter(job => job.id !== id));
  };

  const handleCompleteJob = async (id) => {
    const job = jobs.find(j => j.id === id);
    if (!job) return;
    const nextBalance = withdrawableBalance + job.price;
    try {
      await updateDoc(doc(db, 'bookings', id), { status: 'completed' });
      await updateProfile({ walletBalance: nextBalance });
      await addDoc(collection(db, 'transactions'), {
        userId: currentUser.uid,
        bookingId: id,
        type: 'disbursed',
        amount: job.price,
        desc: `Escrow Released - Job #${id.substring(0, 5)} Completed`,
        status: 'success',
        date: 'Today',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error completing job:', err);
      return;
    }
    setJobs(prev => prev.map(j => 
      j.id === id ? { ...j, status: 'completed' } : j
    ));
    setWithdrawableBalance(nextBalance);
  };

  // Withdrawal Submit
  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || isNaN(withdrawAmount) || withdrawAmount > withdrawableBalance) return;
    
    setIsProcessingWithdrawal(true);
    try {
      const amountVal = parseFloat(withdrawAmount);
      const nextBalance = withdrawableBalance - amountVal;
      const createdAt = new Date().toISOString();
      await updateProfile({ walletBalance: nextBalance });
      const txRef = await addDoc(collection(db, 'transactions'), {
        userId: currentUser.uid,
        type: 'withdrawal',
        amount: amountVal,
        bank: bankName,
        accountNumber,
        desc: `Withdrawal to ${bankName}`,
        status: 'processing',
        date: 'Today',
        createdAt
      });
      setWithdrawableBalance(nextBalance);
      setWithdrawHistory([
        { id: txRef.id, bank: bankName, amount: amountVal, status: 'processing', date: 'Today', createdAt },
        ...withdrawHistory
      ]);
      setWithdrawAmount('');
      setBankName('');
      setAccountNumber('');
      setIsWithdrawOpen(false);
    } catch (err) {
      console.error('Error submitting withdrawal:', err);
    } finally {
      setIsProcessingWithdrawal(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Greetings Block & Online switch */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-secondary/5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-secondary">
              Good morning, <span className="text-primary">{userProfile?.name || 'Artisan'}</span>
            </h1>
            <Badge.Verified />
          </div>
          <p className="text-xs text-secondary/45 mt-1">{userProfile?.profile?.category || 'Professional Artisan'} • {userProfile?.profile?.location || 'Service Hub'} • {userProfile?.isVerified ? 'Verified' : 'Pending Verification'} Business Profile</p>
        </div>
        <div className="flex items-center gap-4 bg-secondary/5 p-1.5 rounded-2xl">
          <span className="text-xs font-bold text-secondary/60 px-2 select-none">Live Visibility</span>
          <button
            onClick={handleVisibilityToggle}
            className={`
              relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
              ${isOnline ? 'bg-accent' : 'bg-secondary/20'}
            `}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                ${isOnline ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Stats Counter metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card.Stat
          title="Active Schedules"
          value={jobs.filter(j => j.status === 'active').length.toString()}
          icon={<FiBriefcase size={20} />}
          change={`${jobs.filter(j => j.status === 'pending').length} pending review`}
          changeType="neutral"
        />
        <Card.Stat
          title="Withdrawable Earnings"
          value={`₦${withdrawableBalance.toLocaleString()}`}
          icon={<FiDollarSign size={20} />}
          change="Paystack Payout ESCROW"
          changeType="increase"
          onClick={() => setIsWithdrawOpen(true)}
          className="cursor-pointer border-l-4 border-l-accent"
        />
        <Card.Stat
          title="Client Rating Score"
          value="4.95 / 5.0"
          icon={<FiStar size={20} />}
          change="Last 30 days review log"
          changeType="increase"
        />
      </div>

      {/* Workspace panel and Job cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Jobs list grid */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Scheduled Work Orders</h3>
          
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <Card glass={true} className="p-8 text-center text-xs text-secondary/45">
                No active appointments. Set visibility to online to match nearby service calls.
              </Card>
            ) : (
              jobs.map((job) => (
                <Card 
                  key={job.id} 
                  hoverable={false} 
                  className={`
                    p-6 border bg-white border-secondary/5 relative overflow-hidden
                    ${job.status === 'pending' ? 'border-l-4 border-l-warning' : ''}
                    ${job.status === 'active' ? 'border-l-4 border-l-primary' : ''}
                    ${job.status === 'completed' ? 'border-l-4 border-l-accent opacity-75' : ''}
                  `}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant={job.status === 'pending' ? 'warning' : job.status === 'active' ? 'primary' : 'success'} size="sm">
                          {job.status === 'pending' ? 'Pending Acceptance' : job.status === 'active' ? 'In Progress' : 'Completed'}
                        </Badge>
                        <span className="text-[10px] text-secondary/40 font-bold uppercase tracking-wider">{job.time}</span>
                      </div>
                      <h4 className="text-sm font-extrabold text-secondary">{job.client}</h4>
                      <p className="text-xs text-secondary/60 leading-snug">{job.service}</p>
                      <p className="text-[11px] text-secondary/45 flex items-center gap-1">
                        <FiMapPin size={11} /> {job.location} • Contract Value: ₦{job.price.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {job.status === 'pending' && (
                        <React.Fragment>
                          <Button variant="outline" size="sm" onClick={() => handleDeclineJob(job.id)} className="!text-danger border-danger/10 hover:bg-danger/5">
                            Decline
                          </Button>
                          <Button variant="primary" size="sm" onClick={() => handleAcceptJob(job.id)}>
                            Accept
                          </Button>
                        </React.Fragment>
                      )}
                      
                      {job.status === 'active' && (
                        <Button variant="primary" size="sm" onClick={() => handleCompleteJob(job.id)} className="bg-accent hover:bg-accent-hover">
                          Submit Work Verification
                        </Button>
                      )}

                      {job.status === 'completed' && (
                        <Badge variant="success">Disbursement Released</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Side Panel: Calendar Availability & performance metrics */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Weekly Time Availability</h3>
          
          <Card hoverable={false} className="p-6 bg-white border-secondary/5 space-y-4">
            <p className="text-xs text-secondary/50 leading-relaxed">Toggle days and slots available for client bookings matching.</p>
            <div className="space-y-2.5">
              {availableSlots.map((slot) => (
                <div 
                  key={slot.id} 
                  onClick={() => toggleSlot(slot.id)}
                  className={`
                    p-3 rounded-xl border text-xs flex justify-between items-center cursor-pointer transition-all duration-200
                    ${slot.active 
                      ? 'bg-accent-light/20 border-accent/20 text-accent font-semibold' 
                      : 'bg-slate-50 border-secondary/5 text-secondary/40'
                    }
                  `}
                >
                  <div>
                    <p className="font-bold">{slot.day}</p>
                    <p className="text-[10px] mt-0.5">{slot.time}</p>
                  </div>
                  <span className="text-[9px] uppercase font-bold tracking-wider">
                    {slot.active ? 'Available' : 'Paused'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>

      {/* --- REUSABLE WITHDRAWAL MODAL --- */}
      <Modal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        title="Disburse Earnings via Paystack Transfer"
        size="sm"
      >
        <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
          <div className="p-4 bg-secondary/5 rounded-2xl">
            <p className="text-[10px] font-bold text-secondary/40 uppercase">Withdrawable Escrows</p>
            <p className="text-xl font-extrabold text-secondary pt-0.5">₦{withdrawableBalance.toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-secondary/50 uppercase">Payout Destination Bank</label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full bg-white text-secondary text-sm border border-secondary/10 rounded-xl px-3 py-2.5 outline-none hover:border-secondary/20 transition-all duration-200"
            >
              <option value="">Select bank...</option>
              <option value="Access Bank">Access Bank</option>
              <option value="Guaranty Trust Bank">Guaranty Trust Bank (GTB)</option>
              <option value="Zenith Bank">Zenith Bank</option>
              <option value="United Bank for Africa">United Bank for Africa (UBA)</option>
            </select>
          </div>

          <Input 
            label="10-Digit Account Number (NUBAN)"
            type="text"
            maxLength={10}
            placeholder="e.g. 0123456789"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />

          <Input 
            label="Withdrawal Amount (NGN)"
            type="number"
            placeholder="e.g. 50000"
            max={withdrawableBalance}
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsWithdrawOpen(false)}>Cancel</Button>
            <Button 
              type="submit" 
              variant="primary" 
              loading={isProcessingWithdrawal} 
              disabled={!withdrawAmount || !accountNumber || !bankName || withdrawAmount > withdrawableBalance}
            >
              Transfer Funds
            </Button>
          </div>
        </form>

        {/* Withdrawal Ledger History */}
        <div className="mt-8 border-t border-secondary/5 pt-6 space-y-3">
          <h4 className="text-xs font-bold text-secondary uppercase tracking-wider">Payout History</h4>
          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
            {withdrawHistory.map((w) => (
              <div key={w.id} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-bold text-secondary">{w.bank}</p>
                  <p className="text-[10px] text-secondary/40 mt-0.5">{w.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-secondary">₦{w.amount.toLocaleString()}</p>
                  <span className={`text-[9px] uppercase font-bold ${w.status === 'processed' ? 'text-accent' : 'text-warning animate-pulse'}`}>
                    {w.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
      
    </div>
  );
};

export default ArtisanDashboard;
