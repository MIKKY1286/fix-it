import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/authContextValue';
import Card from '../../components/ui/Card';
import { FiStar } from 'react-icons/fi';

const Reviews = () => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!currentUser) return;
      try {
        const q = query(collection(db, 'reviews'), where('artisanId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const list = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setReviews(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [currentUser]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-secondary">Customer Feedback Logs</h1>
        <p className="text-xs text-secondary/45 mt-0.5">Browse reviews, quality stars, and comments left by clients.</p>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-xs text-secondary/40">Syncing reviews logs...</Card>
      ) : reviews.length === 0 ? (
        <Card glass={true} className="p-12 text-center space-y-3 text-secondary/40">
          <FiStar size={32} className="mx-auto text-secondary/20" />
          <p className="text-xs">No reviews submitted yet. Deliver quality service calls to build rating scores.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <Card key={r.id} hoverable={false} className="p-6 bg-white border-secondary/5 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-secondary">{r.customerName}</span>
                <div className="flex gap-0.5 items-center font-bold text-secondary">
                  <FiStar className="text-warning fill-warning" size={12} />
                  {r.rating} / 5
                </div>
              </div>
              <p className="text-xs text-secondary/60 leading-relaxed italic">
                "{r.comment}"
              </p>
              <p className="text-[9px] text-secondary/40 font-bold uppercase pt-1">
                {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
