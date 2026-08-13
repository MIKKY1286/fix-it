import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import BespokeBackground from '../components/common/BespokeBackground';
import { FiMail, FiArrowLeft, FiKey } from 'react-icons/fi';
import { useAuth } from '../context/authContextValue';
import { getFriendlyErrorMessage } from '../utils/firebaseErrors';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background py-12 px-4 sm:px-6">
      <BespokeBackground />

      <Card glass={true} className="w-full max-w-md p-8 sm:p-10 border-white/40 shadow-xl relative z-10 space-y-6">
        
        {/* Animated Icon Header */}
        <div className="text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
            <FiKey size={22} className="animate-float" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-secondary tracking-tight">Recovery Console</h1>
            <p className="text-sm text-secondary/50">Reset your credentials to restore account workspace.</p>
          </div>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleReset} className="space-y-4">
            <Input
              label="Registered Email Address"
              type="email"
              placeholder="e.g. yourname@domain.com"
              iconLeft={<FiMail size={16} />}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
            />

            {error && <p className="text-xs text-danger font-semibold mt-1">{error}</p>}

            <Button
              type="submit"
              className="w-full py-3.5 mt-2"
              loading={isLoading}
            >
              Send Recovery Key
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="h-12 w-12 rounded-full bg-accent-light text-accent flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-secondary">Instructions Dispatch Complete</h3>
              <p className="text-xs text-secondary/55 leading-relaxed">
                If the email exists in our records, a secure password adjustment link was dispatched to: <br />
                <span className="font-semibold text-secondary">{email}</span>
              </p>
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4" 
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
            >
              Request Again
            </Button>
          </div>
        )}

        {/* Back Link */}
        <div className="text-center border-t border-secondary/5 pt-4">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary/60 hover:text-secondary transition-colors duration-150">
            <FiArrowLeft size={14} /> Return to sign in dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;
