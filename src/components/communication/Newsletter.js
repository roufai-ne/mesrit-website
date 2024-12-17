// src/components/communication/Newsletter.js
import React, { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique d'inscription à la newsletter
    setSubscribed(true);
  };

  return (
    <div className="bg-blue-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto text-center">
          <Mail className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Restez informé</h2>
          <p className="mb-6">Recevez les dernières actualités du ministère</p>
          
          {!subscribed ? (
            <form onSubmit={handleSubmit} className="flex space-x-4">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-2 rounded text-gray-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button 
                type="submit"
                className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700"
              >
                S'abonner
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center text-green-400">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Inscription confirmée !</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}