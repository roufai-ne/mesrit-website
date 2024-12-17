export const updateOrganigrammeData = async (data) => {
    try {
      const response = await fetch('/api/organigramme/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      throw error;
    }
  };