import { Types } from "mongoose";
import { EmergencyTriage, IEmergencyTriage } from "@/models/emergency-triage.model";
import { CasualtyRecord, ICasualtyRecord } from "@/models/casualty-record.model";

export class EmergencyService {
  // Triage
  async createTriage(data: Partial<IEmergencyTriage>) {
    const triage = new EmergencyTriage(data);
    return await triage.save();
  }
  async getTriages() {
    return await EmergencyTriage.find().sort({ createdAt: -1 });
  }
  async updateTriage(id: Types.ObjectId, data: Partial<IEmergencyTriage>) {
    return await EmergencyTriage.findByIdAndUpdate(id, data, { new: true });
  }
  // Casualty
  async createCasualty(data: Partial<ICasualtyRecord>) {
    const casualty = new CasualtyRecord(data);
    return await casualty.save();
  }
  async getCasualties() {
    return await CasualtyRecord.find().sort({ createdAt: -1 });
  }
}

export default new EmergencyService();
