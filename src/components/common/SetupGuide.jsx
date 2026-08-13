import React, { useState } from 'react';
import { FiCopy, FiCheck, FiAlertTriangle, FiBookOpen, FiTerminal, FiExternalLink } from 'react-icons/fi';

const SetupGuide = () => {
  const [activeTab, setActiveTab] = useState('vercel');
  const [copiedKey, setCopiedKey] = useState(null);

  const envVariables = [
    { key: 'VITE_FIREBASE_API_KEY', desc: 'Firebase API Key for client authentication' },
    { key: 'VITE_FIREBASE_AUTH_DOMAIN', desc: 'Auth domain, e.g. project-id.firebaseapp.com' },
    { key: 'VITE_FIREBASE_PROJECT_ID', desc: 'Google Cloud / Firebase project identifier' },
    { key: 'VITE_FIREBASE_STORAGE_BUCKET', desc: 'Bucket URI for cloud storage' },
    { key: 'VITE_FIREBASE_MESSAGING_SENDER_ID', desc: 'Messaging sender ID for push notifications' },
    { key: 'VITE_FIREBASE_APP_ID', desc: 'Firebase Application ID' },
    { key: 'VITE_FIREBASE_MEASUREMENT_ID', desc: 'Firebase Analytics Measurement ID' },
    { key: 'VITE_PAYSTACK_PUBLIC_KEY', desc: 'Paystack checkout integration public key' },
    { key: 'VITE_GOOGLE_MAPS_API_KEY', desc: 'Google Maps JS SDK key for artisan location searches' },
    { key: 'VITE_GEMINI_API_KEY', desc: 'Google Gemini API key for smart artisan pricing assistant' }
  ];

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-orange-500 selection:text-white">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-orange-600/10 blur-[120px]" />
        <div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-green-600/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-4xl relative z-10 animate-fade-in">
        {/* Logo and Brand */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-orange-500/20">
            F
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Fix-<span className="text-orange-500">It</span> Setup Hub
          </span>
        </div>

        {/* Main Glass Container */}
        <div className="bg-[#1E293B]/75 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
          
          {/* Header Warning Banner */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border-b border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 bg-orange-500/15 text-orange-400 rounded-2xl shrink-0">
              <FiAlertTriangle size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Configuration Keys Required</h2>
              <p className="text-sm text-slate-400 mt-1">
                We've safely intercepted a Firebase load crash. Your environment keys are missing on Vercel or locally. Follow the steps below to restore system access.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-700/50 px-4 bg-slate-900/40">
            <button
              onClick={() => setActiveTab('vercel')}
              className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold transition-all duration-200 border-b-2 outline-none ${
                activeTab === 'vercel'
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FiExternalLink size={16} />
              Vercel Dashboard Setup
            </button>
            <button
              onClick={() => setActiveTab('local')}
              className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold transition-all duration-200 border-b-2 outline-none ${
                activeTab === 'local'
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FiTerminal size={16} />
              Local Development Setup
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Guide content depending on active tab */}
            {activeTab === 'vercel' ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FiBookOpen className="text-orange-500" />
                    How to configure environment variables on Vercel
                  </h3>
                  <ol className="mt-4 space-y-3.5 text-sm text-slate-300 list-decimal pl-5">
                    <li>
                      Go to your{' '}
                      <a
                        href="https://vercel.com/dashboard"
                        target="_blank"
                        rel="noreferrer"
                        className="text-orange-400 hover:text-orange-300 font-semibold underline inline-flex items-center gap-0.5"
                      >
                        Vercel Dashboard <FiExternalLink size={12} />
                      </a>{' '}
                      and select this project (**fix-it**).
                    </li>
                    <li>
                      Navigate to **Settings** &rarr; **Environment Variables**.
                    </li>
                    <li>
                      Create a new variable for each key listed in the table below, paste its value from your local `.env` file, and click **Add**.
                    </li>
                    <li>
                      Navigate to the **Deployments** tab, choose the latest failed deployment, click the **...** menu on the right, and select **Redeploy**.
                    </li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FiTerminal className="text-orange-500" />
                    Local Configuration File Setup
                  </h3>
                  <p className="text-sm text-slate-300 mt-2">
                    Ensure you have created a <code className="px-1.5 py-0.5 bg-slate-900 border border-slate-700/50 rounded font-mono text-orange-400 text-xs">.env</code> file in the root of your project containing the matching variable values. Here is how your file structure should look:
                  </p>
                  <pre className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
{`# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...

# Paystack Config
VITE_PAYSTACK_PUBLIC_KEY=...

# Maps and AI API Keys
VITE_GOOGLE_MAPS_API_KEY=...
VITE_GEMINI_API_KEY=...`}
                  </pre>
                </div>
              </div>
            )}

            {/* Variable Table */}
            <div className="border border-slate-700/50 rounded-2xl overflow-hidden bg-slate-900/30">
              <div className="p-4 bg-slate-900/60 border-b border-slate-700/50">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Required Environment Keys</span>
              </div>
              <div className="divide-y divide-slate-800">
                {envVariables.map(({ key, desc }) => (
                  <div key={key} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/10 transition-colors">
                    <div className="space-y-1">
                      <code className="text-xs font-bold text-orange-400 font-mono select-all">{key}</code>
                      <p className="text-xs text-slate-400">{desc}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(key)}
                      className={`flex items-center gap-1.5 self-start sm:self-center px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 border ${
                        copiedKey === key
                          ? 'bg-green-500/10 border-green-500/30 text-green-400'
                          : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      {copiedKey === key ? (
                        <>
                          <FiCheck size={13} className="animate-scale-in" /> Copied Key
                        </>
                      ) : (
                        <>
                          <FiCopy size={13} /> Copy Key
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Footer Action Support */}
          <div className="p-5 bg-slate-900/60 border-t border-slate-700/50 text-center text-xs text-slate-400">
            System monitored auto-recovery screen. This layout will clear instantly once environment keys are verified during app initialization.
          </div>

        </div>
      </div>
    </div>
  );
};

export default SetupGuide;
