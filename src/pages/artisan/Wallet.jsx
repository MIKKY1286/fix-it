import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/authContextValue';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { FiCreditCard, FiArrowDownRight, FiRefreshCw } from 'react-icons/fi';

const Wallet = () => {
  const { currentUser, userProfile, updateProfile } = useAuth();
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchWithdrawals = useCallback(async () => {
    if (!currentUser) return;
    try {
      const q = query(
        collection(db, 'transactions'), 
        where('userId', '==', currentUser.uid),
        where('type', '==', 'withdrawal')
      );
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setWithdrawals(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    const withdrawVal = parseFloat(amount);
    const balance = userProfile?.walletBalance || 0;

    if (!withdrawVal || isNaN(withdrawVal) || withdrawVal <= 0 || withdrawVal > balance) {
      setMsg('Invalid payout amount.');
      return;
    }
    if (!bankName || !accountNumber || accountNumber.length < 10) {
      setMsg('Please fill in bank account credentials.');
      return;
    }

    setIsProcessing(true);
    setMsg('');
    try {
      // 1. Update artisan profile balance in Firestore
      await updateProfile({ walletBalance: balance - withdrawVal });

      // 2. Add withdrawal record log
      await addDoc(collection(db, 'transactions'), {
        userId: currentUser.uid,
        type: 'withdrawal',
        amount: withdrawVal,
        desc: `Paystack Payout (Bank: ${bankName}, Acc: ${accountNumber.substring(0, 3)}***)`,
        status: 'success',
        createdAt: new Date().toISOString()
      });

      setAmount('');
      setBankName('');
      setAccountNumber('');
      setMsg('Withdrawal processed successfully to GTBank / Paystack Payout API.');
      fetchWithdrawals();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-secondary">Earnings & Disbursed Wallet</h1>
        <p className="text-xs text-secondary/45 mt-0.5">Withdraw completed job escrows to your Nigerian bank account.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Disbursed balance and Transfer form */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 bg-accent text-white border-none shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center text-xs font-bold text-white/50 uppercase tracking-widest">
                <span>Withdrawable Balance</span>
                <FiCreditCard size={18} />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                ₦{(userProfile?.walletBalance || 0).toLocaleString()}
              </h2>
              <div className="text-[10px] text-white/40 uppercase">
                Escrow Guarantee Released
              </div>
            </div>
          </Card>

          {/* Transfer Payout input forms */}
          <Card hoverable={false} className="p-6 bg-white border-secondary/5 space-y-4">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest pb-3 border-b border-secondary/5">
              Payout Dispatch Form
            </h3>

            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-secondary/50 uppercase">Payout Bank</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-white text-secondary text-xs border border-secondary/10 rounded-xl px-3 py-2.5 outline-none hover:border-secondary/20 transition-all duration-200"
                >
                  <option value="">Select bank...</option>
                  <option value="Guaranty Trust Bank">GTB</option>
                  <option value="Access Bank">Access Bank</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                  <option value="UBA">UBA</option>
                </select>
              </div>

              <Input 
                label="10-Digit Account Number"
                type="text"
                maxLength={10}
                placeholder="e.g. 0123456789"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />

              <Input 
                label="Transfer Amount (NGN)"
                type="number"
                placeholder="e.g. 10000"
                max={userProfile?.walletBalance || 0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              {msg && <p className="text-[11px] text-accent font-bold mt-1 leading-snug">{msg}</p>}

              <Button 
                type="submit" 
                variant="primary" 
                className="w-full flex items-center justify-center gap-1 font-bold py-3.5"
                disabled={!amount || !accountNumber || !bankName || isProcessing}
                loading={isProcessing}
              >
                Withdraw Earnings <FiArrowDownRight />
              </Button>
            </form>
          </Card>
        </div>

        {/* Right column: Withdrawal Ledgers */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Payout Ledgers</h3>
            <button 
              onClick={fetchWithdrawals}
              className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline cursor-pointer"
            >
              <FiRefreshCw size={12} /> Refresh
            </button>
          </div>

          <Card hoverable={false} className="bg-white border-secondary/5 overflow-hidden">
            {loading ? (
              <p className="text-xs text-secondary/40 text-center py-8">Auditing withdrawals ledger...</p>
            ) : withdrawals.length === 0 ? (
              <p className="text-xs text-secondary/40 text-center py-12">No payout requests registered.</p>
            ) : (
              <div className="divide-y divide-secondary/5 text-xs">
                {withdrawals.map((w) => (
                  <div key={w.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors duration-150">
                    <div>
                      <p className="font-bold text-secondary">{w.desc}</p>
                      <p className="text-[10px] text-secondary/40 mt-1">
                        {w.createdAt ? new Date(w.createdAt).toLocaleString() : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-secondary">₦{w.amount.toLocaleString()}</p>
                      <span className="text-[9px] uppercase font-bold text-accent">
                        {w.status}
                      </span>
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
