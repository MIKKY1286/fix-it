import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { FiUsers, FiCheckSquare, FiDollarSign, FiAlertTriangle, FiPlus, FiFolder, FiCheck } from 'react-icons/fi';

const AdminDashboard = () => {
  const [verifications, setVerifications] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Modal control states
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryParent, setNewCategoryParent] = useState('Home Services');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [usersSnap, verificationSnap, categorySnap, disputeSnap, txSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'verifications')),
          getDocs(collection(db, 'categories')),
          getDocs(collection(db, 'disputes')),
          getDocs(collection(db, 'transactions'))
        ]);

        setUsers(usersSnap.docs.map((item) => ({ id: item.id, ...item.data() })));
        setVerifications(verificationSnap.docs.map((item) => ({ id: item.id, ...item.data() })));
        setCategoriesList(categorySnap.docs.map((item) => ({ id: item.id, ...item.data() })));
        setDisputes(disputeSnap.docs.map((item) => ({ id: item.id, ...item.data() })));
        setTransactions(txSnap.docs.map((item) => ({ id: item.id, ...item.data() })));
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      }
    };

    fetchDashboardData();
  }, []);

  // Verify action handlers
  const handleViewDocs = (item) => {
    setSelectedVerification(item);
  };

  const handleApproveVerification = async (id) => {
    try {
      const verification = verifications.find((item) => item.id === id);
      await updateDoc(doc(db, 'verifications', id), { status: 'approved' });
      if (verification?.uid) {
        try {
          await updateDoc(doc(db, 'users', verification.uid), { isVerified: true });
        } catch (err) {
          console.warn(`Could not update user ${verification.uid}:`, err);
        }
      }
    } catch (err) {
      console.error('Error approving verification:', err);
      return;
    }
    setVerifications(prev => prev.map(v => 
      v.id === id ? { ...v, status: 'approved' } : v
    ));
    setSelectedVerification(null);
  };

  const handleRejectVerification = async (id) => {
    try {
      await deleteDoc(doc(db, 'verifications', id));
    } catch (err) {
      console.error('Error rejecting verification:', err);
      return;
    }
    setVerifications(prev => prev.filter(v => v.id !== id));
    setSelectedVerification(null);
  };

  // Category addition handler
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName) return;
    const cleanId = newCategoryName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCategory = { id: cleanId, name: newCategoryName, parent: newCategoryParent, count: 0 };
    try {
      await setDoc(doc(db, 'categories', cleanId), newCategory);
    } catch (err) {
      console.error('Error creating category:', err);
      return;
    }
    setCategoriesList([
      ...categoriesList,
      newCategory
    ]);
    setNewCategoryName('');
    setIsCategoryOpen(false);
  };

  // Resolve disputes
  const handleResolveDispute = async (id) => {
    try {
      await updateDoc(doc(db, 'disputes', id), { status: 'resolved' });
    } catch (err) {
      console.error('Error resolving dispute:', err);
      return;
    }
    setDisputes(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'resolved' } : d
    ));
  };

  const escrowTotal = transactions
    .filter((tx) => tx.type === 'escrow' || tx.status === 'held')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  return (
    <div className="space-y-8">
      
      {/* Dynamic Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-secondary">
          System Admin <span className="text-primary">Control Desk</span>
        </h1>
        <p className="text-xs text-secondary/45 mt-1">Platform Operations statistics • ESCROW Settlement Engine</p>
      </div>

      {/* Global Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card.Stat
          title="Platform Users"
          value={users.length.toString()}
          icon={<FiUsers size={20} />}
          change={`${users.filter((user) => user.role === 'artisan').length} artisans`}
          changeType="increase"
        />
        <Card.Stat
          title="Verifications Queue"
          value={verifications.filter(v => v.status === 'pending').length.toString()}
          icon={<FiCheckSquare size={20} />}
          change="Trades document validation"
          changeType="neutral"
        />
        <Card.Stat
          title="Platform Ledger Escrow"
          value={`₦${escrowTotal.toLocaleString()}`}
          icon={<FiDollarSign size={20} />}
          change="+18.4% growth"
          changeType="increase"
        />
        <Card.Stat
          title="Active Disputes"
          value={disputes.filter(d => d.status !== 'resolved').length.toString()}
          icon={<FiAlertTriangle size={20} />}
          change="ESCROW hold arbitrations"
          changeType="neutral"
        />
      </div>

      {/* Verification table and dispute managers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Verification Queue Board */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Artisan Credentials queue</h3>

          <Card hoverable={false} className="overflow-x-auto bg-white border-secondary/5">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-secondary/5 bg-secondary/[0.01]">
                  <th className="px-6 py-4 text-xs font-bold text-secondary/50 uppercase tracking-wider">Artisan</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary/50 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary/50 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary/50 tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/5 text-xs">
                {verifications.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-secondary/40 font-medium">
                      All artisan credentials queues are validated and clear.
                    </td>
                  </tr>
                ) : (
                  verifications.map((v) => (
                    <tr key={v.id} className="hover:bg-secondary/[0.01] transition-colors duration-150">
                      <td className="px-6 py-4 font-bold text-secondary">{v.name}</td>
                      <td className="px-6 py-4">
                        <Badge variant="primary" size="sm">{v.category}</Badge>
                      </td>
                      <td className="px-6 py-4 text-secondary/60">{v.location}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {v.status === 'pending' ? (
                          <React.Fragment>
                            <Button variant="outline" size="sm" onClick={() => handleViewDocs(v)} className="!px-3 !py-1">
                              View Docs
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => handleApproveVerification(v.id)} className="!px-3 !py-1">
                              Approve
                            </Button>
                          </React.Fragment>
                        ) : (
                          <Badge variant="success">Approved</Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Dispute resolving table widgets */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Disputes Hub</h3>
          </div>

          <Card hoverable={false} className="p-6 bg-white border-secondary/5 space-y-4">
            <p className="text-xs text-secondary/50 leading-relaxed">Active ESCROW payment conflicts requiring support review.</p>
            <div className="space-y-3">
              {disputes.length === 0 ? (
                <p className="text-xs text-secondary/40 text-center py-6">No backend disputes found.</p>
              ) : disputes.map((dispute) => (
                <div key={dispute.id} className="p-4 rounded-xl border border-secondary/5 bg-slate-50 text-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-secondary">Ticket #{dispute.id}</span>
                    <Badge variant={dispute.status === 'resolved' ? 'success' : 'danger'} size="sm">
                      {dispute.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-secondary/60">
                    <p>• Client: <span className="font-semibold text-secondary">{dispute.client}</span></p>
                    <p>• Artisan: <span className="font-semibold text-secondary">{dispute.artisan}</span></p>
                    <p>• Issue: <span className="font-semibold text-secondary">{dispute.issue}</span></p>
                  </div>
                  {dispute.status !== 'resolved' && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleResolveDispute(dispute.id)} className="w-full !py-1 text-danger border-danger/10 hover:bg-danger/5">
                        Refund Client
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => handleResolveDispute(dispute.id)} className="w-full !py-1 bg-accent hover:bg-accent-hover">
                        Disburse Artisan
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Categories management board */}
      <div className="space-y-4 pt-4 border-t border-secondary/5">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Service Categories Manager</h3>
          <Button variant="primary" size="sm" onClick={() => setIsCategoryOpen(true)} className="flex items-center gap-1">
            <FiPlus /> Add Category
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoriesList.map((cat) => (
            <Card key={cat.id || cat.name} hoverable={true} className="p-5 bg-white border-secondary/5 flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-secondary/50 uppercase tracking-widest">{cat.parent}</h4>
                <p className="text-sm font-extrabold text-secondary">{cat.name}</p>
              </div>
              <Badge variant="primary">{cat.count} Trades</Badge>
            </Card>
          ))}
        </div>
      </div>

      {/* --- MOCK DOCUMENTS VIEW MODAL --- */}
      <Modal
        isOpen={!!selectedVerification}
        onClose={() => setSelectedVerification(null)}
        title={selectedVerification ? `Review Credentials: ${selectedVerification.name}` : ''}
        size="md"
      >
        {selectedVerification && (
          <div className="space-y-5">
            <div className="p-4 bg-secondary/5 rounded-2xl space-y-2 text-xs text-secondary/60">
              <p>• Submission Date: <span className="font-bold text-secondary">{selectedVerification.date}</span></p>
              <p>• Specialty Field: <span className="font-bold text-secondary">{selectedVerification.category}</span></p>
              <p>• Proximity Sector: <span className="font-bold text-secondary">{selectedVerification.location}</span></p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-secondary/50 uppercase">Uploaded Document Certificate</label>
              <div className="p-5 border border-dashed border-secondary/20 rounded-2xl bg-slate-50 flex items-center gap-3">
                <FiFolder className="text-primary" size={24} />
                <div>
                  <p className="text-xs font-bold text-secondary truncate">{selectedVerification.certName}</p>
                  <p className="text-[10px] text-secondary/40">Verified PDF Authority Copy (1.2 MB)</p>
                </div>
              </div>
            </div>

            {/* Background check mockup status */}
            <div className="p-4 border border-accent/20 bg-accent-light/10 text-accent text-xs rounded-xl flex items-center gap-2">
              <FiCheck className="shrink-0" size={16} />
              <span>National ID (NIN) Database check matching successfully. Ready to approve.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-secondary/5">
              <Button variant="outline" onClick={() => handleRejectVerification(selectedVerification.id)} className="!text-danger border-danger/10 hover:bg-danger/5">
                Decline & Flags
              </Button>
              <Button variant="primary" onClick={() => handleApproveVerification(selectedVerification.id)}>
                Approve & Register
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Categories add modal */}
      <Modal
        isOpen={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
        title="Add New Platform Service Category"
        size="sm"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <Input 
            label="Category Name"
            type="text"
            placeholder="e.g. Solar Engineer"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-secondary/50 uppercase">Parent Service Sector</label>
            <select
              value={newCategoryParent}
              onChange={(e) => setNewCategoryParent(e.target.value)}
              className="w-full bg-white text-secondary text-sm border border-secondary/10 rounded-xl px-3 py-2.5 outline-none hover:border-secondary/20 transition-all duration-200"
            >
              <option value="Home Services">Home Services</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Technology">Technology</option>
              <option value="Automobile">Automobile</option>
              <option value="Beauty">Beauty</option>
              <option value="Construction">Construction</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsCategoryOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={!newCategoryName}>
              Add Category
            </Button>
          </div>
        </form>
      </Modal>
      
    </div>
  );
};

export default AdminDashboard;
