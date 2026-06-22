import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { connectDB } from "./server/config/db.js";
import participantRoutes from "./server/routes/participantRoutes.js";
import { errorHandler } from "./server/middleware/errorHandler.js";

// Load environment configurations
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Establish database connection (with file-system fallback)
  await connectDB();

  // 2. Base middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 3. Mount Backend API Routing
  app.use("/api", participantRoutes);

  // 4. Vite Dev Server / Static Hosting configuration
  if (process.env.NODE_ENV !== "production") {
    console.log("🛠️ Starting Vite server as middleware for development...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("🌐 Production mode: Serving compiled assets from /dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // 5. Global Exception Interceptor Middleware
  app.use(errorHandler);

  // 6. Bind to Host & Access Port
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`⚡ Full-Stack Server booted and running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("🚨 Critical Server Boot Exception:", err);
});
