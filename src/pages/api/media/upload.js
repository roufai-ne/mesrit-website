// src/pages/api/media/upload.js
import multer from 'multer';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({
  storage: multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté'), false);
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
}).array('files');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const files = req.files.map(file => ({
      id: path.basename(file.filename, path.extname(file.filename)),
      name: file.originalname,
      url: `/uploads/${file.filename}`,
      type: file.mimetype,
      size: file.size
    }));

    res.status(200).json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}