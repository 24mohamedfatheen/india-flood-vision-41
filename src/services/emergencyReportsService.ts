
import { supabase } from '../integrations/supabase/client';

export interface EmergencyReport {
  id: string;
  name: string;
  contactNumber: string;
  location: string;
  numPeople: string;
  hasDisabled: boolean;
  hasMedicalNeeds: boolean;
  medicalDetails: string;
  hasWaterFood: boolean;
  waterFoodDuration: string;
  situationDescription: string;
  urgencyLevel: 'low' | 'medium' | 'high';
  timestamp: string;
  status: 'pending' | 'in_progress' | 'resolved';
}

// In-memory storage for demo (in production, this would be in Supabase)
let emergencyReports: EmergencyReport[] = [];

export const submitEmergencyReport = async (report: Omit<EmergencyReport, 'id' | 'timestamp' | 'status'>): Promise<string> => {
  const newReport: EmergencyReport = {
    ...report,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    status: 'pending'
  };
  
  emergencyReports.push(newReport);
  console.log('Emergency report submitted:', newReport);
  return newReport.id;
};

export const getEmergencyReports = async (): Promise<EmergencyReport[]> => {
  return emergencyReports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const updateReportStatus = async (reportId: string, status: EmergencyReport['status']): Promise<void> => {
  const reportIndex = emergencyReports.findIndex(r => r.id === reportId);
  if (reportIndex !== -1) {
    emergencyReports[reportIndex].status = status;
  }
};
