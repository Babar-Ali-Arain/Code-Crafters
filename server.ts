import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Force JSON and urlencoded body parsing for standard API endpoints
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Set up multer for processing multipart uploads in memory
  const upload = multer({ storage: multer.memoryStorage() });

  // API Route - ImageKit secure upload proxy which bypasses browser CORS restrictions
  app.post("/api/upload-imagekit", upload.single("file"), async (req, res) => {
    try {
      console.log('Upload request received');
      console.log('Body keys:', Object.keys(req.body));
      console.log('Has file:', !!req.file);
      if (req.file) {
        console.log('File mimetype:', req.file.mimetype);
        console.log('File size:', req.file.size);
      }
      const fileName = req.body.fileName;
      const folder = req.body.folder || "/general";
      const privateKey = req.body.privateKey;

      if (!privateKey) {
        return res.status(400).json({ message: "ImageKit private key missing. Config this resource in Settings Dashboard." });
      }

      let fileData: Blob | string;
      let originalName = fileName || "file";

      if (req.file) {
        // Convert multer buffer to real blob
        fileData = new Blob([req.file.buffer], { type: req.file.mimetype });
        originalName = fileName || req.file.originalname;
      } else if (req.body.file) {
        // Retrieve base64 or other text representation
        fileData = req.body.file;
      } else {
        return res.status(400).json({ message: "No file binary or string data was declared in the request." });
      }

      // Populate body inputs following ImageKit specifications
      const formData = new FormData();
      if (fileData instanceof Blob) {
        formData.append("file", fileData, originalName);
      } else {
        formData.append("file", fileData);
      }
      formData.append("fileName", originalName);
      formData.append("useUniqueFileName", "true");
      formData.append("folder", folder);

      // Create Basic Authorization Header
      const basicAuthToken = Buffer.from(privateKey + ":").toString("base64");

      const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuthToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("ImageKit server upload error status:", response.status, errText);
        return res.status(response.status).json({ message: errText });
      }

      const result = await response.json();
      res.json(result);
    } catch (error: any) {
      console.error("Server-side upload error handler caught:", error);
      res.status(500).json({ message: error.message || "Internal Server Proxy Error" });
    }
  });

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy" });
  });

  // Catch-all route for any unhandled api endpoints - guarantees we return JSON, never HTML
  app.all("/api/*", (req, res) => {
    res.status(404).json({ 
      message: `API endpoint ${req.method} ${req.path} not found or unsupported.`,
      error: "ApiRouteNotFound"
    });
  });

  // Vite middleware for development (hot reloading and static development files asset serving)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production asset pipelines loading
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully booting on http://localhost:${PORT}`);
  });
}

startServer();
