import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/authContextValue';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { FiCalendar, FiMapPin, FiMessageSquare, FiStar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Bookings = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Review Modal state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    if (!currentUser) return;
    try {
      const q = query(collection(db, 'bookings'), where('customerId', '==', currentUser.uid));
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
  }, [currentUser]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Complete booking / release escrow
  const handleConfirmCompletion = async (bookingId, artisanId, price) => {
    try {
      // 1. Update booking status
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { status: 'completed' });

      // 2. Create transaction logs for disburse release
      await addDoc(collection(db, 'transactions'), {
        userId: artisanId,
        type: 'disbursed',
        amount: price,
        desc: `Escrow Release - Booking: #${bookingId.substring(0, 5)}`,
        status: 'success',
        createdAt: new Date().toISOString()
      });

      // 3. Increment artisan balance (Simulated payouts adjustment)
      // Fetch current balance
      const snap = await getDocs(query(collection(db, 'users'), where('uid', '==', artisanId)));
      if (!snap.empty) {
        const artisanDoc = snap.docs[0];
        const currentBal = artisanDoc.data().walletBalance || 0;
        await updateDoc(doc(db, 'users', artisanId), {
          walletBalance: currentBal + price
        });
      }

      fetchBookings();
    } catch (err) {
      console.error('Error confirming completion:', err);
    }
  };

  // Submit reviews
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setIsSubmittingReview(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        bookingId: selectedBooking.id,
        artisanId: selectedBooking.artisanId,
        customerName: currentUser.displayName || 'Client User',
        rating,
        comment,
        createdAt: new Date().toISOString()
      });
      setSelectedBooking(null);
      setComment('');
      setRating(5);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-secondary">My Bookings History</h1>
        <p className="text-xs text-secondary/45 mt-0.5">Validate job phases, message contractors, and release escrows.</p>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-xs text-secondary/40">Loading bookings history...</Card>
      ) : bookings.length === 0 ? (
        <Card glass={true} className="p-12 text-center flex flex-col items-center justify-center gap-4">
          <FiCalendar size={32} className="text-secondary/20" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-secondary">No Bookings Yet</h3>
            <p className="text-xs text-secondary/40">Search the platform directory to match professional trades.</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigate('/customer/search')}>
            Find Artisans
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card 
              key={booking.id} 
              hoverable={false}
              className={`p-5 bg-white border-secondary/5 border-l-4 ${
                booking.status === 'pending' ? 'border-l-warning' :
                booking.status === 'accepted' ? 'border-l-primary' : 'border-l-accent'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={booking.status === 'pending' ? 'warning' : booking.status === 'accepted' ? 'primary' : 'success'} size="sm">
                      {booking.status}
                    </Badge>
                    <span className="text-[10px] text-secondary/40 font-bold uppercase">{booking.date} at {booking.time}</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-secondary">{booking.artisanName}</h3>
                  <p className="text-xs text-secondary/60 leading-snug">{booking.description}</p>
                  <p className="text-[10px] text-secondary/45 flex items-center gap-1">
                    <FiMapPin size={11} /> Escrow hold: ₦{booking.price.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => navigate('/customer/messages')} className="!px-3 flex items-center gap-1">
                    <FiMessageSquare size={13} /> Chat
                  </Button>

                  {booking.status === 'accepted' && (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => handleConfirmCompletion(booking.id, booking.artisanId, booking.price)}
                      className="bg-accent hover:bg-accent-hover"
                    >
                      Release Escrow
                    </Button>
                  )}

                  {booking.status === 'completed' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedBooking(booking)}
                      className="!text-accent border-accent/15 hover:bg-accent-light/10"
                    >
                      Rate Service
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title={selectedBooking ? `Rate Service by ${selectedBooking.artisanName}` : ''}
        size="sm"
      >
        {selectedBooking && (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-secondary/40 uppercase">Overall Rating Score</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-warning focus:outline-none"
                  >
                    <FiStar 
                      size={24} 
                      className={star <= rating ? 'fill-warning text-warning' : 'text-secondary/20'} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-secondary/40 uppercase">Feedback Comment</label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with the installer..."
                className="w-full bg-white text-secondary text-sm border border-secondary/10 hover:border-secondary/20 transition-all rounded-xl p-3 outline-none focus:border-primary"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-secondary/5">
              <Button variant="outline" onClick={() => setSelectedBooking(null)}>Cancel</Button>
              <Button type="submit" variant="primary" loading={isSubmittingReview}>
                Submit Review
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Bookings;
