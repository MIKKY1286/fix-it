import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FiClock } from 'react-icons/fi';

const Calendar = () => {
  const [slots, setSlots] = useState([
    { id: '1', day: 'Monday', time: '09:00 AM - 12:00 PM', active: true },
    { id: '2', day: 'Monday', time: '02:00 PM - 05:00 PM', active: true },
    { id: '3', day: 'Tuesday', time: '10:00 AM - 01:00 PM', active: false },
    { id: '4', day: 'Wednesday', time: '09:00 AM - 12:00 PM', active: true },
    { id: '5', day: 'Thursday', time: '01:00 PM - 04:00 PM', active: false }
  ]);
  const [success, setSuccess] = useState('');

  const toggleSlot = (id) => {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleSave = () => {
    setSuccess('Calendar slots synchronized successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-secondary">Business Calendar Planner</h1>
        <p className="text-xs text-secondary/45 mt-0.5">Toggle weekly availability slots matching client service matching grids.</p>
      </div>

      <Card hoverable={false} className="p-6 bg-white border-secondary/5 space-y-4">
        <div className="space-y-3">
          {slots.map((slot) => (
            <div 
              key={slot.id}
              onClick={() => toggleSlot(slot.id)}
              className={`p-3 rounded-2xl border text-xs flex justify-between items-center cursor-pointer transition-all duration-200 ${
                slot.active 
                  ? 'bg-accent-light/10 border-accent/20 text-accent font-bold' 
                  : 'bg-slate-50 border-secondary/5 text-secondary/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <FiClock size={16} />
                <div>
                  <p className="text-secondary font-extrabold">{slot.day}</p>
                  <p className="text-[10px] text-secondary/50 mt-0.5">{slot.time}</p>
                </div>
              </div>
              <span className="text-[9px] uppercase font-bold tracking-wider">
                {slot.active ? 'Available' : 'Paused'}
              </span>
            </div>
          ))}
        </div>

        {success && <p className="text-xs text-accent font-bold mt-2">{success}</p>}

        <div className="flex justify-end pt-4 border-t border-secondary/5">
          <Button variant="primary" onClick={handleSave}>
            Save Availability Slots
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Calendar;
