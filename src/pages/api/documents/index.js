import { connectDB } from '@/lib/mongodb';
import Document from '@/models/Document';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import { validateDocument } from '@/lib/validators';

// Handler pour GET (public)
const getDocuments = async (req, res) => {
  await connectDB();
  const documents = await Document.find({}).sort({ publicationDate: -1 });
  return res.status(200).json(documents);
};

// Handler pour POST (protégé)
const postDocument = async (req, res) => {
  await connectDB();
  const validation = validateDocument(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.errors });
  }
  const document = await Document.create(req.body);
  return res.status(201).json(document);
};

// Export avec apiHandler
export default apiHandler({
  GET: getDocuments,   // Route publique
  POST: postDocument,  // Route protégée
}, {
  GET: ROUTE_TYPES.PUBLIC,    // Type explicite pour GET
  POST: ROUTE_TYPES.PROTECTED // Type explicite pour POST
});