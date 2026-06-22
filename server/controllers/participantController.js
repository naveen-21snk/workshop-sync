import { ParticipantModel } from "../models/participant.js";
import { sendConfirmationEmail } from "../utils/email.js";
import { getDbStatus } from "../config/db.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Supports standard phone numbers with optional +, spaces, dashes, or parentheses
const phoneRegex = /^\+?[\d\s\-()]{7,18}$/;

/**
 * Register Participant handler
 * POST /api/register
 */
export async function registerParticipant(req, res, next) {
  try {
    const { name, email, phone, workshop, organization } = req.body;

    // 1. Validate Required Fields
    const missingFields = [];
    if (!name || !name.trim()) missingFields.push("Full Name");
    if (!email || !email.trim()) missingFields.push("Email Address");
    if (!phone || !phone.trim()) missingFields.push("Phone Number");
    if (!workshop || !workshop.trim()) missingFields.push("Workshop Selection");
    if (!organization || !organization.trim()) missingFields.push("College/Organization");

    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        error: `Please complete all required fields: ${missingFields.join(", ")}`,
      });
      return;
    }

    // 2. Validate Formats
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!emailRegex.test(cleanEmail)) {
      res.status(400).json({
        success: false,
        error: "Please enter a valid email address.",
      });
      return;
    }

    if (!phoneRegex.test(cleanPhone)) {
      res.status(400).json({
        success: false,
        error: "Please enter a valid phone number (minimum 7 digits).",
      });
      return;
    }

    // 3. Persist to DB (Mongoose handles duplicates on MongoDB, local DB handles them in the model)
    const newParticipant = await ParticipantModel.create({
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      workshop,
      organization: organization.trim(),
    });

    // 4. Send Confirmation Email (SMTP or simulation)
    const emailInfo = await sendConfirmationEmail({
      name: newParticipant.name,
      email: newParticipant.email,
      workshop: newParticipant.workshop,
      referenceId: newParticipant.referenceId,
      organization: newParticipant.organization,
    });

    res.status(201).json({
      success: true,
      message: emailInfo.sent
        ? "Registration successful! A confirmation email has been dispatched."
        : "Registration successful! (Notification simulation logged to console).",
      participant: newParticipant,
      emailStatus: emailInfo.status,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List participants with searching, filtering & pagination
 * GET /api/participants
 */
export async function getParticipants(req, res, next) {
  try {
    const search = req.query.search ? String(req.query.search).trim() : undefined;
    const workshop = req.query.workshop ? String(req.query.workshop).trim() : undefined;
    const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;

    const data = await ParticipantModel.find({
      search,
      workshop,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single participant detail by ID
 * GET /api/participant/:id
 */
export async function getParticipantById(req, res, next) {
  try {
    const { id } = req.params;
    const participant = await ParticipantModel.findById(id);

    if (!participant) {
      res.status(404).json({
        success: false,
        error: "Participant registration record not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      participant,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Cancel/Delete participant registration by ID
 * DELETE /api/participant/:id
 */
export async function deleteParticipant(req, res, next) {
  try {
    const { id } = req.params;
    const participantDeleted = await ParticipantModel.findByIdAndDelete(id);

    if (!participantDeleted) {
      res.status(404).json({
        success: false,
        error: "Participant registration record not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Participant registration cancelled successfully.",
      participant: participantDeleted,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Fetch stats for dashboard
 * GET /api/stats
 */
export async function getDashboardStats(req, res, next) {
  try {
    const stats = await ParticipantModel.getStats();
    const dbStatus = getDbStatus();

    res.status(200).json({
      success: true,
      stats,
      dbStatus,
    });
  } catch (error) {
    next(error);
  }
}
