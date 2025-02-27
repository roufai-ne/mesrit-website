// lib/validators.js
export const validateEmail = (email) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
   };


export function validateDocument(data) {
    const errors = [];
  
    // Validation du titre
    if (!data.title || typeof data.title !== 'string' || data.title.length < 3) {
      errors.push('Le titre doit contenir au moins 3 caractères');
    }
  
    // Validation de la description
    if (!data.description || typeof data.description !== 'string' || data.description.length < 10) {
      errors.push('La description doit contenir au moins 10 caractères');
    }
  
    // Validation de la catégorie
    const validCategories = ['regulatory', 'policy', 'reports', 'guides'];
    if (!data.category || !validCategories.includes(data.category)) {
      errors.push('Catégorie invalide');
    }
  
    // Validation de la date
    const publicationDate = new Date(data.publicationDate);
    if (isNaN(publicationDate.getTime())) {
      errors.push('Date de publication invalide');
    }
  
    // Validation du type
    const validTypes = ['pdf', 'doc', 'docx'];
    if (!data.type || !validTypes.includes(data.type)) {
      errors.push('Type de fichier invalide');
    }
  
    // Validation du statut
    const validStatuses = ['draft', 'published'];
    if (!data.status || !validStatuses.includes(data.status)) {
      errors.push('Statut invalide');
    }
  
    return {
      success: errors.length === 0,
      errors
    };
  }  