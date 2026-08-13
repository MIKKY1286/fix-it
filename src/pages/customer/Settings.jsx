import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FiBell } from 'react-icons/fi';

const Settings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState('');

  const handleToggleEmail = () => setEmailNotifications(!emailNotifications);
  const handleTogglePush = () => setPushNotifications(!pushNotifications);

  const handleSaveSettings = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setSuccess('Notification preferences synchronized.');
      setTimeout(() => setSuccess(''), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-secondary">Dashboard Settings</h1>
        <p className="text-xs text-secondary/45 mt-0.5">Configure notification parameters and system configurations.</p>
      </div>

      <Card hoverable={false} className="p-6 bg-white border-secondary/5 space-y-6">
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-secondary uppercase tracking-widest pb-3 border-b border-secondary/5 flex items-center gap-1.5">
            <FiBell className="text-primary" /> Notifications Hub Toggles
          </h3>

          <div className="flex items-center justify-between py-2">
            <div>
              <h4 className="text-xs font-bold text-secondary">Email Dispatch Notifications</h4>
              <p className="text-[10px] text-secondary/40 mt-0.5">Send transaction, bookings and dispute updates via email.</p>
            </div>
            <button
              onClick={handleToggleEmail}
              className={`
                relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                ${emailNotifications ? 'bg-primary' : 'bg-secondary/20'}
              `}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${emailNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-secondary/5">
            <div>
              <h4 className="text-xs font-bold text-secondary">Browser Push Notifications</h4>
              <p className="text-[10px] text-secondary/40 mt-0.5">Send live alerts during real-time chat sync.</p>
            </div>
            <button
              onClick={handleTogglePush}
              className={`
                relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                ${pushNotifications ? 'bg-primary' : 'bg-secondary/20'}
              `}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${pushNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {success && <p className="text-xs text-accent font-bold mt-1">{success}</p>}

        <div className="flex justify-end pt-4 border-t border-secondary/5">
          <Button variant="primary" onClick={handleSaveSettings} loading={isUpdating}>
            Save Preferences
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
