
import mongoose from 'mongoose';
const InstitutionStatsSchema = new mongoose.Schema({
    year: { type: Number, required: true },
    institutions: [{
      type: { type: String, required: true }, // université, grande école, etc.
      sector: { type: String, enum: ['public', 'private'], required: true },
      count: { type: Number, required: true }
    }],
    totalPublic: { type: Number, required: true },
    totalPrivate: { type: Number, required: true }
  }, { timestamps: true });

  export const InstitutionStats = mongoose.models.InstitutionStats || mongoose.model('InstitutionStats', InstitutionStatsSchema);