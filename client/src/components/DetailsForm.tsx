import { useState } from 'react';

interface DetailsFormProps {
  onSubmit: (details: { email: string; instagram?: string }) => void;
  onBack: () => void;
}

export default function DetailsForm({ onSubmit, onBack }: DetailsFormProps) {
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    // A simple email validation regex
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address.');
        return;
    }
    setError('');
    onSubmit({ email, instagram });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex flex-col items-center justify-center p-6 text-white">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 relative">
                <button 
          onClick={onBack}
          className="absolute top-6 left-6 w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl"
        >
          &lt;
        </button>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">One Last Step!</h2>
          <p className="text-white/80">Enter your details to receive your reward.</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-all"
                required
              />
            </div>
            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-white/90 mb-2">
                Instagram Handle (Optional)
              </label>
              <input
                type="text"
                id="instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@yourhandle"
                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-all"
              />
            </div>
          </div>
          {error && <p className="mt-4 text-sm text-red-400 text-center">{error}</p>}
          <div className="mt-8">
            <button
              type="submit"
              className="w-full bg-yellow-400 text-black py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:bg-yellow-500 transform hover:scale-105 transition-all duration-300"
            >
              Claim My Reward
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
