import { Types } from "mongoose";
import taskRepository, { TaskRepository } from "@/repositories/task.repository";
import { CreateTaskDto, UpdateTaskDto } from "@/dto/task.dto";
import { ITask } from "@/interfaces/task.interface";

export class TaskService {
  constructor(private repo: TaskRepository = taskRepository) {}

  async createTask(data: CreateTaskDto): Promise<ITask> {
    return await this.repo.create(data);
  }

  async getAllTasks(): Promise<ITask[]> {
    return await this.repo.findAll();
  }

  async getTaskById(id: string): Promise<ITask | null> {
    return await this.repo.findById(new Types.ObjectId(id));
  }

  async getTasksByAssignedUser(userId: string): Promise<ITask[]> {
    return await this.repo.findByAssignedTo(new Types.ObjectId(userId));
  }

  async updateTask(id: string, data: UpdateTaskDto): Promise<ITask | null> {
    return await this.repo.update(new Types.ObjectId(id), data);
  }

  async deleteTask(id: string): Promise<ITask | null> {
    return await this.repo.delete(new Types.ObjectId(id));
  }
}

export const taskService = new TaskService();
