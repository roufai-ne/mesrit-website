import { connectDB } from '@/lib/mongodb';
import Director from '@/models/Director';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';

// Handler pour GET (public)
const getDirectors = async (req, res) => {
  await connectDB();
  
  try {
    const directors = await Director.find().sort({ ordre: 1 });
    return res.status(200).json(directors);
  } catch (error) {
    console.error('Error fetching directors:', error);
    throw error;
  }
};

// Handler pour POST (protégé)
const createDirector = async (req, res) => {
  await connectDB();
  
  try {
    // Validation des données
    const { titre, nom, key } = req.body;
    if (!titre || !nom) {
      return res.status(400).json({ 
        success: false,
        error: 'Le titre et le nom sont requis'
      });
    }
    
    // Vérifier si la clé existe déjà
    if (key) {
      const existing = await Director.findOne({ key });
      if (existing) {
        return res.status(400).json({ 
          success: false,
          error: 'Une direction avec cette clé existe déjà' 
        });
      }
    }

    const director = new Director({
      ...req.body,
      createdBy: req.user?.id,
      createdAt: new Date()
    });

    await director.save();
    return res.status(201).json(director);
  } catch (error) {
    console.error('Error creating director:', error);
    throw error;
  }
};

export default apiHandler(
  {
    GET: getDirectors,
    POST: createDirector
  },
  {
    GET: ROUTE_TYPES.PUBLIC,
    POST: ROUTE_TYPES.PROTECTED
  }
);