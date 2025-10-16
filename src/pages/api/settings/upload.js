import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm({
      uploadDir: path.join(process.cwd(), 'public', 'uploads'),
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Upload failed' });
      }
      const file = files.image;
      const newPath = `/uploads/${file.newFilename}`;
      res.status(200).json({ url: newPath });
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}