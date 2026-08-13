import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { FiSliders, FiMapPin, FiStar } from 'react-icons/fi';

const Search = () => {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState(30000);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const navigate = useNavigate();

  // Load from Firestore
  useEffect(() => {
    const fetchArtisans = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'artisan'));
        const querySnapshot = await getDocs(q);
        const list = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const profile = data.profile || {};
          list.push({
            id: doc.id,
            name: data.name,
            avatarText: data.avatarText,
            isVerified: data.isVerified,
            isEmergency: data.isEmergency,
            category: profile.category || data.category || 'Professional',
            categoryId: profile.categoryId || data.categoryId || '',
            rating: profile.rating || data.rating || 5.0,
            hourlyRate: profile.hourlyRate || data.hourlyRate || 5000,
            location: profile.location || data.location || 'Lagos',
            bio: profile.bio || data.bio || '',
            responseTime: profile.responseTime || data.responseTime || '30 mins',
            skills: profile.skills || data.skills || [],
            certifications: profile.certifications || data.certifications || [],
            completedJobs: profile.completedJobs || data.completedJobs || 0,
            reviewsCount: profile.reviewsCount || data.reviewsCount || 0
          });
        });
        setArtisans(list);
      } catch (err) {
        console.error('Error fetching artisans from firestore:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtisans();
  }, []);

  const filteredArtisans = artisans.filter((artisan) => {
    // Check fields inside artisan profile
    const profile = artisan.profile || {};
    const trade = artisan.category || profile.category || '';
    const skills = profile.skills || [];
    const name = artisan.name || '';
    const rate = artisan.hourlyRate || profile.hourlyRate || 0;
    const isVer = artisan.isVerified || false;

    const matchesSearch = 
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === '' || trade.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesPrice = rate <= maxPrice;
    const matchesVerified = !onlyVerified || isVer;

    return matchesSearch && matchesCategory && matchesPrice && matchesVerified;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-secondary">Find Professional Artisans</h1>
        <p className="text-xs text-secondary/45 mt-0.5">Filter by location, price escrow, verified trade credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Filters */}
        <Card hoverable={false} className="lg:col-span-1 p-5 bg-white border-secondary/5 space-y-5 self-start">
          <div className="flex items-center gap-1.5 pb-3 border-b border-secondary/5">
            <FiSliders className="text-primary" />
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">Filter Registry</h3>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-secondary/40 uppercase">Search query</label>
            <Input 
              placeholder="e.g. Solar, CCTV..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="!py-1"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-secondary/40 uppercase">Select Trade</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white text-secondary text-xs border border-secondary/10 rounded-xl px-3 py-2.5 outline-none hover:border-secondary/20 transition-all duration-200"
            >
              <option value="">All Services</option>
              <option value="Solar">Solar Installer</option>
              <option value="Electrician">Electrician</option>
              <option value="Plumber">Plumber</option>
              <option value="Interior">Interior Designer</option>
              <option value="Cleaning">Cleaning Services</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-secondary/40 uppercase">
              <span>Max Rate / Hr</span>
              <span className="text-secondary font-bold">₦{maxPrice.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min={5000} 
              max={30000} 
              step={1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-secondary/5">
            <input 
              type="checkbox" 
              id="ver-box"
              checked={onlyVerified}
              onChange={() => setOnlyVerified(!onlyVerified)}
              className="accent-primary rounded h-4 w-4"
            />
            <label htmlFor="ver-box" className="text-xs font-bold text-secondary/65 select-none cursor-pointer">
              Only Show Verified
            </label>
          </div>
        </Card>

        {/* Results grid */}
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} className="p-6 space-y-4">
                  <div className="h-10 w-10 bg-secondary/5 animate-pulse rounded-full" />
                  <div className="h-4 w-1/3 bg-secondary/5 animate-pulse rounded" />
                  <div className="h-16 w-full bg-secondary/5 animate-pulse rounded" />
                </Card>
              ))}
            </div>
          ) : filteredArtisans.length === 0 ? (
            <Card glass={true} className="p-8 text-center text-xs text-secondary/40">
              No verified artisans matching current filters.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredArtisans.map((artisan) => {
                const profile = artisan.profile || {};
                const trade = artisan.category || profile.category || 'Professional Trade';
                const location = artisan.location || profile.location || 'Lagos, Nigeria';
                const rate = artisan.hourlyRate || profile.hourlyRate || 5000;
                const rating = artisan.rating || profile.rating || 5.0;

                return (
                  <Card key={artisan.id} hoverable={true} className="p-6 bg-white border-secondary/5 flex flex-col justify-between min-h-[280px]">
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-start">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-extrabold text-sm">
                          {artisan.avatarText || artisan.name[0]}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {artisan.isVerified && <Badge.Verified size="sm" />}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-secondary tracking-tight">{artisan.name}</h4>
                        <p className="text-xs text-primary font-bold">{trade}</p>
                        <p className="text-[10px] text-secondary/45 flex items-center gap-1">
                          <FiMapPin size={11} /> {location}
                        </p>
                      </div>

                      <p className="text-xs text-secondary/60 leading-relaxed line-clamp-2">
                        {artisan.bio || profile.bio || 'Experienced trade specialist providing reliable home repair and solar solutions.'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-secondary/5 mt-4 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1 font-bold text-secondary">
                        <FiStar className="text-warning fill-warning" size={13} />
                        {rating}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-secondary">₦{rate.toLocaleString()}/hr</span>
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => navigate('/customer')}
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Search;
