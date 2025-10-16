import { connectDB } from "@/lib/mongodb";
import Director from "@/models/Director";
import { apiHandler, ROUTE_TYPES } from "@/middleware/securityMiddleware";

// Handler pour GET (public)
const getDirectors = async (req, res) => {
  await connectDB();

  try {
    const directors = await Director.find().sort({ ordre: 1 });
    return res.status(200).json(directors);
  } catch (error) {
    console.error("Error fetching directors:", error);
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
        error: "Le titre et le nom sont requis",
        code: "VALIDATION_ERROR",
      });
    }

    // Vérifier si la clé existe déjà
    if (key) {
      const existing = await Director.findOne({ key });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: "Une direction avec cette clé existe déjà",
          code: "DUPLICATE_KEY",
          field: "key",
          value: key,
        });
      }
    }

    // Vérifier si le titre existe déjà (éviter les doublons de poste)
    const existingTitre = await Director.findOne({ titre });
    if (existingTitre) {
      return res.status(409).json({
        success: false,
        error: `Le poste "${titre}" est déjà occupé par ${existingTitre.nom}`,
        code: "DUPLICATE_TITLE",
        field: "titre",
        value: titre,
        existing: {
          nom: existingTitre.nom,
          id: existingTitre._id,
        },
      });
    }

    const director = new Director({
      ...req.body,
      createdBy: req.user?.id,
      createdAt: new Date(),
    });

    await director.save();

    return res.status(201).json({
      success: true,
      data: director,
      message: "Responsable créé avec succès",
    });
  } catch (error) {
    console.error("Error creating director:", error);

    // Gestion des erreurs MongoDB spécifiques
    if (error.code === 11000) {
      // Erreur de doublon MongoDB
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];

      return res.status(409).json({
        success: false,
        error: `Cette valeur existe déjà pour le champ "${field}"`,
        code: "MONGODB_DUPLICATE",
        field: field,
        value: value,
      });
    }

    // Erreurs de validation Mongoose
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        error: "Erreur de validation des données",
        code: "VALIDATION_ERROR",
        details: validationErrors,
      });
    }

    // Autres erreurs
    return res.status(500).json({
      success: false,
      error: "Erreur interne du serveur",
      code: "INTERNAL_ERROR",
    });
  }
};

// Handler pour PUT (protégé)
const updateDirector = async (req, res) => {
  await connectDB();

  try {
    const { id } = req.query;
    const { titre, nom, key } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "ID du responsable requis",
        code: "MISSING_ID",
      });
    }

    if (!titre || !nom) {
      return res.status(400).json({
        success: false,
        error: "Le titre et le nom sont requis",
        code: "VALIDATION_ERROR",
      });
    }

    // Vérifier si le responsable existe
    const existingDirector = await Director.findById(id);
    if (!existingDirector) {
      return res.status(404).json({
        success: false,
        error: "Responsable non trouvé",
        code: "NOT_FOUND",
      });
    }

    // Vérifier si la clé existe déjà (sauf pour le responsable actuel)
    if (key && key !== existingDirector.key) {
      const duplicateKey = await Director.findOne({ key, _id: { $ne: id } });
      if (duplicateKey) {
        return res.status(409).json({
          success: false,
          error: "Une direction avec cette clé existe déjà",
          code: "DUPLICATE_KEY",
          field: "key",
          value: key,
        });
      }
    }

    // Vérifier si le titre existe déjà (sauf pour le responsable actuel)
    if (titre !== existingDirector.titre) {
      const duplicateTitre = await Director.findOne({
        titre,
        _id: { $ne: id },
      });
      if (duplicateTitre) {
        return res.status(409).json({
          success: false,
          error: `Le poste "${titre}" est déjà occupé par ${duplicateTitre.nom}`,
          code: "DUPLICATE_TITLE",
          field: "titre",
          value: titre,
          existing: {
            nom: duplicateTitre.nom,
            id: duplicateTitre._id,
          },
        });
      }
    }

    const updatedDirector = await Director.findByIdAndUpdate(
      id,
      {
        ...req.body,
        updatedBy: req.user?.id,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: updatedDirector,
      message: "Responsable mis à jour avec succès",
    });
  } catch (error) {
    console.error("Error updating director:", error);

    // Gestion des erreurs MongoDB spécifiques
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];

      return res.status(409).json({
        success: false,
        error: `Cette valeur existe déjà pour le champ "${field}"`,
        code: "MONGODB_DUPLICATE",
        field: field,
        value: value,
      });
    }

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        error: "Erreur de validation des données",
        code: "VALIDATION_ERROR",
        details: validationErrors,
      });
    }

    return res.status(500).json({
      success: false,
      error: "Erreur interne du serveur",
      code: "INTERNAL_ERROR",
    });
  }
};

export default apiHandler(
  {
    GET: getDirectors,
    POST: createDirector,
    PUT: updateDirector,
  },
  {
    GET: ROUTE_TYPES.PUBLIC,
    POST: ROUTE_TYPES.PROTECTED,
    PUT: ROUTE_TYPES.PROTECTED,
  }
);
