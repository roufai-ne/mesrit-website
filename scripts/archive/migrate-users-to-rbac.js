// scripts/migrate-users-to-rbac.js
import { connectDB } from '../src/lib/mongodb.js';
import mongoose from 'mongoose';

// Modèle User temporaire pour la migration
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  status: String,
  isFirstLogin: Boolean,
  lastLogin: Date,
  loginCount: Number,
  assignedDomains: [String],
  assignedEstablishments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Establishment' }],
  temporaryPermissions: [Object],
  lastRoleChange: Object,
  twoFactorEnabled: Boolean,
  twoFactorSecret: String,
  twoFactorActivatedAt: Date,
  twoFactorDisabledAt: Date,
  twoFactorBackupCodes: [String]
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function migrateUsers() {
  try {
    console.log('🔄 Début de la migration des utilisateurs vers RBAC...');
    
    await connectDB();
    
    // Récupérer tous les utilisateurs existants
    const users = await User.find({});
    console.log(`📊 ${users.length} utilisateurs trouvés pour migration`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        console.log(`\n👤 Migration de l'utilisateur: ${user.username} (${user.role})`);

        // Sauvegarder l'ancien rôle
        const oldRole = user.role;
        let newRole = user.role;
        let assignedDomains = [];

        // Mapper les anciens rôles vers les nouveaux
        switch (oldRole) {
          case 'admin':
            // Les anciens admins deviennent system-admin par défaut
            newRole = 'system-admin';
            // Accès à tous les domaines
            assignedDomains = ['news', 'documents', 'communications', 'establishments', 'services', 'directors'];
            console.log(`   ✅ admin → system-admin (accès complet)`);
            break;

          case 'editor':
            // Les éditeurs gardent leur rôle mais avec domaines par défaut
            newRole = 'editor';
            // Accès aux actualités et documents par défaut
            assignedDomains = ['news', 'documents'];
            console.log(`   ✅ editor → editor (accès news + documents)`);
            break;

          default:
            console.log(`   ⚠️  Rôle inconnu: ${oldRole}, assignation par défaut à editor`);
            newRole = 'editor';
            assignedDomains = ['news', 'documents'];
        }

        // Mettre à jour l'utilisateur
        user.role = newRole;
        user.assignedDomains = assignedDomains;
        
        // Enregistrer le changement de rôle
        user.lastRoleChange = {
          previousRole: oldRole,
          newRole: newRole,
          changedBy: null, // Migration automatique
          changedAt: new Date()
        };

        await user.save();
        migratedCount++;
        
        console.log(`   ✅ Migration réussie: ${oldRole} → ${newRole}`);
        console.log(`   📂 Domaines assignés: ${assignedDomains.join(', ')}`);

      } catch (userError) {
        console.error(`   ❌ Erreur pour ${user.username}:`, userError.message);
        errorCount++;
      }
    }

    console.log('\n📈 Résumé de la migration:');
    console.log(`   ✅ Utilisateurs migrés avec succès: ${migratedCount}`);
    console.log(`   ❌ Erreurs: ${errorCount}`);
    console.log(`   📊 Total: ${users.length}`);

    // Afficher la répartition finale des rôles
    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 Répartition finale des rôles:');
    roleDistribution.forEach(role => {
      console.log(`   ${role._id}: ${role.count} utilisateur(s)`);
    });

    // Vérifier s'il y a au moins un super-admin
    const superAdminCount = await User.countDocuments({ role: 'super-admin' });
    if (superAdminCount === 0) {
      console.log('\n⚠️  ATTENTION: Aucun super-admin détecté !');
      console.log('   Vous devrez manuellement promouvoir un system-admin vers super-admin.');
    }

    console.log('\n🎉 Migration terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Fonction pour créer un super-admin (à utiliser après migration)
async function createSuperAdmin(username, email, password) {
  try {
    await connectDB();
    
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingUser) {
      console.log('❌ Un utilisateur avec ce nom ou email existe déjà');
      return;
    }

    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = new User({
      username,
      email,
      password: hashedPassword,
      role: 'super-admin',
      status: 'active',
      isFirstLogin: false,
      assignedDomains: ['news', 'documents', 'communications', 'establishments', 'services', 'directors'],
      lastRoleChange: {
        previousRole: null,
        newRole: 'super-admin',
        changedBy: null,
        changedAt: new Date()
      }
    });

    await superAdmin.save();
    console.log(`✅ Super-admin créé: ${username}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du super-admin:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Fonction pour promouvoir un utilisateur existant
async function promoteToSuperAdmin(username) {
  try {
    await connectDB();
    
    const user = await User.findOne({ username });
    if (!user) {
      console.log(`❌ Utilisateur ${username} non trouvé`);
      return;
    }

    const oldRole = user.role;
    user.role = 'super-admin';
    user.assignedDomains = ['news', 'documents', 'communications', 'establishments', 'services', 'directors'];
    user.lastRoleChange = {
      previousRole: oldRole,
      newRole: 'super-admin',
      changedBy: null, // Promotion manuelle
      changedAt: new Date()
    };

    await user.save();
    console.log(`✅ ${username} promu de ${oldRole} vers super-admin`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la promotion:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Interface en ligne de commande
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'migrate':
    migrateUsers();
    break;
    
  case 'create-super-admin':
    if (args.length < 4) {
      console.log('Usage: npm run migrate-users create-super-admin <username> <email> <password>');
      process.exit(1);
    }
    createSuperAdmin(args[1], args[2], args[3]);
    break;
    
  case 'promote':
    if (args.length < 2) {
      console.log('Usage: npm run migrate-users promote <username>');
      process.exit(1);
    }
    promoteToSuperAdmin(args[1]);
    break;
    
  default:
    console.log(`
🔄 Script de Migration RBAC - MESRIT

Commandes disponibles:
  npm run migrate-users migrate                           - Migrer tous les utilisateurs
  npm run migrate-users create-super-admin <user> <email> <pass> - Créer un super-admin
  npm run migrate-users promote <username>               - Promouvoir vers super-admin

Exemples:
  npm run migrate-users migrate
  npm run migrate-users create-super-admin admin admin@mesrit.ne password123
  npm run migrate-users promote john.doe
    `);
}

export { migrateUsers, createSuperAdmin, promoteToSuperAdmin };