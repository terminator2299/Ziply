const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 5001;

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://ziply-frontend.onrender.com',
    'https://ziply-taze.onrender.com'
  ],
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Endpoint for image compression
app.post('/api/compress-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No image uploaded.');
  }

  const targetSizeKB = Number(req.body.targetSizeKB) || 500;
  const format = req.body.format || 'jpeg';
  const supportedFormats = ['jpeg', 'webp', 'png'];
  if (!supportedFormats.includes(format)) {
    return res.status(400).send('Unsupported format requested.');
  }
  const filePath = req.file.path;
  const outputFileName = `compressed-${req.file.originalname}.${format}`;
  const outputPath = path.join(__dirname, 'uploads', outputFileName);

  try {
    let quality = 100;
    let currentSize = Infinity;
    const targetSize = targetSizeKB * 1024;
    let buffer = await fs.promises.readFile(filePath);
    let metadata = await sharp(buffer).metadata();
    let width = metadata.width;
    let height = metadata.height;
    let minWidth = Math.max(100, Math.floor(width * 0.1));
    let minHeight = Math.max(100, Math.floor(height * 0.1));
    let resized = false;

    while (quality > 5 && currentSize > targetSize) {
      let sharpInstance = sharp(buffer).resize(width, height);
      if (format === 'jpeg') {
        sharpInstance = sharpInstance.jpeg({ quality });
      } else if (format === 'webp') {
        sharpInstance = sharpInstance.webp({ quality });
      } else if (format === 'png') {
        sharpInstance = sharpInstance.png({ quality });
      }
      await sharpInstance.toFile(outputPath);
      const stats = await fs.promises.stat(outputPath);
      currentSize = stats.size;
      if (currentSize > targetSize) {
        // Decrease quality more aggressively if we're far from target
        const sizeDiff = currentSize - targetSize;
        quality -= Math.max(5, Math.min(20, Math.floor(sizeDiff / targetSize * 30)));
        if (quality <= 5 && !resized && (width > minWidth && height > minHeight)) {
          // If quality is too low, start resizing
          width = Math.floor(width * 0.85);
          height = Math.floor(height * 0.85);
          resized = true;
          quality = 80; // Reset quality a bit higher for new size
        }
      }
    }

    res.download(outputPath, outputFileName, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      fs.unlinkSync(filePath);
      fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    res.status(500).send('Error compressing image.');
    fs.unlinkSync(filePath);
  }
});

// Endpoint for PDF merging
app.post('/api/merge-pdf', upload.array('pdfs'), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No PDF files uploaded.');
  }

  const outputFileName = `merged-${Date.now()}.pdf`;
  const outputPath = path.join(__dirname, 'uploads', outputFileName);

  try {
    const mergedPdf = await PDFDocument.create();
    for (const file of req.files) {
      const pdfBytes = fs.readFileSync(file.path);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
      fs.unlinkSync(file.path); // Clean up individual uploaded PDF
    }

    const mergedPdfBytes = await mergedPdf.save();
    fs.writeFileSync(outputPath, mergedPdfBytes);

    res.download(outputPath, outputFileName, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      fs.unlinkSync(outputPath); // Clean up merged PDF
    });
  } catch (error) {
    console.error('Error merging PDFs:', error);
    res.status(500).send('Error merging PDFs.');
    // Clean up any remaining uploaded files on error
    req.files.forEach(file => fs.unlinkSync(file.path));
  }
});

// Endpoint for image format conversion
app.post('/api/convert-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No image uploaded.');
  }

  const { format = 'png' } = req.body;
  const supportedFormats = ['jpeg', 'png', 'webp', 'gif'];
  if (!supportedFormats.includes(format)) {
    return res.status(400).send('Unsupported format requested.');
  }

  const filePath = req.file.path;
  const outputFileName = `converted-${path.parse(req.file.originalname).name}.${format}`;
  const outputPath = path.join(__dirname, 'uploads', outputFileName);

  try {
    await sharp(filePath)
      .toFormat(format)
      .toFile(outputPath);

    res.download(outputPath, outputFileName, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Clean up uploaded and processed files
      fs.unlinkSync(filePath);
      fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error('Error converting image:', error);
    res.status(500).send('Error converting image.');
    fs.unlinkSync(filePath); // Clean up original upload on error
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 