import { Types } from "mongoose";
import Alert from "@/models/alert.model";
import { IAlert } from "@/interfaces/alert.interface";
import { CreateAlertDto, UpdateAlertDto } from "@/dto/alert.dto";

export class AlertRepository {
  async create(data: CreateAlertDto): Promise<IAlert> {
    return await new Alert(data).save();
  }

  async findAll(): Promise<IAlert[]> {
    return await Alert.find().sort({ createdAt: -1 }).lean();
  }

  async findById(id: Types.ObjectId): Promise<IAlert | null> {
    return await Alert.findById(id).lean();
  }

  async update(id: Types.ObjectId, data: UpdateAlertDto): Promise<IAlert | null> {
    return await Alert.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id: Types.ObjectId): Promise<IAlert | null> {
    return await Alert.findByIdAndDelete(id).lean();
  }
}

export default new AlertRepository();
