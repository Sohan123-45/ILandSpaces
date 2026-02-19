import React, { useState } from 'react';
import { loginAdmin } from '../services/mockBackend';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Lock, AlertOctagon } from 'lucide-react';
import { AdminUser, CaptchaChallenge } from '../types';

interface AdminLoginProps {
  onLogin: (user: AdminUser) => void;
}

const generateCaptcha = (): CaptchaChallenge => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    return { num1, num2, answer: num1 + num2 };
  };

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Captcha state
  const [captcha, setCaptcha] = useState<CaptchaChallenge>(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check Captcha
    if (parseInt(captchaInput) !== captcha.answer) {
        setError('Incorrect CAPTCHA answer.');
        setCaptcha(generateCaptcha());
        setCaptchaInput('');
        return;
    }

    setIsLoading(true);
    
    try {
      const user = await loginAdmin(email, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials. (Hint: admin@company.com / 12345)');
        setCaptcha(generateCaptcha());
        setCaptchaInput('');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Portal</h2>
          <p className="text-gray-500 mt-2">Sign in to manage leads</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 mb-6 text-sm">
            <AlertOctagon className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@company.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          {/* Captcha Field */}
          <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                  Security: {captcha.num1} + {captcha.num2} = ?
              </label>
              <input 
                 type="number"
                 className="w-full px-3 py-2 border rounded focus:ring-primary-500 focus:border-primary-500"
                 placeholder="Enter sum"
                 value={captchaInput}
                 onChange={(e) => setCaptchaInput(e.target.value)}
                 required
              />
          </div>

          <Button type="submit" className="w-full py-2.5" isLoading={isLoading}>
            Sign In
          </Button>
          
          <div className="text-xs text-gray-400 text-center mt-4">
            Authorized personnel only. All attempts are logged.
          </div>
        </form>
      </div>
    </div>
  );
};