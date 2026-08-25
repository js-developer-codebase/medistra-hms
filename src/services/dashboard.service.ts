import DashboardRepository from "@/repositories/dashboard.repository";

class DashboardService {
  async getDashboardStats() {
    const totalPatients = await DashboardRepository.getTotalPatients();
    const totalDoctors = await DashboardRepository.getTotalDoctors();
    const todayAppointments = await DashboardRepository.getTodayAppointments();
    const occupiedBeds = await DashboardRepository.getOccupiedBedsCount();
    const totalBeds = await DashboardRepository.getTotalBedsCount();
    const recentPatientsData = await DashboardRepository.getRecentPatients(5);
    
    const formattedRecent = recentPatientsData.map(p => ({
        name: p.name,
        id: p.uhid || "P-NEW",
        doctor: "Dr. Arup Biswas", 
        status: "Admitted", 
        time: p.createdAt ? new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"
    }));

    return {
      totalPatients,
      totalDoctors,
      todayAppointments,
      occupiedBeds,
      totalBeds,
      recentPatients: formattedRecent
    };
  }
}

export default new DashboardService();
