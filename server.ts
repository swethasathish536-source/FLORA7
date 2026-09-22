import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/routes/api';

// Create storage directories if they don't exist
const publicImagesDir = path.join(process.cwd(), 'public', 'images');
const dataUploadsDir = path.join(process.cwd(), 'data', 'uploads');
[publicImagesDir, dataUploadsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Fallback images for bouquet types if uploaded file was purged
const BOUQUET_FALLBACKS: Record<string, string> = {
  'single': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000',
  'pearl': 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&q=80&w=1000',
  '3-rose': 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=1000',
  '5-rose': 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&q=80&w=1000',
  '7-rose': 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80&w=1000',
  '9-rose': 'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&q=80&w=1000',
  'keychain': 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&q=80&w=1000',
  'default': 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80&w=1000'
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(cookieParser());

  // Mount API routes FIRST
  app.use('/api', apiRouter);

  // Dedicated image serving endpoint for uploaded bouquet photos
  const serveImageHandler = (req: express.Request, res: express.Response) => {
    const filename = req.params.filename || '';
    const safeFilename = path.basename(filename);

    const candidates = [
      path.join(publicImagesDir, safeFilename),
      path.join(dataUploadsDir, safeFilename),
      path.join(process.cwd(), 'dist', 'images', safeFilename)
    ];

    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.sendFile(filePath);
      }
    }

    // If file is missing, redirect/stream matching high-res satin rose photography fallback
    const lower = safeFilename.toLowerCase();
    let fallbackUrl = BOUQUET_FALLBACKS['default'];

    if (lower.includes('single') || lower.includes('17866831') || lower.includes('17866838')) {
      fallbackUrl = BOUQUET_FALLBACKS['single'];
    } else if (lower.includes('keychain') || lower.includes('17866842')) {
      fallbackUrl = BOUQUET_FALLBACKS['keychain'];
    } else if (lower.includes('5-rose') || lower.includes('17866835')) {
      fallbackUrl = BOUQUET_FALLBACKS['5-rose'];
    } else if (lower.includes('7-rose') || lower.includes('17866822') || lower.includes('17866824')) {
      fallbackUrl = BOUQUET_FALLBACKS['7-rose'];
    } else if (lower.includes('9-rose')) {
      fallbackUrl = BOUQUET_FALLBACKS['9-rose'];
    }

    return res.redirect(fallbackUrl);
  };

  app.get('/images/:filename', serveImageHandler);
  app.get('/uploads/:filename', serveImageHandler);

  // Dedicated Android APK direct download endpoints
  const serveApkHandler = (req: express.Request, res: express.Response) => {
    const apkCandidates = [
      path.join(process.cwd(), 'public', 'flora7.apk'),
      path.join(process.cwd(), 'dist', 'flora7.apk'),
      '/tmp/android-build/flora7.apk'
    ];
    for (const apkPath of apkCandidates) {
      if (fs.existsSync(apkPath)) {
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        res.setHeader('Content-Disposition', 'attachment; filename="Flora7-LoveUnfolded.apk"');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return res.sendFile(apkPath);
      }
    }
    return res.status(404).send('APK is being generated, please refresh in a moment.');
  };

  app.get('/flora7.apk', serveApkHandler);
  app.get('/flora7-loveunfolded.apk', serveApkHandler);
  app.get('/download-apk', serveApkHandler);
  app.get('/api/download-apk', serveApkHandler);

  // Serve static public folder (manifest, icons, static assets)
  app.use(express.static(path.join(process.cwd(), 'public')));
  app.use('/uploads', express.static(dataUploadsDir));

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 FLORA7 Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
