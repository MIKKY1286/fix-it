import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { FiUsers, FiUserCheck, FiShield, FiRefreshCw, FiSearch, FiTrash2 } from 'react-icons/fi';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setUsers(list);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleVerification = async (userId, currentVal) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { isVerified: !currentVal });
      // Update state locally to avoid full loading state redraw
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: !currentVal } : u));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user profile?')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  // Calculations for Stats
  const totalCount = users.length;
  const artisanCount = users.filter(u => u.role === 'artisan').length;
  const customerCount = users.filter(u => u.role === 'customer').length;
  const verifiedArtisans = users.filter(u => u.role === 'artisan' && u.isVerified).length;

  // Search & Filter execution
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    
    const matchesVerified = 
      verifiedFilter === 'all' || 
      (verifiedFilter === 'verified' && u.isVerified) || 
      (verifiedFilter === 'unverified' && !u.isVerified);

    return matchesSearch && matchesRole && matchesVerified;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-secondary">User Accounts Manager</h1>
          <p className="text-xs text-secondary/45 mt-0.5">Audit user roles, verification credentials, and registry profiles.</p>
        </div>
        <button 
          onClick={fetchUsers}
          className="text-xs font-semibold text-primary flex items-center gap-1.5 hover:underline cursor-pointer bg-white px-3.5 py-2 border border-secondary/5 rounded-xl shadow-sm hover:bg-slate-50 transition-all duration-200"
        >
          <FiRefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Sync Registry
        </button>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card.Stat
          title="Total Users"
          value={totalCount}
          icon={<FiUsers size={20} />}
          change={`${customerCount} Customers`}
          changeType="neutral"
        />
        <Card.Stat
          title="Active Artisans"
          value={artisanCount}
          icon={<FiUserCheck size={20} className="text-accent" />}
          change={`${verifiedArtisans} Fully Verified`}
          changeType="increase"
        />
        <Card.Stat
          title="Total Customers"
          value={customerCount}
          icon={<FiUsers size={20} className="text-primary" />}
          change="Regular users"
          changeType="neutral"
        />
        <Card.Stat
          title="Verified Ratio"
          value={artisanCount > 0 ? `${Math.round((verifiedArtisans / artisanCount) * 100)}%` : '0%'}
          icon={<FiShield size={20} className="text-purple-500" />}
          change="Vetted artisan base"
          changeType="neutral"
        />
      </div>

      {/* Filter and Search Box */}
      <Card hoverable={false} className="p-4 bg-white border-secondary/5">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/45" size={15} />
            <input 
              type="text" 
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 text-secondary text-xs border border-secondary/5 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:bg-white focus:border-primary transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {/* Role Select */}
            <div className="flex items-center gap-1.5 text-xs text-secondary/50 w-full sm:w-auto">
              <span>Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-50 border border-secondary/5 rounded-xl px-3 py-2 outline-none text-secondary font-bold text-xs"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customer</option>
                <option value="artisan">Artisan</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Verification Select */}
            <div className="flex items-center gap-1.5 text-xs text-secondary/50 w-full sm:w-auto">
              <span>Status:</span>
              <select
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value)}
                className="bg-slate-50 border border-secondary/5 rounded-xl px-3 py-2 outline-none text-secondary font-bold text-xs"
              >
                <option value="all">All Verification</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Unverified Only</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Registry Table */}
      {loading ? (
        <Card className="p-12 text-center text-xs text-secondary/40">
          <FiRefreshCw className="animate-spin mx-auto mb-2 text-primary" size={20} />
          Querying platform registry...
        </Card>
      ) : filteredUsers.length === 0 ? (
        <Card glass={true} className="p-12 text-center text-secondary/40 text-xs">
          No registered user profiles found matching the query.
        </Card>
      ) : (
        <Card hoverable={false} className="overflow-x-auto bg-white border-secondary/5">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-secondary/5 bg-secondary/[0.01]">
                <th className="px-6 py-4 text-[10px] font-bold text-secondary/50 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary/50 uppercase tracking-wider">Email Address</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary/50 uppercase tracking-wider">Account Role</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary/50 uppercase tracking-wider">Verified status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary/50 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/5 text-xs text-secondary/70">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-secondary/5 text-secondary flex items-center justify-center font-bold text-xs">
                        {u.avatarText || u.name?.substring(0,2).toUpperCase() || 'U'}
                      </div>
                      <span className="font-extrabold text-secondary">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">
                    <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'artisan' ? 'success' : 'secondary'} size="sm">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggleVerification(u.id, u.isVerified)}
                      className="focus:outline-none cursor-pointer"
                    >
                      <Badge variant={u.isVerified ? 'success' : 'neutral'} size="sm">
                        {u.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleVerification(u.id, u.isVerified)}
                      className="!py-1"
                    >
                      Toggle Verify
                    </Button>
                    <button 
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1.5 rounded-lg hover:bg-danger/5 text-secondary/40 hover:text-danger inline-flex align-middle cursor-pointer"
                    >
                      <FiTrash2 size={14} />
                    </button>
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

export default Users;
