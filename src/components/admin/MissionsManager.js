// src/components/admin/MissionsManager.js
import React, { useState } from 'react';
import { Plus, Trash, Save, Edit, CheckCircle, Circle } from 'lucide-react';

export default function MissionsManager() {
  // ... même état initial ...

  return (
    <div className="p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Gestion des Missions
        </h1>
        <div className="space-x-4">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-6 py-2.5 rounded-full flex items-center transition-all duration-300 ${
              editMode 
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
            } text-white shadow-lg hover:shadow-xl`}
          >
            {editMode ? (
              <>
                <Save className="w-4 h-4 mr-2 stroke-[2.5]" />
                <span className="font-medium">Enregistrer</span>
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2 stroke-[2.5]" />
                <span className="font-medium">Modifier</span>
              </>
            )}
          </button>
          {editMode && (
            <button
              onClick={handleAddMission}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 
                       text-white px-6 py-2.5 rounded-full flex items-center transition-all duration-300 
                       shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4 mr-2 stroke-[2.5]" />
              <span className="font-medium">Nouvelle mission</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {missions.map((mission, missionIndex) => (
          <div key={missionIndex} 
               className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border border-gray-100">
            <input
              type="text"
              value={mission.title}
              onChange={(e) => {
                const newMissions = [...missions];
                newMissions[missionIndex].title = e.target.value;
                setMissions(newMissions);
              }}
              disabled={!editMode}
              className="text-2xl font-bold mb-4 w-full p-3 rounded-lg bg-transparent 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
                       disabled:bg-transparent disabled:border-transparent"
              placeholder="Titre de la mission"
            />
            
            <textarea
              value={mission.content}
              onChange={(e) => {
                const newMissions = [...missions];
                newMissions[missionIndex].content = e.target.value;
                setMissions(newMissions);
              }}
              disabled={!editMode}
              className="w-full p-3 rounded-lg bg-gray-50 border-0 
                       focus:ring-2 focus:ring-blue-500 mb-6 
                       disabled:bg-transparent resize-none"
              rows="3"
              placeholder="Description de la mission"
            />

            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-blue-900">Objectifs</h3>
                {editMode && (
                  <button
                    onClick={() => handleAddObjectif(missionIndex)}
                    className="text-blue-600 hover:bg-blue-100 p-2 rounded-full 
                             transition-colors duration-300"
                  >
                    <Plus className="w-5 h-5 stroke-[2]" />
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {mission.objectifs.map((objectif, objectifIndex) => (
                  <div key={objectifIndex} className="flex items-start group">
                    <Circle className="w-4 h-4 text-blue-500 mr-3 mt-3 flex-shrink-0 fill-current" />
                    <input
                      type="text"
                      value={objectif}
                      onChange={(e) => {
                        const newMissions = [...missions];
                        newMissions[missionIndex].objectifs[objectifIndex] = e.target.value;
                        setMissions(newMissions);
                      }}
                      disabled={!editMode}
                      className="flex-1 p-2 rounded-lg bg-transparent focus:outline-none
                               focus:ring-2 focus:ring-blue-400 disabled:bg-transparent"
                      placeholder="Nouvel objectif"
                    />
                    {editMode && (
                      <button
                        onClick={() => {
                          const newMissions = [...missions];
                          newMissions[missionIndex].objectifs = newMissions[missionIndex].objectifs
                            .filter((_, index) => index !== objectifIndex);
                          setMissions(newMissions);
                        }}
                        className="ml-2 text-red-500 opacity-0 group-hover:opacity-100 
                                 hover:bg-red-50 p-2 rounded-full transition-all duration-300"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}