import mongoose from 'mongoose';

const StudentStatsSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  totalStudents: { type: Number, required: true },
  studentsPerCapita: { type: Number, required: true }, // per 100k inhabitants
  
  // Distribution by gender
  genderDistribution: {
    male: { type: Number, required: true },
    female: { type: Number, required: true }
  },
  
  // Public/Private distribution
  sectorDistribution: {
    public: {
      total: { type: Number, required: true },
      universities: { type: Number, required: true },
      grandesEcoles: { type: Number, required: true }
    },
    private: {
      total: { type: Number, required: true },
      universities: { type: Number, required: true },
      grandesEcoles: { type: Number, required: true }
    }
  }
}, { timestamps: true });

export const StudentStats = mongoose.models.StudentStats || mongoose.model('StudentStats', StudentStatsSchema);