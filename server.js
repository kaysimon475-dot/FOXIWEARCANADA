const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');

// ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, 'assets', 'img', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-z0-9-_]/gi, '_');
    cb(null, name + '-' + Date.now() + ext);
  }
});
const upload = multer({ storage });

const app = express();
const INDEX_PATH = path.join(__dirname, 'index.html');

app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(__dirname));

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/api/index', (req, res) => {
  fs.readFile(INDEX_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Could not read index.html');
    res.json({ html: data });
  });
});

app.post('/api/save', (req, res) => {
  const html = req.body && req.body.html;
  if (!html) return res.status(400).send('Missing html');

  // create a backup before writing
  const backupPath = INDEX_PATH + '.bak.' + Date.now();
  fs.copyFile(INDEX_PATH, backupPath, (copyErr) => {
    // proceed to write even if backup fails
    fs.writeFile(INDEX_PATH, html, 'utf8', (writeErr) => {
      if (writeErr) return res.status(500).send('Failed to write index.html');
      res.json({ ok: true, backup: path.basename(backupPath) });
    });
  });
});

// file upload endpoint for images
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  // Return a web-accessible path
  const relPath = path.join('/assets/img/uploads', path.basename(req.file.path)).replace(/\\/g, '/');
  res.json({ url: relPath });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Admin server running on http://localhost:${PORT}/admin`));
