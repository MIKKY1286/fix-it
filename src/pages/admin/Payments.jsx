import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { FiRefreshCw, FiArrowUpRight, FiArrowDownLeft, FiClock, FiActivity } from 'react-icons/fi';

const Payments = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'transactions'));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      setTransactions(list);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleUpdateStatus = async (txId, newStatus) => {
    try {
      const docRef = doc(db, 'transactions', txId);
      await updateDoc(docRef, { status: newStatus });
      setTransactions(prev => prev.map(tx => tx.id === txId ? { ...tx, status: newStatus } : tx));
    } catch (err) {
      console.error(err);
    }
  };

  // Stats
  const totalVolume = transactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  const totalCommissions = transactions
    .filter(tx => tx.status === 'disbursed')
    .reduce((sum, tx) => sum + (Number(tx.commission) || 0), 0);
  const activeEscrow = transactions
    .filter(tx => tx.status === 'held')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  const disbursedPayouts = transactions
    .filter(tx => tx.status === 'disbursed')
    .reduce((sum, tx) => sum + (Number(tx.payout) || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-secondary">Payments & Payouts Registry</h1>
          <p className="text-xs text-secondary/45 mt-0.5">Audit escrow funding cycles, disburse artisan wallets, and review service fee splits.</p>
        </div>
        <button 
          onClick={fetchTransactions}
          className="text-xs font-semibold text-primary flex items-center gap-1.5 hover:underline cursor-pointer bg-white px-3 py-2 border border-secondary/5 rounded-xl shadow-sm"
        >
          <FiRefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Sync Ledger
        </button>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card.Stat
          title="Total Ledger Volume"
          value={`₦${totalVolume.toLocaleString()}`}
          icon={<FiActivity size={20} />}
          change="Accumulated charges"
          changeType="neutral"
        />
        <Card.Stat
          title="Escrow Balance"
          value={`₦${activeEscrow.toLocaleString()}`}
          icon={<FiClock size={20} className="text-warning" />}
          change="Held payments in platform"
          changeType="neutral"
        />
        <Card.Stat
          title="Platform Commissions"
          value={`₦${totalCommissions.toLocaleString()}`}
          icon={<FiArrowUpRight size={20} className="text-accent" />}
          change="10% service cuts accrued"
          changeType="neutral"
        />
        <Card.Stat
          title="Disbursed Wallet Balances"
          value={`₦${disbursedPayouts.toLocaleString()}`}
          icon={<FiArrowDownLeft size={20} className="text-blue-500" />}
          change="Paid out to artisans"
          changeType="neutral"
        />
      </div>

      {/* Transactions Register */}
      {loading ? (
        <Card className="p-12 text-center text-xs text-secondary/40">
          <FiRefreshCw className="animate-spin mx-auto mb-2 text-primary" size={20} />
          Fetching payment registry...
        </Card>
      ) : transactions.length === 0 ? (
        <Card glass={true} className="p-12 text-center text-secondary/40 text-xs">
          No transaction entries logged.
        </Card>
      ) : (
        <Card hoverable={false} className="overflow-x-auto bg-white border-secondary/5">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-secondary/5 bg-secondary/[0.01]">
                <th className="px-6 py-4 text-[10px] font-bold text-secondary/50 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary/50 uppercase tracking-wider">Clients</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary/50 uppercase tracking-wider">Gross Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary/50 uppercase tracking-wider">Platform cut</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary/50 uppercase tracking-wider">Net Payout</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary/50 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary/50 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/5 text-xs text-secondary/70">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                  <td className="px-6 py-4 font-semibold text-secondary">{tx.date}</td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-secondary">Customer: {tx.customerName || tx.desc || 'Ledger entry'}</p>
                      <p className="text-[10px] text-secondary/40">Artisan: {tx.artisanName || tx.userId || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-secondary">₦{(Number(tx.amount) || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-secondary/60">₦{(Number(tx.commission) || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-accent font-bold">₦{(Number(tx.payout) || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <Badge variant={tx.status === 'disbursed' ? 'success' : tx.status === 'refunded' ? 'danger' : 'warning'} size="sm">
                      {tx.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {tx.status === 'held' ? (
                      <React.Fragment>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUpdateStatus(tx.id, 'refunded')}
                          className="!py-1 !text-danger border-danger/10 hover:bg-danger/5"
                        >
                          Refund Client
                        </Button>
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleUpdateStatus(tx.id, 'disbursed')}
                          className="!py-1"
                        >
                          Disburse Artisan
                        </Button>
                      </React.Fragment>
                    ) : (
                      <span className="text-[10px] text-secondary/40 font-bold uppercase">Closed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default Payments;
