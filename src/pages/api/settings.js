import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const filePath = path.join(process.cwd(), 'data', 'settings.json');
    const data = fs.readFileSync(filePath, 'utf8');
    res.status(200).json(JSON.parse(data));
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}