import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiCheckCircle } from 'react-icons/fi';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('general');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  const contactChannels = [
    {
      icon: <FiMail className="text-primary" size={20} />,
      label: 'Email Support',
      value: 'support@fixit.com',
      subtext: 'Get replies in under 12 hours.',
    },
    {
      icon: <FiPhone className="text-accent" size={20} />,
      label: 'Phone Helpline',
      value: '+1 (800) FIX-IT',
      subtext: 'Mon-Fri from 9 AM to 6 PM.',
    },
    {
      icon: <FiMapPin className="text-blue-500" size={20} />,
      label: 'Headquarters',
      value: 'Victoria Island, Lagos',
      subtext: 'Nigeria Operations Hub.',
    },
    {
      icon: <FiClock className="text-purple-500" size={20} />,
      label: 'Working Hours',
      value: '09:00 AM - 06:00 PM',
      subtext: 'GMT+1 timezone.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 pb-20">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-black tracking-widest text-primary uppercase bg-primary/10 px-3 py-1.5 rounded-full">
          Get In Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-secondary tracking-tight">
          How can we <span className="text-gradient">help you</span> today?
        </h1>
        <p className="text-sm text-secondary/60">
          Have an Escrow dispute, need help setting up your artisan portfolio, or want to partner? Leave us a message.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Direct channels */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-lg font-bold text-secondary uppercase tracking-wider">Direct support channels</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {contactChannels.map((channel, idx) => (
              <Card key={idx} hoverable={false} className="p-5 bg-white border-secondary/5 flex items-start gap-4">
                <div className="p-3 bg-secondary/5 rounded-xl shrink-0">
                  {channel.icon}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-secondary/45 uppercase tracking-wider">{channel.label}</h4>
                  <p className="text-sm font-extrabold text-secondary">{channel.value}</p>
                  <p className="text-[10px] text-secondary/40">{channel.subtext}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Interaction Form */}
        <div className="lg:col-span-7">
          <Card glass={true} className="p-8 sm:p-10 border-white/40 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-secondary">Send a Support Ticket</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Your Name"
                  placeholder="e.g. Ade Adebayo"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input 
                  label="Email Address"
                  placeholder="e.g. contact@domain.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-secondary/50 uppercase">Subject Topic</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white text-secondary text-xs border border-secondary/10 rounded-xl px-3 py-3 outline-none hover:border-secondary/20 transition-all duration-200"
                >
                  <option value="general">General Inquiry</option>
                  <option value="artisan_vetted">Artisan Verification Support</option>
                  <option value="escrow_dispute">Escrow & Payout Issue</option>
                  <option value="partnership">Business Partnering</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-secondary/50 uppercase">Your Message</label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide details about your query here..."
                  className="w-full bg-white text-secondary text-sm border border-secondary/10 hover:border-secondary/20 transition-all rounded-xl p-3 outline-none focus:border-primary"
                  required
                />
              </div>

              {isSubmitted && (
                <div className="p-4 bg-accent-light/20 text-accent text-xs rounded-xl flex items-center gap-2 border border-accent/20">
                  <FiCheckCircle size={16} />
                  <span>Support ticket logged successfully! We will get back to you shortly.</span>
                </div>
              )}

              <Button
                type="submit"
                loading={isSubmitting}
                className="w-full py-3.5 flex items-center justify-center gap-2"
                iconRight={<FiSend />}
              >
                Send Message
              </Button>
            </form>
          </Card>
        </div>

      </div>

      {/* Visual Google Map Placeholder card */}
      <Card hoverable={false} className="p-6 bg-white border-secondary/5 overflow-hidden shadow-sm relative">
        <div className="h-[280px] w-full bg-slate-100 rounded-xl border border-secondary/5 relative flex items-center justify-center overflow-hidden">
          {/* Mock Graphic details for Map */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-70" />
          <div className="absolute h-40 w-40 rounded-full bg-primary/10 border-4 border-dashed border-primary/30 flex items-center justify-center animate-pulse-slow">
            <div className="h-6 w-6 rounded-full bg-primary ring-8 ring-primary/20" />
          </div>
          <span className="relative z-10 text-xs font-bold text-secondary/40 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-secondary/5">
            Google Maps visual placeholder
          </span>
        </div>
      </Card>
      
    </div>
  );
};

export default Contact;
