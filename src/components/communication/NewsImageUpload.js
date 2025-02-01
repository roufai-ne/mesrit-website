/* eslint-disable @typescript-eslint/no-unused-vars */
// components/communication/NewsImageUpload.js
import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';


export default function NewsImageUpload({ value, onChange, required }) {
 const [uploading, setUploading] = useState(false);

 const handleImageUpload = async (e) => {
   const file = e.target.files[0];
   if (!file) return;

   if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
     toast.error('Format non supporté. Utilisez JPG ou PNG');
     return;
   }

   if (file.size > 2 * 1024 * 1024) {
     toast.error('Image trop volumineuse (max 2MB)');
     return;
   }

   setUploading(true);
   const formData = new FormData();
   formData.append('file', file);

   try {
     const response = await fetch('/api/upload/news', {
       method: 'POST',
       body: formData
     });

     if (!response.ok) throw new Error('Erreur upload');

     const data = await response.json();
     onChange(data.url);
   } catch (error) {
     toast.error('Erreur lors de l\'upload');
   } finally {
     setUploading(false);
   }
 };

 return (
   <div className="space-y-4">
     <label className="block text-sm font-medium">Image</label>
     
     <div 
       className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50"
       onClick={() => document.getElementById('fileInput').click()}
     >
       {value ? (
         <div className="relative w-full aspect-video rounded-lg overflow-hidden">
           <img
             src={value}
             alt="Preview"
             className="w-full h-full object-cover"
           />
         </div>
       ) : (
         <>
           <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
           <div className="mt-4">
             <span className="mt-2 block text-sm text-gray-600">
               {uploading ? 'Upload en cours...' : 'Cliquez pour ajouter une image'}
             </span>
           </div>
         </>
       )}
       
       <input
         id="fileInput"
         type="file"
         onChange={handleImageUpload}
         className="hidden"
         accept="image/jpeg,image/png"
         required={required && !value}
       />
     </div>
   </div>
 );
}