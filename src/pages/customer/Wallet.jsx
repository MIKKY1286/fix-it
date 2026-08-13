import React, { useState, useEffect, useCallback } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/authContextValue';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { FiCreditCard, FiArrowUpRight, FiRefreshCw } from 'react-icons/fi';

const Wallet = () => {
  const { currentUser, userProfile, updateProfile } = useAuth();
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  // Fetch transaction history
  const fetchTransactions = useCallback(async () => {
    if (!currentUser) return;
    try {
      const q = query(collection(db, 'transactions'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      // Sort desc by date
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTransactions(list);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoadingTransactions(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Paystack Configurations
  const paystackConfig = {
    reference: `tx-${(new Date()).getTime()}-${Math.random().toString(36).substring(2, 6)}`,
    email: currentUser?.email || 'customer@fixit.com',
    amount: parseFloat(amount || 0) * 100, // NGN to kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_mockkey1234567890',
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const onSuccess = async (reference) => {
    const depositValue = parseFloat(amount);
    const newBalance = (userProfile?.walletBalance || 0) + depositValue;
    
    try {
      // 1. Update Profile Balance in Firestore
      await updateProfile({ walletBalance: newBalance });

      // 2. Log transaction in Firestore
      await addDoc(collection(db, 'transactions'), {
        userId: currentUser.uid,
        type: 'deposit',
        amount: depositValue,
        desc: `Paystack Deposit (Ref: ${reference.reference})`,
        status: 'success',
        createdAt: new Date().toISOString()
      });

      setAmount('');
      fetchTransactions();
    } catch (err) {
      console.error('Error updating deposit database records:', err);
    }
  };

  const onClose = () => {
    console.log('Payment modal closed');
  };

  const handleDepositClick = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return;
    initializePayment({ onSuccess, onClose });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-secondary">My Financial Wallet</h1>
        <p className="text-xs text-secondary/45 mt-0.5">Top up escrow balances and track payment ledgers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Balance & Deposit Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 bg-secondary text-white border-none shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent" />
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Available Balance</span>
                <FiCreditCard size={20} className="text-primary animate-float" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                ₦{(userProfile?.walletBalance || 0).toLocaleString()}
              </h2>
              <div className="pt-2 flex justify-between items-center text-[10px] text-white/40 uppercase">
                <span>Currency: NGN</span>
                <span>SECURED ESCROW CUSTODY</span>
              </div>
            </div>
          </Card>

          {/* Deposit Widget */}
          <Card hoverable={false} className="p-6 bg-white border-secondary/5 space-y-4">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest pb-3 border-b border-secondary/5">
              Add Funds via Paystack
            </h3>
            
            <form onSubmit={handleDepositClick} className="space-y-4">
              <Input 
                label="Amount (NGN)"
                type="number"
                placeholder="e.g. 15000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full flex items-center justify-center gap-1.5 font-bold py-3.5"
                disabled={!amount}
              >
                Deposit Instantly <FiArrowUpRight />
              </Button>
            </form>
          </Card>
        </div>

        {/* Right: Ledger Logs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Transaction Ledger</h3>
            <button 
              onClick={fetchTransactions}
              className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline cursor-pointer"
            >
              <FiRefreshCw size={12} /> Refresh
            </button>
          </div>

          <Card hoverable={false} className="bg-white border-secondary/5 overflow-hidden">
            {loadingTransactions ? (
              <p className="text-xs text-secondary/40 text-center py-8">Auditing transactions history...</p>
            ) : transactions.length === 0 ? (
              <p className="text-xs text-secondary/40 text-center py-12">No transaction history found for your account.</p>
            ) : (
              <div className="divide-y divide-secondary/5 text-xs">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors duration-150">
                    <div>
                      <p className="font-bold text-secondary">{tx.desc}</p>
                      <p className="text-[10px] text-secondary/40 mt-1">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`font-extrabold ${tx.type === 'deposit' || tx.type === 'refund' || tx.type === 'disbursed' ? 'text-accent' : 'text-danger'}`}>
                        {tx.type === 'deposit' || tx.type === 'refund' || tx.type === 'disbursed' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                      </span>
                      <p className="text-[9px] uppercase font-bold text-secondary/40 mt-0.5">{tx.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Wallet;
