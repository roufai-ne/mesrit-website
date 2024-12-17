// src/components/admin/MinistereManager.js
import React, { useState } from 'react';
import { Save, Plus, Trash, Edit } from 'lucide-react';

export default function MinistereManager() {
  const [sections, setSections] = useState([
    {
      title: "Notre Mission",
      content: "Promouvoir l'enseignement supérieur et la recherche au Niger...",
      link: "/ministere/missions"
    },
    {
      title: "Organisation",
      content: "Structure organisationnelle du ministère...",
      link: "/ministere/organisation"
    },
    {
      title: "Direction",
      content: "Cabinet ministériel et équipe de direction...",
      link: "/ministere/direction"
    }
  ]);

  const [documents, setDocuments] = useState([
    {
      title: "Politique nationale de l'enseignement supérieur",
      type: "pdf",
      size: "2.4 MB",
      url: "/documents/politique.pdf"
    }
  ]);

  const [editMode, setEditMode] = useState(false);

  const handleUpdateSection = (index, field, value) => {
    const newSections = [...sections];
    newSections[index][field] = value;
    setSections(newSections);
  };

  const handleAddDocument = () => {
    setDocuments([...documents, {
      title: "Nouveau document",
      type: "pdf",
      size: "0 MB",
      url: ""
    }]);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion de la page Ministère</h1>
        <button 
          onClick={() => setEditMode(!editMode)}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
        >
          {editMode ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </>
          ) : (
            <>
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </>
          )}
        </button>
      </div>

      {/* Sections */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Sections principales</h2>
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={index} className="border rounded p-4">
              <input
                type="text"
                value={section.title}
                onChange={(e) => handleUpdateSection(index, 'title', e.target.value)}
                disabled={!editMode}
                className="font-bold mb-2 w-full p-2 border rounded"
              />
              <textarea
                value={section.content}
                onChange={(e) => handleUpdateSection(index, 'content', e.target.value)}
                disabled={!editMode}
                className="w-full p-2 border rounded"
                rows="3"
              />
              <input
                type="text"
                value={section.link}
                onChange={(e) => handleUpdateSection(index, 'link', e.target.value)}
                disabled={!editMode}
                className="w-full p-2 border rounded mt-2"
                placeholder="Lien de la page"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Documents officiels</h2>
          {editMode && (
            <button
              onClick={handleAddDocument}
              className="bg-blue-600 text-white px-3 py-1 rounded flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </button>
          )}
        </div>
        <div className="space-y-4">
          {documents.map((doc, index) => (
            <div key={index} className="border rounded p-4 flex items-center">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={doc.title}
                  onChange={(e) => {
                    const newDocs = [...documents];
                    newDocs[index].title = e.target.value;
                    setDocuments(newDocs);
                  }}
                  disabled={!editMode}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  value={doc.url}
                  onChange={(e) => {
                    const newDocs = [...documents];
                    newDocs[index].url = e.target.value;
                    setDocuments(newDocs);
                  }}
                  disabled={!editMode}
                  className="w-full p-2 border rounded"
                  placeholder="URL du document"
                />
              </div>
              {editMode && (
                <button
                  onClick={() => {
                    const newDocs = documents.filter((_, i) => i !== index);
                    setDocuments(newDocs);
                  }}
                  className="ml-4 text-red-600 hover:bg-red-50 p-2 rounded"
                >
                  <Trash className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}