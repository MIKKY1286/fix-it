import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/authContextValue';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { FiBriefcase, FiMapPin, FiMessageSquare } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Jobs = () => {
  const { currentUser, userProfile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchJobs = useCallback(async () => {
    if (!currentUser) return;
    try {
      const q = query(collection(db, 'bookings'), where('artisanId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setJobs(list);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleAcceptJob = async (jobId) => {
    try {
      const jobRef = doc(db, 'bookings', jobId);
      await updateDoc(jobRef, { status: 'accepted' });
      fetchJobs();
    } catch (err) {
      console.error('Error accepting job:', err);
    }
  };

  const handleDeclineJob = async (jobId) => {
    try {
      const jobRef = doc(db, 'bookings', jobId);
      await updateDoc(jobRef, { status: 'cancelled' });
      fetchJobs();
    } catch (err) {
      console.error('Error declining job:', err);
    }
  };

  const handleCompleteJob = async (job) => {
    try {
      // 1. Set status to completed (Wait for customer to release escrow, or simulate auto escrow release if approved)
      // Since a professional startup app allows the artisan to request completion, and customer validates it.
      // Let's set status to completed immediately to simulate auto escrow payout release for demo fluidity!
      const jobRef = doc(db, 'bookings', job.id);
      await updateDoc(jobRef, { status: 'completed' });

      // 2. Disburse money to Artisan balance
      const newBal = (userProfile?.walletBalance || 0) + job.price;
      const artisanRef = doc(db, 'users', currentUser.uid);
      await updateDoc(artisanRef, { walletBalance: newBal });

      // 3. Log transaction
      await addDoc(collection(db, 'transactions'), {
        userId: currentUser.uid,
        type: 'disbursed',
        amount: job.price,
        desc: `Escrow Released - Job #${job.id.substring(0, 5)} Completed`,
        status: 'success',
        createdAt: new Date().toISOString()
      });

      fetchJobs();
    } catch (err) {
      console.error('Error completing job:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-secondary">Job Manager Workspace</h1>
        <p className="text-xs text-secondary/45 mt-0.5">Manage work orders, client locations and accept service calls.</p>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-xs text-secondary/40">Syncing job registry...</Card>
      ) : jobs.length === 0 ? (
        <Card glass={true} className="p-12 text-center flex flex-col items-center justify-center gap-3 text-secondary/50">
          <FiBriefcase size={32} className="text-secondary/20 animate-pulse" />
          <div>
            <h4 className="text-sm font-bold text-secondary">No Assigned Jobs</h4>
            <p className="text-xs text-secondary/40 mt-0.5">Set visibility to Online to receive client requests.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card 
              key={job.id} 
              hoverable={false}
              className={`p-5 bg-white border-secondary/5 border-l-4 ${
                job.status === 'pending' ? 'border-l-warning' :
                job.status === 'accepted' ? 'border-l-primary' : 'border-l-accent'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={job.status === 'pending' ? 'warning' : job.status === 'accepted' ? 'primary' : 'success'} size="sm">
                      {job.status}
                    </Badge>
                    <span className="text-[10px] text-secondary/40 font-bold uppercase tracking-wider">{job.date} at {job.time}</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-secondary">{job.customerName}</h3>
                  <p className="text-xs text-secondary/60 leading-snug">{job.description}</p>
                  <p className="text-[10px] text-secondary/45 flex items-center gap-1">
                    <FiMapPin size={11} /> {job.location} • ESCROW value: ₦{job.price.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => navigate('/artisan/messages')} className="!px-3 flex items-center gap-1">
                    <FiMessageSquare size={13} /> Message Client
                  </Button>

                  {job.status === 'pending' && (
                    <React.Fragment>
                      <Button variant="outline" size="sm" onClick={() => handleDeclineJob(job.id)} className="!text-danger border-danger/10 hover:bg-danger/5">
                        Decline
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => handleAcceptJob(job.id)}>
                        Accept Job
                      </Button>
                    </React.Fragment>
                  )}

                  {job.status === 'accepted' && (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => handleCompleteJob(job)}
                      className="bg-accent hover:bg-accent-hover"
                    >
                      Submit Verification
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Jobs;
