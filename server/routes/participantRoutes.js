import { Router } from "express";
import {
  registerParticipant,
  getParticipants,
  getParticipantById,
  deleteParticipant,
  getDashboardStats,
} from "../controllers/participantController.js";

const router = Router();

// Registration
router.post("/register", registerParticipant);

// Participants query
router.get("/participants", getParticipants);

// Participant detail & deletion
router.get("/participant/:id", getParticipantById);
router.delete("/participant/:id", deleteParticipant);

// Analytics & Dashboard statistics
router.get("/stats", getDashboardStats);

export default router;
