const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = express.Router();

// store uploads under server/uploads/projects
const uploadDir = path.join(__dirname, "..", "..", "..", "uploads", "projects");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `project_${Date.now()}${Math.floor(Math.random() * 1000)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage });

router.post("/:projectId/image", upload.single("image"), async (req, res) => {
  try {
    const { projectId } = req.params;
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });
    const imageUrl = `/uploads/projects/${file.filename}`;
    const updated = await prisma.project.update({
      where: { projectID: BigInt(Number(projectId)) },
      data: { projectImageUrl: imageUrl },
    });
    res.json({ item: updated });
  } catch (err) {
    console.error("upload image error", err);
    res.status(500).json({ error: String(err?.message || err) });
  }
});

module.exports = router;
