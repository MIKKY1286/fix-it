import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { FiSave, FiRefreshCw, FiAlertOctagon } from 'react-icons/fi';

const Settings = () => {
  const [commission, setCommission] = useState(10);
  const [escrowDays, setEscrowDays] = useState(3);
  const [minHourlyRate, setMinHourlyRate] = useState(2000);
  const [emergencyPremium, setEmergencyPremium] = useState(15);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'system_settings', 'config');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCommission(data.commission || 10);
        setEscrowDays(data.escrowDays || 3);
        setMinHourlyRate(data.minHourlyRate || 2000);
        setEmergencyPremium(data.emergencyPremium || 15);
        setMaintenanceMode(data.maintenanceMode || false);
      } else {
        // Pre-populate system config in Firestore
        const defaultConfig = {
          commission: 10,
          escrowDays: 3,
          minHourlyRate: 2000,
          emergencyPremium: 15,
          maintenanceMode: false
        };
        await setDoc(docRef, defaultConfig);
      }
    } catch (err) {
      console.error('Error fetching system settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess('');
    try {
      const docRef = doc(db, 'system_settings', 'config');
      const updates = {
        commission: parseFloat(commission),
        escrowDays: parseInt(escrowDays),
        minHourlyRate: parseFloat(minHourlyRate),
        emergencyPremium: parseFloat(emergencyPremium),
        maintenanceMode: !!maintenanceMode
      };
      await updateDoc(docRef, updates);
      setSuccess('Platform settings successfully updated.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-secondary">System Configurations</h1>
          <p className="text-xs text-secondary/45 mt-0.5">Manage transaction rates, escrow holding rules, and maintenance state.</p>
        </div>
        <button 
          onClick={fetchSettings}
          className="text-xs font-semibold text-primary flex items-center gap-1.5 hover:underline cursor-pointer bg-white px-3 py-2 border border-secondary/5 rounded-xl shadow-sm"
        >
          <FiRefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Reload Config
        </button>
      </div>

      {loading ? (
        <Card className="p-12 text-center text-xs text-secondary/40">
          <FiRefreshCw className="animate-spin mx-auto mb-2 text-primary" size={20} />
          Loading platform configurations...
        </Card>
      ) : (
        <Card hoverable={false} className="p-6 bg-white border-secondary/5">
          <form onSubmit={handleSave} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Escrow Split Commission (%)"
                type="number"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                required
              />
              <Input
                label="Escrow Security Hold Window (Days)"
                type="number"
                value={escrowDays}
                onChange={(e) => setEscrowDays(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Base Minimum Hourly Rate (₦)"
                type="number"
                value={minHourlyRate}
                onChange={(e) => setMinHourlyRate(e.target.value)}
                required
              />
              <Input
                label="Emergency Dispatch Premium (%)"
                type="number"
                value={emergencyPremium}
                onChange={(e) => setEmergencyPremium(e.target.value)}
                required
              />
            </div>

            {/* Maintenance Mode Option */}
            <div className="p-4 border border-danger/10 bg-danger-light/10 rounded-xl space-y-3">
              <div className="flex gap-2 items-start">
                <FiAlertOctagon className="text-danger shrink-0 mt-0.5" size={16} />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-extrabold text-secondary">System Maintenance Mode</h4>
                  <p className="text-[10px] text-secondary/50 leading-normal">
                    Activating maintenance mode will immediately lock public pages and restrict artisan matching. Only administrators will have dashboard write permissions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pl-6 pt-1">
                <input
                  type="checkbox"
                  id="maintenance_checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="h-4 w-4 rounded border-secondary/15 text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="maintenance_checkbox" className="text-xs text-secondary font-bold select-none cursor-pointer">
                  Activate System Maintenance
                </label>
              </div>
            </div>

            {success && <p className="text-xs text-accent font-bold mt-1">{success}</p>}

            <div className="flex justify-end pt-4 border-t border-secondary/5">
              <Button type="submit" variant="primary" loading={isSaving} iconRight={<FiSave />}>
                Save System Configurations
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default Settings;
