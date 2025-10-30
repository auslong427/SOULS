
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogoIcon } from './icons/LogoIcon';
import { GoogleIcon } from './icons/GoogleIcon';

export const LoginPage: React.FC = () => {
  const { logIn, loading } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-rose-50 to-indigo-100 p-4">
      <div className="w-full max-w-sm text-center">
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-8 sm:p-12 border border-white/30">
          <LogoIcon className="w-40 h-auto text-rose-500 mx-auto" />
          <p className="text-indigo-800/80 mt-4 mb-8 text-lg">Your shared journey, connected.</p>
          
          <div className="space-y-4">
            <button
              onClick={logIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 font-semibold py-2.5 px-4 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <GoogleIcon className="w-5 h-5"/>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};