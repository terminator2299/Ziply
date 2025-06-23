const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 5001;

const corsOptions = {
  origin: 'http://localhost:3000',
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
  const filePath = req.file.path;
  const outputFileName = `compressed-${req.file.originalname}`;
  const outputPath = path.join(__dirname, 'uploads', outputFileName);

  try {
    // Start with a high quality and gradually decrease until we hit target size
    let quality = 100;
    let currentSize = Infinity;
    const targetSize = targetSizeKB * 1024; // Convert KB to bytes

    while (quality > 5 && currentSize > targetSize) {
      await sharp(filePath)
        .jpeg({ quality })
        .toFile(outputPath);
      
      const stats = await fs.promises.stat(outputPath);
      currentSize = stats.size;
      
      if (currentSize > targetSize) {
        // Decrease quality more aggressively if we're far from target
        const sizeDiff = currentSize - targetSize;
        quality -= Math.max(5, Math.min(20, Math.floor(sizeDiff / targetSize * 30)));
      }
    }

    res.download(outputPath, outputFileName, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Clean up uploaded and processed files
      fs.unlinkSync(filePath);
      fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    res.status(500).send('Error compressing image.');
    fs.unlinkSync(filePath); // Clean up original upload on error
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
  console.log(`Server running on http://localhost:${port}`);
}); 