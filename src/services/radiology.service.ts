import RadiologyOrder from "@/models/radiology-order.model";
import ImagingStudy from "@/models/imaging-study.model";

export class RadiologyService {
  async getOrders() {
    return RadiologyOrder.find().populate("patient doctor").sort({ createdAt: -1 });
  }

  async createOrder(data: any) {
    return RadiologyOrder.create(data);
  }

  async getStudies() {
    return ImagingStudy.find().populate("order patient technician radiologist").sort({ createdAt: -1 });
  }
}

export default new RadiologyService();
