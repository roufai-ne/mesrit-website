import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

const FAQForm = ({ faq, onSubmit, onClose }) => {
 const [formData, setFormData] = useState({
   question: faq?.question || '',
   answer: faq?.answer || '',
   category: faq?.category || '',
   isActive: faq?.isActive ?? true
 });

 return (
   <form onSubmit={(e) => {
     e.preventDefault();
     onSubmit(formData);
   }} className="space-y-4">
     <div>
       <label className="block font-medium mb-1">Question</label>
       <input
         type="text"
         value={formData.question}
         onChange={e => setFormData({...formData, question: e.target.value})}
         className="w-full p-2 border rounded"
         required
       />
     </div>

     <div>
       <label className="block font-medium mb-1">Réponse</label>
       <textarea
         value={formData.answer}
         onChange={e => setFormData({...formData, answer: e.target.value})}
         className="w-full p-2 border rounded min-h-[150px]"
         required
       />
     </div>

     <div>
       <label className="block font-medium mb-1">Catégorie</label>
       <input
         type="text"
         value={formData.category}
         onChange={e => setFormData({...formData, category: e.target.value})}
         className="w-full p-2 border rounded"
         required
       />
     </div>

     <div className="flex items-center gap-2">
       <input
         type="checkbox"
         id="isActive"
         checked={formData.isActive}
         onChange={e => setFormData({...formData, isActive: e.target.checked})}
       />
       <label htmlFor="isActive">Active</label>
     </div>

     <div className="flex justify-end gap-2">
       <button 
         type="button"
         onClick={onClose}
         className="px-4 py-2 border rounded hover:bg-gray-50"
       >
         Annuler
       </button>
       <button 
         type="submit"
         className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
       >
         {faq ? 'Modifier' : 'Ajouter'}
       </button>
     </div>
   </form>
 );
};

export default function FAQManager() {
 const [faqs, setFaqs] = useState([]);
 const [showForm, setShowForm] = useState(false);
 const [selectedFaq, setSelectedFaq] = useState(null);
 const [searchTerm, setSearchTerm] = useState('');
 const [categoryFilter, setCategoryFilter] = useState('all');

 useEffect(() => {
   fetchFaqs();
 }, []);

 const fetchFaqs = async () => {
   try {
     const response = await fetch('/api/faq');
     const data = await response.json();
     setFaqs(data);
   } catch (error) {
     toast.error('Erreur lors du chargement des FAQs');
   }
 };

 const handleSubmit = async (formData) => {
   try {
     const url = selectedFaq ? `/api/faq/${selectedFaq._id}` : '/api/faq';
     const method = selectedFaq ? 'PUT' : 'POST';
     
     await fetch(url, {
       method,
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(formData)
     });

     toast.success(selectedFaq ? 'FAQ modifiée' : 'FAQ ajoutée');
     setShowForm(false);
     setSelectedFaq(null);
     fetchFaqs();
   } catch (error) {
     toast.error('Erreur lors de la sauvegarde');
   }
 };

 const handleDelete = async (id) => {
   if (!confirm('Êtes-vous sûr de vouloir supprimer cette FAQ ?')) return;
   try {
     await fetch(`/api/faq/${id}`, { method: 'DELETE' });
     toast.success('FAQ supprimée');
     fetchFaqs();
   } catch (error) {
     toast.error('Erreur lors de la suppression');
   }
 };

 return (
   <div className="p-6 space-y-6">
     <div className="flex justify-between items-center">
       <h2 className="text-2xl font-bold">Gestion des FAQs</h2>
       <button 
         onClick={() => setShowForm(true)}
         className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
       >
         <Plus className="w-4 h-4" />
         Nouvelle FAQ
       </button>
     </div>

     <div className="flex gap-4 mb-6">
       <input
         type="text"
         placeholder="Rechercher..."
         value={searchTerm}
         onChange={e => setSearchTerm(e.target.value)}
         className="flex-1 p-2 border rounded"
       />
       <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">Toutes les catégories</option>
          {Array.isArray(faqs) && [...new Set(faqs.map(f => f.category))].map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
     </div>

     <div className="space-y-4">
     {Array.isArray(faqs) && faqs
        .filter(faq => {
          const matchesSearch = 
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesCategory = categoryFilter === 'all' || faq.category === categoryFilter;
          return matchesSearch && matchesCategory;
        })
  
         .map(faq => (
           <div key={faq._id} className="bg-white p-4 rounded-lg shadow border">
             <div className="flex justify-between items-start">
               <div className="flex-1">
                 <h3 className="font-bold mb-2">{faq.question}</h3>
                 <p className="text-gray-600">{faq.answer}</p>
                 <div className="mt-2 flex gap-2">
                   <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                     {faq.category}
                   </span>
                   <span className={`text-sm px-2 py-1 rounded ${
                     faq.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                   }`}>
                     {faq.isActive ? 'Active' : 'Inactive'}
                   </span>
                 </div>
               </div>
               <div className="flex gap-2">
                 <button
                   onClick={() => {
                     setSelectedFaq(faq);
                     setShowForm(true);
                   }}
                   className="p-2 hover:bg-gray-100 rounded"
                 >
                   <Edit2 className="w-4 h-4" />
                 </button>
                 <button
                   onClick={() => handleDelete(faq._id)}
                   className="p-2 hover:bg-red-100 text-red-600 rounded"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
             </div>
           </div>
         ))}
     </div>

     {showForm && (
       <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
         <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
           <h3 className="text-xl font-bold mb-4">
             {selectedFaq ? 'Modifier la FAQ' : 'Nouvelle FAQ'}
           </h3>
           <FAQForm
             faq={selectedFaq}
             onSubmit={handleSubmit}
             onClose={() => {
               setShowForm(false);
               setSelectedFaq(null);
             }}
           />
         </div>
       </div>
     )}
   </div>
 );
}
