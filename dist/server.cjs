var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.js
var import_express2 = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_vite = require("vite");

// server/config/db.js
var import_mongoose = __toESM(require("mongoose"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var isMongoConnected = false;
var dbStatusMessage = "Initializing database...";
var useLocalFallback = false;
async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    useLocalFallback = true;
    isMongoConnected = false;
    dbStatusMessage = "No MONGODB_URI found. Running in Local Sandbox File Mode.";
    console.log("\u26A0\uFE0F  " + dbStatusMessage);
    return;
  }
  try {
    import_mongoose.default.set("strictQuery", false);
    await import_mongoose.default.connect(mongoUri, {
      serverSelectionTimeoutMS: 5e3
    });
    isMongoConnected = true;
    useLocalFallback = false;
    dbStatusMessage = "Successfully connected to MongoDB Atlas.";
    console.log("\u{1F50C} " + dbStatusMessage);
  } catch (error) {
    isMongoConnected = false;
    useLocalFallback = true;
    dbStatusMessage = `Failed to connect to MongoDB Atlas (${error.message || error}). Running in Local Sandbox File Mode.`;
    console.log("\u26A0\uFE0F  " + dbStatusMessage);
  }
}
function getDbStatus() {
  return {
    connected: isMongoConnected,
    fallback: useLocalFallback,
    message: dbStatusMessage,
    type: isMongoConnected ? "MongoDB Atlas" : "Local Sandbox (JSON File)"
  };
}
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var FILE_PATH = import_path.default.join(DATA_DIR, "participants.json");
if (!import_fs.default.existsSync(DATA_DIR)) {
  import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
}
if (!import_fs.default.existsSync(FILE_PATH)) {
  import_fs.default.writeFileSync(FILE_PATH, JSON.stringify([], null, 2));
}
var LocalDB = {
  read() {
    try {
      if (!import_fs.default.existsSync(FILE_PATH)) {
        return [];
      }
      const data = import_fs.default.readFileSync(FILE_PATH, "utf8");
      return JSON.parse(data);
    } catch (err) {
      console.error("Error reading fallback JSON database", err);
      return [];
    }
  },
  write(participants) {
    try {
      import_fs.default.writeFileSync(FILE_PATH, JSON.stringify(participants, null, 2));
    } catch (err) {
      console.error("Error writing fallback JSON database", err);
    }
  }
};

// server/routes/participantRoutes.js
var import_express = require("express");

// server/models/participant.js
var import_mongoose2 = __toESM(require("mongoose"), 1);
var ParticipantSchema = new import_mongoose2.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String, required: true },
  workshop: { type: String, required: true },
  organization: { type: String, required: true },
  registrationDate: { type: Date, default: Date.now },
  confirmationStatus: { type: String, enum: ["Confirmed", "Pending", "Cancelled"], default: "Confirmed" },
  referenceId: { type: String, required: true, unique: true }
});
var MongoParticipant = import_mongoose2.default.models.Participant || import_mongoose2.default.model("Participant", ParticipantSchema);
var ParticipantModel = class {
  /**
   * Create a new registration
   */
  static async create(data) {
    const emailLower = (data.email || "").trim().toLowerCase();
    const existing = await this.findByEmail(emailLower);
    if (existing) {
      throw new Error(`Email "${emailLower}" is already registered for a workshop.`);
    }
    const referenceId = `REG-${(/* @__PURE__ */ new Date()).getFullYear()}-${Math.floor(Math.random() * 9e4 + 1e4)}`;
    const recordData = {
      name: (data.name || "").trim(),
      email: emailLower,
      phone: (data.phone || "").trim(),
      workshop: data.workshop || "",
      organization: (data.organization || "").trim(),
      registrationDate: data.registrationDate || /* @__PURE__ */ new Date(),
      confirmationStatus: data.confirmationStatus || "Confirmed",
      referenceId
    };
    const status = getDbStatus();
    if (status.connected) {
      return await MongoParticipant.create(recordData);
    } else {
      const participants = LocalDB.read();
      const newRecord = {
        id: Math.random().toString(36).substring(2, 11),
        ...recordData,
        registrationDate: recordData.registrationDate.toISOString()
      };
      participants.push(newRecord);
      LocalDB.write(participants);
      return newRecord;
    }
  }
  /**
   * Search, filter, and paginate participant list
   */
  static async find(options = {}) {
    const status = getDbStatus();
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, options.limit || 10);
    const skip = (page - 1) * limit;
    if (status.connected) {
      const query = {};
      if (options.workshop) {
        query.workshop = options.workshop;
      }
      if (options.search) {
        const searchRegex = new RegExp(options.search, "i");
        query.$or = [
          { name: searchRegex },
          { email: searchRegex },
          { organization: searchRegex },
          { phone: searchRegex },
          { referenceId: searchRegex }
        ];
      }
      const total = await MongoParticipant.countDocuments(query);
      const results = await MongoParticipant.find(query).sort({ registrationDate: -1 }).skip(skip).limit(limit);
      return { total, results, page, limit };
    } else {
      let results = LocalDB.read();
      if (options.workshop) {
        results = results.filter((p) => p.workshop === options.workshop);
      }
      if (options.search) {
        const term = options.search.toLowerCase();
        results = results.filter(
          (p) => p.name.toLowerCase().includes(term) || p.email.toLowerCase().includes(term) || p.organization.toLowerCase().includes(term) || p.phone.includes(term) || p.referenceId.toLowerCase().includes(term)
        );
      }
      results.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());
      const total = results.length;
      const paginatedResults = results.slice(skip, skip + limit);
      return { total, results: paginatedResults, page, limit };
    }
  }
  /**
   * Retrieve single participant by ID
   */
  static async findById(id) {
    const status = getDbStatus();
    if (status.connected) {
      return await MongoParticipant.findById(id);
    } else {
      const participants = LocalDB.read();
      return participants.find((p) => p.id === id || p._id === id) || null;
    }
  }
  /**
   * Lookup participant by unique email
   */
  static async findByEmail(email) {
    const cleanEmail = email.trim().toLowerCase();
    const status = getDbStatus();
    if (status.connected) {
      return await MongoParticipant.findOne({ email: cleanEmail });
    } else {
      const participants = LocalDB.read();
      return participants.find((p) => p.email.toLowerCase() === cleanEmail) || null;
    }
  }
  /**
   * Delete participant by ID
   */
  static async findByIdAndDelete(id) {
    const status = getDbStatus();
    if (status.connected) {
      return await MongoParticipant.findByIdAndDelete(id);
    } else {
      const participants = LocalDB.read();
      const index = participants.findIndex((p) => p.id === id || p._id === id);
      if (index === -1) return null;
      const deleted = participants.splice(index, 1)[0];
      LocalDB.write(participants);
      return deleted;
    }
  }
  /**
   * Aggregate statistics for total registered and workshop breakups
   */
  static async getStats() {
    const status = getDbStatus();
    if (status.connected) {
      const total = await MongoParticipant.countDocuments();
      const aggregation = await MongoParticipant.aggregate([
        { $group: { _id: "$workshop", count: { $sum: 1 } } }
      ]);
      const workshopCounts = {};
      aggregation.forEach((item) => {
        if (item._id) {
          workshopCounts[item._id] = item.count;
        }
      });
      return { total, workshopCounts };
    } else {
      const participants = LocalDB.read();
      const total = participants.length;
      const workshopCounts = {};
      participants.forEach((p) => {
        if (p.workshop) {
          workshopCounts[p.workshop] = (workshopCounts[p.workshop] || 0) + 1;
        }
      });
      return { total, workshopCounts };
    }
  }
};

// server/utils/email.js
var import_nodemailer = __toESM(require("nodemailer"), 1);
async function sendConfirmationEmail(participant) {
  const { name, email, workshop, referenceId, organization } = participant;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const sendFrom = process.env.SMTP_FROM || "workshops@organization.edu";
  const emailSubject = `Workshop Registration Confirmed: ${workshop}`;
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #3b82f6; padding-bottom: 16px;">
        <h1 style="color: #1e3a8a; margin: 0; font-size: 24px; font-weight: 700;">Workshop Confirmation</h1>
        <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Academic & Professional Development</p>
      </div>
      
      <p style="color: #334155; font-size: 16px; line-height: 1.5;">Dear <strong>${name}</strong>,</p>
      <p style="color: #334155; font-size: 15px; line-height: 1.5;">Congratulations! Your registration for the upcoming workshop has been successfully confirmed. Below are your registration details:</p>
      
      <div style="background-color: #f8fafc; border-radius: 6px; padding: 16px; margin: 20px 0; border-left: 4px solid #3b82f6;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500; width: 140px;">Reference ID:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 700; font-family: monospace; font-size: 16px;">${referenceId}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Workshop Name:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${workshop}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Participant Name:</td>
            <td style="padding: 6px 0; color: #0f172a;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Email & Contact:</td>
            <td style="padding: 6px 0; color: #0f172a;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">College/Organization:</td>
            <td style="padding: 6px 0; color: #0f172a;">${organization}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Status:</td>
            <td style="padding: 6px 0;"><span style="background-color: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 600;">CONFIRMED</span></td>
          </tr>
        </table>
      </div>

      <p style="color: #334155; font-size: 14px; line-height: 1.5; margin-top: 20px;">
        Please keep this confirmation number handy for event attendance check-ins. If you have any questions or need to cancel/change your registration, please contact our support team.
      </p>
      
      <div style="text-align: center; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 20px; color: #94a3b8; font-size: 12px;">
        <p style="margin: 0;">This is an automated confirmation message. Do not reply directly to this mail.</p>
        <p style="margin: 4px 0 0 0;">Workshop Coordination Committee &copy; 2026</p>
      </div>
    </div>
  `;
  if (smtpHost && smtpUser && smtpPass) {
    try {
      console.log(`\u2709\uFE0F Attempting to send real SMTP confirmation to ${email}...`);
      const transporter = import_nodemailer.default.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        // Use SSL/TLS for 465, STARTTLS otherwise
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
      const info = await transporter.sendMail({
        from: sendFrom,
        to: email,
        subject: emailSubject,
        html: htmlContent
      });
      console.log(`\u2705 Mail sent successfully! MessageId: ${info.messageId}`);
      return {
        sent: true,
        status: `Mail delivered to ${email}`,
        recipient: email
      };
    } catch (err) {
      console.error("\u274C SMTP Error occurred:", err);
      return {
        sent: false,
        status: `Failed to deliver email: ${err.message || err}`,
        recipient: email
      };
    }
  } else {
    console.log("\n==================================================");
    console.log("\u{1F4E8} SIMULATED EMAIL TRANSMISSION");
    console.log(`To: ${email}`);
    console.log(`From: ${sendFrom}`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`Reference ID: ${referenceId}`);
    console.log("--------------------------------------------------");
    console.log(`Dear ${name}, your seat in the "${workshop}" is confirmed!`);
    console.log("==================================================\n");
    return {
      sent: true,
      status: "Dev Sandbox Simulation: Email successfully logged to system console.",
      recipient: email,
      bodyPreview: `Reference ID: ${referenceId}, Workshop: ${workshop}`
    };
  }
}

// server/controllers/participantController.js
var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var phoneRegex = /^\+?[\d\s\-()]{7,18}$/;
async function registerParticipant(req, res, next) {
  try {
    const { name, email, phone, workshop, organization } = req.body;
    const missingFields = [];
    if (!name || !name.trim()) missingFields.push("Full Name");
    if (!email || !email.trim()) missingFields.push("Email Address");
    if (!phone || !phone.trim()) missingFields.push("Phone Number");
    if (!workshop || !workshop.trim()) missingFields.push("Workshop Selection");
    if (!organization || !organization.trim()) missingFields.push("College/Organization");
    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        error: `Please complete all required fields: ${missingFields.join(", ")}`
      });
      return;
    }
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();
    if (!emailRegex.test(cleanEmail)) {
      res.status(400).json({
        success: false,
        error: "Please enter a valid email address."
      });
      return;
    }
    if (!phoneRegex.test(cleanPhone)) {
      res.status(400).json({
        success: false,
        error: "Please enter a valid phone number (minimum 7 digits)."
      });
      return;
    }
    const newParticipant = await ParticipantModel.create({
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      workshop,
      organization: organization.trim()
    });
    const emailInfo = await sendConfirmationEmail({
      name: newParticipant.name,
      email: newParticipant.email,
      workshop: newParticipant.workshop,
      referenceId: newParticipant.referenceId,
      organization: newParticipant.organization
    });
    res.status(201).json({
      success: true,
      message: emailInfo.sent ? "Registration successful! A confirmation email has been dispatched." : "Registration successful! (Notification simulation logged to console).",
      participant: newParticipant,
      emailStatus: emailInfo.status
    });
  } catch (error) {
    next(error);
  }
}
async function getParticipants(req, res, next) {
  try {
    const search = req.query.search ? String(req.query.search).trim() : void 0;
    const workshop = req.query.workshop ? String(req.query.workshop).trim() : void 0;
    const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
    const data = await ParticipantModel.find({
      search,
      workshop,
      page,
      limit
    });
    res.status(200).json({
      success: true,
      ...data
    });
  } catch (error) {
    next(error);
  }
}
async function getParticipantById(req, res, next) {
  try {
    const { id } = req.params;
    const participant = await ParticipantModel.findById(id);
    if (!participant) {
      res.status(404).json({
        success: false,
        error: "Participant registration record not found."
      });
      return;
    }
    res.status(200).json({
      success: true,
      participant
    });
  } catch (error) {
    next(error);
  }
}
async function deleteParticipant(req, res, next) {
  try {
    const { id } = req.params;
    const participantDeleted = await ParticipantModel.findByIdAndDelete(id);
    if (!participantDeleted) {
      res.status(404).json({
        success: false,
        error: "Participant registration record not found."
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Participant registration cancelled successfully.",
      participant: participantDeleted
    });
  } catch (error) {
    next(error);
  }
}
async function getDashboardStats(req, res, next) {
  try {
    const stats = await ParticipantModel.getStats();
    const dbStatus = getDbStatus();
    res.status(200).json({
      success: true,
      stats,
      dbStatus
    });
  } catch (error) {
    next(error);
  }
}

// server/routes/participantRoutes.js
var router = (0, import_express.Router)();
router.post("/register", registerParticipant);
router.get("/participants", getParticipants);
router.get("/participant/:id", getParticipantById);
router.delete("/participant/:id", deleteParticipant);
router.get("/stats", getDashboardStats);
var participantRoutes_default = router;

// server/middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error("\u274C App Error Intercepted:", err);
  const statusCode = err.status || err.statusCode || 500;
  let errorMessage = err.message || "An unexpected system error occurred.";
  if (err.code === 11e3) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    errorMessage = `This ${field} is already registered. Please use a unique ${field}.`;
    return res.status(400).json({
      success: false,
      error: errorMessage
    });
  }
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      error: `Validation Error: ${messages.join(", ")}`
    });
  }
  res.status(statusCode).json({
    success: false,
    error: errorMessage
  });
}

// server.js
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express2.default)();
  const PORT = 3e3;
  await connectDB();
  app.use((0, import_cors.default)());
  app.use(import_express2.default.json());
  app.use(import_express2.default.urlencoded({ extended: true }));
  app.use("/api", participantRoutes_default);
  if (process.env.NODE_ENV !== "production") {
    console.log("\u{1F6E0}\uFE0F Starting Vite server as middleware for development...");
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("\u{1F310} Production mode: Serving compiled assets from /dist...");
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express2.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app.use(errorHandler);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u26A1 Full-Stack Server booted and running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("\u{1F6A8} Critical Server Boot Exception:", err);
});
//# sourceMappingURL=server.cjs.map
