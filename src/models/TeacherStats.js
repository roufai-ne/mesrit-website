
import mongoose from 'mongoose';
const
 TeacherStatsSchema = new mongoose.Schema({
    year: { type: Number, required: true },
    publicUniversities: [{
      grade: { type: String, required: true },
      total: { type: Number, required: true },
      genderDistribution: {
        male: { type: Number, required: true },
        female: { type: Number, required: true }
      }
    }],
    privateInstitutions: {
      total: { type: Number, required: true },
      genderDistribution: {
        male: { type: Number, required: true },
        female: { type: Number, required: true }
      }
    }
  }, { timestamps: true });

  export const TeacherStats = mongoose.models.TeacherStats || mongoose.model('TeacherStats', TeacherStatsSchema);