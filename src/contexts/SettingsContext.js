import React, { createContext, useState, useEffect, useContext } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    site: { title: "", description: "", email: "", phone: "", address: "" },
    social: { facebook: "", twitter: "", linkedin: "" },
    external: { anab: "", bac: "", bts: "" },
    header: { 
      backgroundImage: "/images/hero/Slide1.jpg", 
      opacity: 5, 
      logo: "", 
      logoSize: "medium", 
      logoPosition: "left" 
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);