import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ContactForm from '@/pages/contact/ContactForm';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Contact</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Informations de contact */}
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-6">Nos coordonnées</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-blue-600 mr-3" />
                  <span>Niamey, Niger</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-blue-600 mr-3" />
                  <span>+227 XX XX XX XX</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-blue-600 mr-3" />
                  <span>contact@mesrit.ne</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de contact */}
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}