import { Types } from "mongoose";
import alertRepository, { AlertRepository } from "@/repositories/alert.repository";
import { CreateAlertDto, UpdateAlertDto } from "@/dto/alert.dto";
import { IAlert } from "@/interfaces/alert.interface";

export class AlertService {
  constructor(private repo: AlertRepository = alertRepository) {}

  async createAlert(data: CreateAlertDto): Promise<IAlert> {
    return await this.repo.create(data);
  }

  async getAllAlerts(): Promise<IAlert[]> {
    return await this.repo.findAll();
  }

  async getAlertById(id: string): Promise<IAlert | null> {
    return await this.repo.findById(new Types.ObjectId(id));
  }

  async updateAlert(id: string, data: UpdateAlertDto): Promise<IAlert | null> {
    return await this.repo.update(new Types.ObjectId(id), data);
  }

  async deleteAlert(id: string): Promise<IAlert | null> {
    return await this.repo.delete(new Types.ObjectId(id));
  }
}

export const alertService = new AlertService();
