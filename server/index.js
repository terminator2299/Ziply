const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Placeholder endpoint for image compression
app.post('/api/compress-image', upload.single('image'), (req, res) => {
  // TODO: Implement image compression
  res.json({ message: 'Image compression endpoint' });
});

// Placeholder endpoint for PDF merging
app.post('/api/merge-pdf', upload.array('pdfs'), (req, res) => {
  // TODO: Implement PDF merging
  res.json({ message: 'PDF merging endpoint' });
});

// Placeholder endpoint for image format conversion
app.post('/api/convert-image', upload.single('image'), (req, res) => {
  // TODO: Implement image format conversion
  res.json({ message: 'Image format conversion endpoint' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
}); 