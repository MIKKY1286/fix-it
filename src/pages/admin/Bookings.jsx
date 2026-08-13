import React, { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { FiCalendar, FiMapPin, FiRefreshCw, FiDollarSign, FiFileText } from 'react-icons/fi';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'bookings'));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      setBookings(list);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Stats Calculations
  const totalCount = bookings.length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const activeCount = bookings.filter(b => b.status === 'accepted' || b.status === 'pending').length;
  const escrowSum = bookings
    .filter(b => b.status === 'accepted' || b.status === 'pending')
    .reduce((sum, b) => sum + (b.price || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-secondary">Global Bookings Registry</h1>
          <p className="text-xs text-secondary/45 mt-0.5">Audit transaction schedules, active job states, and escrow releases.</p>
        </div>
        <button 
          onClick={fetchBookings}
          className="text-xs font-semibold text-primary flex items-center gap-1.5 hover:underline cursor-pointer bg-white px-3 py-2 border border-secondary/5 rounded-xl shadow-sm"
        >
          <FiRefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Sync Bookings
        </button>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card.Stat
          title="Total Bookings"
          value={totalCount}
          icon={<FiFileText size={20} />}
          change="Platform-wide count"
          changeType="neutral"
        />
        <Card.Stat
          title="Active Escrows"
          value={activeCount}
          icon={<FiDollarSign size={20} className="text-warning" />}
          change="Jobs in progress"
          changeType="neutral"
        />
        <Card.Stat
          title="Completed Jobs"
          value={completedCount}
          icon={<FiCalendar size={20} className="text-accent" />}
          change="Successfully closed"
          changeType="neutral"
        />
        <Card.Stat
          title="Escrow Volume Held"
          value={`₦${escrowSum.toLocaleString()}`}
          icon={<FiDollarSign size={20} className="text-primary" />}
          change="Safeguarded funds"
          changeType="neutral"
        />
      </div>

      {/* Bookings Feed */}
      {loading ? (
        <Card className="p-12 text-center text-xs text-secondary/40">
          <FiRefreshCw className="animate-spin mx-auto mb-2 text-primary" size={20} />
          Syncing database bookings...
        </Card>
      ) : bookings.length === 0 ? (
        <Card glass={true} className="p-12 text-center text-secondary/40 text-xs">
          No bookings logged on the platform registry.
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} hoverable={false} className="p-5 bg-white border-secondary/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={booking.status === 'pending' ? 'warning' : booking.status === 'accepted' ? 'primary' : 'success'} size="sm">
                    {booking.status}
                  </Badge>
                  <span className="text-[10px] text-secondary/45 font-bold uppercase">{booking.date} at {booking.time}</span>
                </div>
                <h4 className="text-sm font-extrabold text-secondary">
                  Customer: <span className="font-medium">{booking.customerName}</span> • Artisan: <span className="font-medium">{booking.artisanName}</span>
                </h4>
                <p className="text-xs text-secondary/60 leading-snug">{booking.description}</p>
                <p className="text-[10px] text-secondary/45 flex items-center gap-1.5 pt-1">
                  <FiMapPin size={11} className="text-primary" /> {booking.location} • <span className="font-bold text-secondary">Escrow Amount: ₦{booking.price ? booking.price.toLocaleString() : '0'}</span>
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;
