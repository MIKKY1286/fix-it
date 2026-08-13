import React, { useState } from 'react';
import { useAuth } from '../../context/authContextValue';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { FiUser, FiMapPin, FiSave, FiAward, FiTag, FiDollarSign } from 'react-icons/fi';

const Profile = () => {
  const { userProfile, updateProfile } = useAuth();
  
  const artisanProfile = userProfile?.profile || {};
  
  const [name, setName] = useState(userProfile?.name || '');
  const [category, setCategory] = useState(userProfile?.category || artisanProfile.category || 'Solar Installer');
  const [hourlyRate, setHourlyRate] = useState(userProfile?.hourlyRate || artisanProfile.hourlyRate || 5000);
  const [location, setLocation] = useState(userProfile?.location || artisanProfile.location || 'Lekki Phase 1, Lagos');
  const [bio, setBio] = useState(userProfile?.bio || artisanProfile.bio || 'Solar PV and Inverter Bypass Expert.');
  const [skills, setSkills] = useState(artisanProfile.skills?.join(', ') || 'Solar PV Sizing, Inverter Bypass');
  const [certs, setCerts] = useState(artisanProfile.certifications?.join(', ') || 'REAN Member');
  
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess('');
    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      const certsArray = certs.split(',').map(c => c.trim()).filter(Boolean);
      
      await updateProfile({
        name,
        category,
        hourlyRate: parseFloat(hourlyRate),
        location,
        bio,
        profile: {
          ...artisanProfile,
          category,
          hourlyRate: parseFloat(hourlyRate),
          location,
          bio,
          skills: skillsArray,
          certifications: certsArray
        }
      });
      setSuccess('Business profile synchronized with registry.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-secondary">Artisan Business Profile</h1>
        <p className="text-xs text-secondary/45 mt-0.5">Manage rates, certifications, skills catalog, and bio.</p>
      </div>

      <Card hoverable={false} className="p-6 bg-white border-secondary/5">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-secondary/5">
            <div className="h-14 w-14 rounded-full bg-accent-light border border-accent/20 text-accent flex items-center justify-center font-extrabold text-lg shadow-sm">
              {userProfile?.avatarText || 'A'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-secondary">{userProfile?.name}</h3>
              <p className="text-xs text-secondary/40">Verified Business Account</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Business Name"
              type="text"
              iconLeft={<FiUser size={16} />}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input 
              label="Service Category"
              type="text"
              iconLeft={<FiTag size={16} />}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Hourly Rate (NGN)"
              type="number"
              iconLeft={<FiDollarSign size={16} />}
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
            <Input 
              label="Service Proximity Sector"
              type="text"
              iconLeft={<FiMapPin size={16} />}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-secondary/50 uppercase">Business Biography (Bio)</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-white text-secondary text-sm border border-secondary/10 hover:border-secondary/20 transition-all rounded-xl p-3 outline-none focus:border-primary"
              required
            />
          </div>

          <Input 
            label="Trade Skills (Comma Separated)"
            type="text"
            placeholder="e.g. PV Sizing, PPR Pipe Fusion, Stain Clean"
            iconLeft={<FiAward size={16} />}
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />

          <Input 
            label="Certifications (Comma Separated)"
            type="text"
            placeholder="e.g. REAN Registered Member, LSTC plumbing"
            iconLeft={<FiAward size={16} />}
            value={certs}
            onChange={(e) => setCerts(e.target.value)}
          />

          {success && <p className="text-xs text-accent font-bold mt-1">{success}</p>}

          <div className="flex justify-end pt-4 border-t border-secondary/5">
            <Button type="submit" variant="primary" loading={isSaving} iconRight={<FiSave />}>
              Save Business Profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
