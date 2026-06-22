import mongoose, { Schema } from "mongoose";
import { getDbStatus, LocalDB } from "../config/db.js";

// Mongoose schema definition
const ParticipantSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String, required: true },
  workshop: { type: String, required: true },
  organization: { type: String, required: true },
  registrationDate: { type: Date, default: Date.now },
  confirmationStatus: { type: String, enum: ["Confirmed", "Pending", "Cancelled"], default: "Confirmed" },
  referenceId: { type: String, required: true, unique: true },
});

// Register the compiler mode model safely
export const MongoParticipant =
  mongoose.models.Participant || mongoose.model("Participant", ParticipantSchema);

export class ParticipantModel {
  /**
   * Create a new registration
   */
  static async create(data) {
    const emailLower = (data.email || "").trim().toLowerCase();
    
    // Check duplication globally first
    const existing = await this.findByEmail(emailLower);
    if (existing) {
      throw new Error(`Email "${emailLower}" is already registered for a workshop.`);
    }

    const referenceId = `REG-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`;
    const recordData = {
      name: (data.name || "").trim(),
      email: emailLower,
      phone: (data.phone || "").trim(),
      workshop: data.workshop || "",
      organization: (data.organization || "").trim(),
      registrationDate: data.registrationDate || new Date(),
      confirmationStatus: data.confirmationStatus || "Confirmed",
      referenceId,
    };

    const status = getDbStatus();
    if (status.connected) {
      return await MongoParticipant.create(recordData);
    } else {
      const participants = LocalDB.read();
      const newRecord = {
        id: Math.random().toString(36).substring(2, 11),
        ...recordData,
        registrationDate: recordData.registrationDate.toISOString(),
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
      const results = await MongoParticipant.find(query)
        .sort({ registrationDate: -1 })
        .skip(skip)
        .limit(limit);

      return { total, results, page, limit };
    } else {
      let results = LocalDB.read();

      // Filter by workshop category
      if (options.workshop) {
        results = results.filter(p => p.workshop === options.workshop);
      }

      // Free-text keyword search
      if (options.search) {
        const term = options.search.toLowerCase();
        results = results.filter(
          p =>
            p.name.toLowerCase().includes(term) ||
            p.email.toLowerCase().includes(term) ||
            p.organization.toLowerCase().includes(term) ||
            p.phone.includes(term) ||
            p.referenceId.toLowerCase().includes(term)
        );
      }

      // Sort chronological descending
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
      return participants.find(p => p.id === id || p._id === id) || null;
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
      return participants.find(p => p.email.toLowerCase() === cleanEmail) || null;
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
      const index = participants.findIndex(p => p.id === id || p._id === id);
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
      aggregation.forEach(item => {
        if (item._id) {
          workshopCounts[item._id] = item.count;
        }
      });

      return { total, workshopCounts };
    } else {
      const participants = LocalDB.read();
      const total = participants.length;
      const workshopCounts = {};
      
      participants.forEach(p => {
        if (p.workshop) {
          workshopCounts[p.workshop] = (workshopCounts[p.workshop] || 0) + 1;
        }
      });

      return { total, workshopCounts };
    }
  }
}
