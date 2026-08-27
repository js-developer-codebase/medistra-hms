import { Types } from "mongoose";
import Task from "@/models/task.model";
import { ITask } from "@/interfaces/task.interface";
import { CreateTaskDto, UpdateTaskDto } from "@/dto/task.dto";

export class TaskRepository {
  async create(data: CreateTaskDto): Promise<ITask> {
    return await new Task(data).save();
  }

  async findAll(): Promise<ITask[]> {
    return await Task.find()
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email")
      .populate("patientId", "name contact")
      .sort({ createdAt: -1 })
      .lean();
  }

  async findById(id: Types.ObjectId): Promise<ITask | null> {
    return await Task.findById(id)
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email")
      .populate("patientId", "name contact")
      .lean();
  }

  async findByAssignedTo(userId: Types.ObjectId): Promise<ITask[]> {
    return await Task.find({ assignedTo: userId })
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email")
      .populate("patientId", "name contact")
      .sort({ dueDate: 1 })
      .lean();
  }

  async update(id: Types.ObjectId, data: UpdateTaskDto): Promise<ITask | null> {
    return await Task.findByIdAndUpdate(id, data, { new: true })
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email")
      .populate("patientId", "name contact")
      .lean();
  }

  async delete(id: Types.ObjectId): Promise<ITask | null> {
    return await Task.findByIdAndDelete(id).lean();
  }
}

export default new TaskRepository();
