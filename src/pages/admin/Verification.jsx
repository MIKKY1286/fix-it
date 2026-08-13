import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { FiCheckSquare, FiFolder, FiCheck, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';

const Verification = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudit, setSelectedAudit] = useState(null);

  const fetchVerificationQueue = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'verifications'));
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      setQueue(list);
    } catch (err) {
      console.error('Error fetching verifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationQueue();
  }, []);

  const handleApprove = async (item) => {
    try {
      // 1. Update verification ticket in Firestore
      const verificationRef = doc(db, 'verifications', item.id);
      await updateDoc(verificationRef, { status: 'approved' });

      // 2. If the verification ticket points to a registered user, update them in the users collection
      if (item.uid) {
        const userRef = doc(db, 'users', item.uid);
        // We write a soft try-update in case the user does not exist in the database (mock data case)
        try {
          await updateDoc(userRef, { isVerified: true });
        } catch (e) {
          console.warn(`Could not update user ${item.uid} verification status:`, e);
        }
      }

      setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'approved' } : q));
      setSelectedAudit(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecline = async (id) => {
    try {
      const docRef = doc(db, 'verifications', id);
      await deleteDoc(docRef);
      setQueue(prev => prev.filter(q => q.id !== id));
      setSelectedAudit(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Calculations
  const pendingCount = queue.filter(q => q.status === 'pending').length;
  const approvedCount = queue.filter(q => q.status === 'approved').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-secondary">Artisan Verification Queue</h1>
          <p className="text-xs text-secondary/45 mt-0.5">Audit trade certifications, CAC profiles, and NIN database matches.</p>
        </div>
        <button 
          onClick={fetchVerificationQueue}
          className="text-xs font-semibold text-primary flex items-center gap-1.5 hover:underline cursor-pointer bg-white px-3.5 py-2 border border-secondary/5 rounded-xl shadow-sm"
        >
          <FiRefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Sync Queue
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card.Stat
          title="Pending Audits"
          value={pendingCount}
          icon={<FiAlertTriangle size={20} className="text-warning" />}
          change="Awaiting document audit"
          changeType="neutral"
        />
        <Card.Stat
          title="Approved Accounts"
          value={approvedCount}
          icon={<FiCheckSquare size={20} className="text-accent" />}
          change="Registered verifications"
          changeType="neutral"
        />
        <Card.Stat
          title="Total Audits Logged"
          value={queue.length}
          icon={<FiCheckSquare size={20} />}
          change="Historical ticket base"
          changeType="neutral"
        />
      </div>

      {/* Queue Feed */}
      {loading ? (
        <Card className="p-12 text-center text-xs text-secondary/40">
          <FiRefreshCw className="animate-spin mx-auto mb-2 text-primary" size={20} />
          Querying credentials directory...
        </Card>
      ) : queue.length === 0 ? (
        <Card glass={true} className="p-12 text-center text-secondary/40 text-xs">
          No verification logs found.
        </Card>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => (
            <Card 
              key={item.id} 
              hoverable={false}
              className={`p-5 bg-white border-secondary/5 border-l-4 ${item.status === 'approved' ? 'border-l-accent' : 'border-l-warning'}`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={item.status === 'approved' ? 'success' : 'warning'} size="sm">
                      {item.status}
                    </Badge>
                    <span className="text-[10px] text-secondary/45 font-bold uppercase">{item.date}</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-secondary">{item.name}</h3>
                  <p className="text-xs text-primary font-semibold">{item.category} • {item.location}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status === 'pending' ? (
                    <React.Fragment>
                      <Button variant="outline" size="sm" onClick={() => setSelectedAudit(item)} className="!py-1.5">
                        Review Docs
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => handleApprove(item)} className="!py-1.5">
                        Approve
                      </Button>
                    </React.Fragment>
                  ) : (
                    <Badge variant="success">Verification Registered</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Docs Modal */}
      <Modal
        isOpen={!!selectedAudit}
        onClose={() => setSelectedAudit(null)}
        title={selectedAudit ? `Audit Documents: ${selectedAudit.name}` : ''}
        size="md"
      >
        {selectedAudit && (
          <div className="space-y-5">
            <div className="p-4 bg-secondary/5 rounded-2xl space-y-1 text-xs text-secondary/60">
              <p>• Specialist: <span className="font-bold text-secondary">{selectedAudit.name}</span></p>
              <p>• Specialty Field: <span className="font-bold text-secondary">{selectedAudit.category}</span></p>
              <p>• Sector Location: <span className="font-bold text-secondary">{selectedAudit.location}</span></p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-secondary/50 uppercase font-headings">Trade Credentials List</label>
              <div className="p-4 bg-slate-50 rounded-2xl border border-secondary/5 text-xs text-secondary/70 leading-relaxed flex items-start gap-2.5">
                <FiFolder className="text-primary shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="font-bold">{selectedAudit.certName || 'NIN / CAC Package.zip'}</p>
                  <p className="text-secondary/40 text-[10px] mt-0.5">{selectedAudit.doc}</p>
                </div>
              </div>
            </div>

            {/* Verification match success mockup banner */}
            <div className="p-4 border border-accent/20 bg-accent-light/10 text-accent text-xs rounded-xl flex items-center gap-2">
              <FiCheck className="shrink-0" size={16} />
              <span>National identity registry background matches check successfully.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-secondary/5">
              <Button variant="outline" onClick={() => handleDecline(selectedAudit.id)} className="!text-danger border-danger/10 hover:bg-danger/5">
                Flag Mismatches
              </Button>
              <Button variant="primary" onClick={() => handleApprove(selectedAudit)}>
                Approve & Register Verification
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Verification;
