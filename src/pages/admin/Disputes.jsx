import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { FiAlertTriangle, FiRefreshCw, FiCheck } from 'react-icons/fi';

const Disputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'disputes'));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      setDisputes(list);
    } catch (err) {
      console.error('Error fetching disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolveDispute = async (id, outcome) => {
    try {
      const docRef = doc(db, 'disputes', id);
      await updateDoc(docRef, { status: 'resolved', resolutionOutcome: outcome });
      setDisputes(prev => prev.map(d => d.id === id ? { ...d, status: 'resolved', resolutionOutcome: outcome } : d));
    } catch (err) {
      console.error(err);
    }
  };

  // Stats
  const activeCount = disputes.filter(d => d.status !== 'resolved').length;
  const resolvedCount = disputes.filter(d => d.status === 'resolved').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-secondary">Disputes & Incident Reports</h1>
          <p className="text-xs text-secondary/45 mt-0.5">Arbitrate escrow holds, review service descriptions, and manage platform refunds.</p>
        </div>
        <button 
          onClick={fetchDisputes}
          className="text-xs font-semibold text-primary flex items-center gap-1.5 hover:underline cursor-pointer bg-white px-3 py-2 border border-secondary/5 rounded-xl shadow-sm"
        >
          <FiRefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Sync Disputes
        </button>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card.Stat
          title="Active Tickets"
          value={activeCount}
          icon={<FiAlertTriangle size={20} className="text-danger" />}
          change="Escrows held on arbitration"
          changeType="neutral"
        />
        <Card.Stat
          title="Resolved Disputes"
          value={resolvedCount}
          icon={<FiCheck size={20} className="text-accent" />}
          change="Platform resolutions complete"
          changeType="neutral"
        />
        <Card.Stat
          title="Total disputes logged"
          value={disputes.length}
          icon={<FiAlertTriangle size={20} />}
          change="Platform incident history"
          changeType="neutral"
        />
      </div>

      {/* Disputes logs list */}
      {loading ? (
        <Card className="p-12 text-center text-xs text-secondary/40">
          <FiRefreshCw className="animate-spin mx-auto mb-2 text-primary" size={20} />
          Syncing platform disputes...
        </Card>
      ) : disputes.length === 0 ? (
        <Card glass={true} className="p-12 text-center text-secondary/40 text-xs">
          No disputes logged in the support records.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {disputes.map((dispute) => (
            <Card 
              key={dispute.id} 
              hoverable={false} 
              className={`p-6 bg-white border-secondary/5 border-l-4 ${dispute.status === 'resolved' ? 'border-l-accent' : 'border-l-danger'}`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-secondary/45 font-bold uppercase">{dispute.date}</span>
                    <h3 className="text-sm font-extrabold text-secondary">Ticket #{dispute.ticketId || dispute.id.substring(0, 6).toUpperCase()}</h3>
                  </div>
                  <Badge variant={dispute.status === 'resolved' ? 'success' : 'danger'} size="sm">
                    {dispute.status}
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs text-secondary/60 bg-slate-50 p-4 rounded-xl border border-secondary/5">
                  <p>• Client: <span className="font-semibold text-secondary">{dispute.client}</span></p>
                  <p>• Artisan: <span className="font-semibold text-secondary">{dispute.artisan}</span></p>
                  <p>• Escrow Amount: <span className="font-bold text-secondary">₦{dispute.amount.toLocaleString()}</span></p>
                  <p className="mt-2 text-[11px] leading-relaxed border-t border-secondary/5 pt-2 text-secondary/70">
                    <span className="font-bold block mb-0.5 uppercase text-[9px] text-secondary/40">Complaint:</span>
                    "{dispute.issue}"
                  </p>
                </div>

                {dispute.status !== 'resolved' ? (
                  <div className="flex gap-2 pt-2 border-t border-secondary/5">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleResolveDispute(dispute.id, 'refund_client')} 
                      className="w-full !py-1.5 text-danger border-danger/10 hover:bg-danger/5"
                    >
                      Refund Client
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => handleResolveDispute(dispute.id, 'release_to_artisan')} 
                      className="w-full !py-1.5 bg-accent hover:bg-accent-hover"
                    >
                      Release to Artisan
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 bg-secondary/5 text-[11px] rounded-xl text-secondary/50 font-semibold flex items-center gap-1.5">
                    <FiCheck className="text-accent" />
                    <span>Resolution outcome: <span className="font-bold text-secondary">{dispute.resolutionOutcome === 'refund_client' ? 'Refunded Client' : 'Disbursed to Artisan'}</span></span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Disputes;
