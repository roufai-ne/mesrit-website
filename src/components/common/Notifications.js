// src/components/common/Notifications.js
import React from 'react';
import { Bell, X, Info, AlertCircle } from 'lucide-react';

export default function NotificationSystem() {
  const [notifications] = React.useState([
    { 
      id: 1, 
      type: 'info', 
      message: 'Nouveau communiqué publié',
      date: '2024-12-10'
    },
    { 
      id: 2, 
      type: 'alert', 
      message: 'Rappel : Date limite inscriptions',
      date: '2024-12-09'
    }
  ]);

  return (
    <div className="fixed top-20 right-4 w-80">
      {notifications.map(note => (
        <div key={note.id} className="bg-white shadow-lg rounded-lg p-4 mb-3 flex items-start">
          {note.type === 'info' ? 
            <Info className="w-5 h-5 text-blue-500" /> : 
            <AlertCircle className="w-5 h-5 text-amber-500" />
          }
          <div className="ml-3 flex-1">
            <p className="text-sm">{note.message}</p>
            <p className="text-xs text-gray-500 mt-1">{note.date}</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}