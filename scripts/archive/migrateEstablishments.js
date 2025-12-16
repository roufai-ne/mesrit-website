// src/scripts/migrateEstablishments.js
// Script de migration pour ajouter les informations d'accréditation aux établissements existants
/* eslint-disable @typescript-eslint/no-require-imports */

const { connectDB } = require('../lib/mongodb');
const Establishment = require('../models/Establishment').default;

async function migrateEstablishments() {
  try {
    await connectDB();
    console.log('🔄 Début de la migration des établissements...');

    // Récupérer tous les établissements
    const establishments = await Establishment.find({});
    console.log(`📊 ${establishments.length} établissements trouvés`);

    let updated = 0;
    let skipped = 0;

    for (const establishment of establishments) {
      // Vérifier si l'établissement a déjà les nouvelles informations
      if (establishment.accreditation || establishment.contact || establishment.numberOfStudents !== undefined) {
        console.log(`⏭️  Établissement "${establishment.nom}" déjà migré`);
        skipped++;
        continue;
      }

      // Préparer les nouvelles données
      const updateData = {
        // Informations d'accréditation (par défaut pour les établissements privés)
        accreditation: {
          isAccredited: establishment.statut === 'privé' ? true : false, // Par défaut, les privés sont considérés comme accrédités
          accreditationNumber: establishment.statut === 'privé' ? `ACC-${new Date().getFullYear()}-${String(updated + 1).padStart(3, '0')}` : null,
          accreditationDate: establishment.statut === 'privé' ? establishment.dateOuverture : null,
          accreditationExpiry: establishment.statut === 'privé' ? new Date(new Date(establishment.dateOuverture).setFullYear(new Date(establishment.dateOuverture).getFullYear() + 5)) : null,
          accreditingBody: 'MESRIT Niger',
          accreditationLevel: establishment.statut === 'privé' ? 'Définitive' : null,
          specializations: []
        },
        
        // Informations de contact (vides par défaut, à remplir par les admins)
        contact: {
          phone: null,
          email: null,
          address: `${establishment.ville}, ${establishment.region}, Niger`
        },
        
        // Statistiques (valeurs par défaut basées sur le type)
        numberOfStudents: getDefaultStudentCount(establishment.type),
        numberOfPrograms: getDefaultProgramCount(establishment.type)
      };

      // Mettre à jour l'établissement
      await Establishment.findByIdAndUpdate(
        establishment._id,
        { $set: updateData },
        { runValidators: true }
      );

      console.log(`✅ Établissement "${establishment.nom}" migré avec succès`);
      updated++;
    }

    console.log('\n📈 Résumé de la migration :');
    console.log(`✅ ${updated} établissements mis à jour`);
    console.log(`⏭️  ${skipped} établissements déjà migrés`);
    console.log(`📊 Total : ${establishments.length} établissements`);
    
    console.log('\n🎉 Migration terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration :', error);
    process.exit(1);
  }
}

// Fonctions utilitaires pour les valeurs par défaut
function getDefaultStudentCount(type) {
  switch (type) {
    case 'Université':
      return Math.floor(Math.random() * 5000) + 1000; // 1000-6000 étudiants
    case 'Institut':
      return Math.floor(Math.random() * 2000) + 500;  // 500-2500 étudiants
    case 'École':
      return Math.floor(Math.random() * 1000) + 200;  // 200-1200 étudiants
    default:
      return 0;
  }
}

function getDefaultProgramCount(type) {
  switch (type) {
    case 'Université':
      return Math.floor(Math.random() * 20) + 10; // 10-30 programmes
    case 'Institut':
      return Math.floor(Math.random() * 10) + 5;  // 5-15 programmes
    case 'École':
      return Math.floor(Math.random() * 8) + 3;   // 3-11 programmes
    default:
      return 0;
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrateEstablishments()
    .then(() => {
      console.log('🏁 Script de migration terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale :', error);
      process.exit(1);
    });
}

module.exports = { migrateEstablishments };