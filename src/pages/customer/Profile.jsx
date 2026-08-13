import React, { useState } from 'react';
import { useAuth } from '../../context/authContextValue';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave } from 'react-icons/fi';

const Profile = () => {
  const { userProfile, updateProfile } = useAuth();
  const [name, setName] = useState(userProfile?.name || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [location, setLocation] = useState(userProfile?.location || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    try {
      await updateProfile({
        name,
        phone,
        location,
        avatarText: name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
      });
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-secondary">My Account Profile</h1>
        <p className="text-xs text-secondary/45 mt-0.5">Manage personal information and service locations.</p>
      </div>

      <Card hoverable={false} className="p-6 bg-white border-secondary/5">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-secondary/5">
            <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/25 text-primary flex items-center justify-center font-extrabold text-lg shadow-sm">
              {userProfile?.avatarText || 'U'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-secondary">{userProfile?.name}</h3>
              <p className="text-xs text-secondary/40">{userProfile?.email}</p>
            </div>
          </div>

          <Input 
            label="Full Name"
            type="text"
            iconLeft={<FiUser size={16} />}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input 
            label="Email Address (Disabled)"
            type="email"
            iconLeft={<FiMail size={16} />}
            value={userProfile?.email}
            disabled={true}
          />

          <Input 
            label="Phone Number"
            type="text"
            placeholder="e.g. +234 801 234 5678"
            iconLeft={<FiPhone size={16} />}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input 
            label="Default Service Location Address"
            type="text"
            placeholder="e.g. 15, Herbert Macaulay Road, Yaba, Lagos"
            iconLeft={<FiMapPin size={16} />}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          {successMsg && (
            <p className="text-xs text-accent font-bold mt-1">{successMsg}</p>
          )}

          <div className="flex justify-end pt-4 border-t border-secondary/5">
            <Button 
              type="submit" 
              variant="primary" 
              loading={isSaving}
              iconRight={<FiSave />}
            >
              Save Profile Updates
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
