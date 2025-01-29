// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'editor'], default: 'editor' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  isFirstLogin: { type: Boolean, default: true }
}, { timestamps: true });

// Méthode de comparaison du mot de passe modifiée
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('Comparing passwords');
    console.log('Candidate password exists:', !!candidatePassword);
    console.log('Stored password exists:', !!this.password);
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password match result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

// Export modifié pour s'assurer que le modèle est correctement créé
const User = mongoose.models.User || mongoose.model('User', UserSchema);
export { User };