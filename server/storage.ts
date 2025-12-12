import { 
  type User, type InsertUser,
  type Patient, type InsertPatient,
  type MedicalRecord, type InsertMedicalRecord,
  type Hospital, type InsertHospital,
  type Ambulance, type InsertAmbulance,
  type SosIncident, type InsertSosIncident,
  type OtpSession, type InsertOtpSession
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getPatient(id: string): Promise<Patient | undefined>;
  getPatientByAbhaId(abhaId: string): Promise<Patient | undefined>;
  getAllPatients(): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  
  getMedicalRecords(patientId: string): Promise<MedicalRecord[]>;
  getMedicalRecord(id: string): Promise<MedicalRecord | undefined>;
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;
  
  getHospitals(): Promise<Hospital[]>;
  getHospital(id: string): Promise<Hospital | undefined>;
  createHospital(hospital: InsertHospital): Promise<Hospital>;
  
  getAmbulances(): Promise<Ambulance[]>;
  getAmbulance(id: string): Promise<Ambulance | undefined>;
  updateAmbulance(id: string, updates: Partial<Ambulance>): Promise<Ambulance | undefined>;
  createAmbulance(ambulance: InsertAmbulance): Promise<Ambulance>;
  
  getIncidents(): Promise<SosIncident[]>;
  getIncident(id: string): Promise<SosIncident | undefined>;
  createIncident(incident: InsertSosIncident): Promise<SosIncident>;
  updateIncident(id: string, updates: Partial<SosIncident>): Promise<SosIncident | undefined>;
  
  createOtpSession(session: InsertOtpSession): Promise<OtpSession>;
  getOtpSession(id: string): Promise<OtpSession | undefined>;
  verifyOtpSession(id: string): Promise<OtpSession | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private patients: Map<string, Patient>;
  private medicalRecords: Map<string, MedicalRecord>;
  private hospitals: Map<string, Hospital>;
  private ambulances: Map<string, Ambulance>;
  private incidents: Map<string, SosIncident>;
  private otpSessions: Map<string, OtpSession>;

  constructor() {
    this.users = new Map();
    this.patients = new Map();
    this.medicalRecords = new Map();
    this.hospitals = new Map();
    this.ambulances = new Map();
    this.incidents = new Map();
    this.otpSessions = new Map();
    
    this.seedData();
  }

  private seedData() {
    const patients: Patient[] = [
      {
        id: "p1",
        abhaId: "ABHA001",
        name: "Rahul Sharma",
        phone: "+91 98765 43210",
        email: "rahul.sharma@email.com",
        dateOfBirth: "1985-03-15",
        bloodGroup: "B+",
        address: "123 MG Road, New Delhi",
        emergencyContact: "+91 98765 43211",
      },
      {
        id: "p2",
        abhaId: "ABHA002",
        name: "Priya Patel",
        phone: "+91 87654 32109",
        email: "priya.patel@email.com",
        dateOfBirth: "1990-07-22",
        bloodGroup: "O+",
        address: "456 Park Street, Mumbai",
        emergencyContact: "+91 87654 32110",
      },
      {
        id: "p3",
        abhaId: "ABHA003",
        name: "Amit Kumar",
        phone: "+91 76543 21098",
        email: "amit.kumar@email.com",
        dateOfBirth: "1978-11-08",
        bloodGroup: "A-",
        address: "789 Lake View, Bangalore",
        emergencyContact: "+91 76543 21099",
      },
      {
        id: "p4",
        abhaId: "ABHA004",
        name: "Sunita Reddy",
        phone: "+91 65432 10987",
        email: "sunita.reddy@email.com",
        dateOfBirth: "1995-01-30",
        bloodGroup: "AB+",
        address: "321 Hill Road, Hyderabad",
        emergencyContact: "+91 65432 10988",
      },
      {
        id: "p5",
        abhaId: "ABHA005",
        name: "Vikram Singh",
        phone: "+91 54321 09876",
        email: "vikram.singh@email.com",
        dateOfBirth: "1982-09-12",
        bloodGroup: "O-",
        address: "654 River Side, Chennai",
        emergencyContact: "+91 54321 09877",
      },
    ];

    patients.forEach((p) => this.patients.set(p.id, p));

    const records: MedicalRecord[] = [
      {
        id: "r1",
        patientId: "p1",
        type: "lab_report",
        title: "Complete Blood Count (CBC)",
        doctorName: "Dr. Anil Mehta",
        hospitalName: "Apollo Hospital",
        date: "2024-12-01",
        fileUrl: null,
        notes: "All values within normal range. Hemoglobin: 14.2 g/dL",
      },
      {
        id: "r2",
        patientId: "p1",
        type: "prescription",
        title: "Seasonal Flu Treatment",
        doctorName: "Dr. Priya Gupta",
        hospitalName: "Max Healthcare",
        date: "2024-11-28",
        fileUrl: null,
        notes: "Prescribed Paracetamol 500mg, rest for 3 days",
      },
      {
        id: "r3",
        patientId: "p1",
        type: "lab_report",
        title: "Lipid Profile Test",
        doctorName: "Dr. Rajesh Kapoor",
        hospitalName: "Fortis Hospital",
        date: "2024-11-15",
        fileUrl: null,
        notes: "Cholesterol slightly elevated. Diet modification recommended.",
      },
      {
        id: "r4",
        patientId: "p2",
        type: "prescription",
        title: "Thyroid Medication",
        doctorName: "Dr. Sunita Rao",
        hospitalName: "Medanta Hospital",
        date: "2024-12-05",
        fileUrl: null,
        notes: "Thyroxine 50mcg daily before breakfast",
      },
      {
        id: "r5",
        patientId: "p3",
        type: "lab_report",
        title: "HbA1c Test",
        doctorName: "Dr. Venkat Krishnan",
        hospitalName: "AIIMS",
        date: "2024-11-20",
        fileUrl: null,
        notes: "HbA1c: 6.2% - Good glycemic control maintained",
      },
    ];

    records.forEach((r) => this.medicalRecords.set(r.id, r));

    const hospitals: Hospital[] = [
      {
        id: "h1",
        name: "Apollo Hospital",
        address: "Sarita Vihar, New Delhi",
        phone: "+91 11 2692 5801",
        latitude: 28.5355,
        longitude: 77.2610,
        bedsAvailable: "150",
        specialties: "Cardiology, Neurology, Oncology",
      },
      {
        id: "h2",
        name: "AIIMS",
        address: "Ansari Nagar, New Delhi",
        phone: "+91 11 2658 8500",
        latitude: 28.5672,
        longitude: 77.2100,
        bedsAvailable: "500",
        specialties: "Multi-specialty, Research, Trauma",
      },
      {
        id: "h3",
        name: "Max Super Specialty",
        address: "Saket, New Delhi",
        phone: "+91 11 2651 5050",
        latitude: 28.5289,
        longitude: 77.2161,
        bedsAvailable: "200",
        specialties: "Cardiac Surgery, Orthopedics, Pediatrics",
      },
      {
        id: "h4",
        name: "Fortis Hospital",
        address: "Vasant Kunj, New Delhi",
        phone: "+91 11 4277 6222",
        latitude: 28.5485,
        longitude: 77.1565,
        bedsAvailable: "180",
        specialties: "Liver Transplant, Kidney Care, Cancer",
      },
    ];

    hospitals.forEach((h) => this.hospitals.set(h.id, h));

    const ambulances: Ambulance[] = [
      {
        id: "a1",
        vehicleNumber: "DL-01-AM-1234",
        driverName: "Rajesh Kumar",
        driverPhone: "+91 98111 22334",
        status: "available",
        latitude: 28.6129,
        longitude: 77.2295,
        hospitalId: "h1",
      },
      {
        id: "a2",
        vehicleNumber: "DL-02-AM-5678",
        driverName: "Suresh Yadav",
        driverPhone: "+91 98222 33445",
        status: "available",
        latitude: 28.5921,
        longitude: 77.1940,
        hospitalId: "h2",
      },
      {
        id: "a3",
        vehicleNumber: "DL-03-AM-9012",
        driverName: "Mohammed Ali",
        driverPhone: "+91 98333 44556",
        status: "available",
        latitude: 28.6350,
        longitude: 77.2250,
        hospitalId: "h3",
      },
      {
        id: "a4",
        vehicleNumber: "DL-04-AM-3456",
        driverName: "Vikram Chauhan",
        driverPhone: "+91 98444 55667",
        status: "busy",
        latitude: 28.5550,
        longitude: 77.1850,
        hospitalId: "h4",
      },
      {
        id: "a5",
        vehicleNumber: "DL-05-AM-7890",
        driverName: "Arun Sharma",
        driverPhone: "+91 98555 66778",
        status: "available",
        latitude: 28.5800,
        longitude: 77.2350,
        hospitalId: "h1",
      },
    ];

    ambulances.forEach((a) => this.ambulances.set(a.id, a));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getPatientByAbhaId(abhaId: string): Promise<Patient | undefined> {
    return Array.from(this.patients.values()).find(
      (patient) => patient.abhaId.toLowerCase() === abhaId.toLowerCase(),
    );
  }

  async getAllPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const id = randomUUID();
    const newPatient: Patient = { ...patient, id };
    this.patients.set(id, newPatient);
    return newPatient;
  }

  async getMedicalRecords(patientId: string): Promise<MedicalRecord[]> {
    return Array.from(this.medicalRecords.values())
      .filter((record) => record.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getMedicalRecord(id: string): Promise<MedicalRecord | undefined> {
    return this.medicalRecords.get(id);
  }

  async createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord> {
    const id = randomUUID();
    const newRecord: MedicalRecord = { ...record, id };
    this.medicalRecords.set(id, newRecord);
    return newRecord;
  }

  async getHospitals(): Promise<Hospital[]> {
    return Array.from(this.hospitals.values());
  }

  async getHospital(id: string): Promise<Hospital | undefined> {
    return this.hospitals.get(id);
  }

  async createHospital(hospital: InsertHospital): Promise<Hospital> {
    const id = randomUUID();
    const newHospital: Hospital = { ...hospital, id };
    this.hospitals.set(id, newHospital);
    return newHospital;
  }

  async getAmbulances(): Promise<Ambulance[]> {
    return Array.from(this.ambulances.values());
  }

  async getAmbulance(id: string): Promise<Ambulance | undefined> {
    return this.ambulances.get(id);
  }

  async updateAmbulance(id: string, updates: Partial<Ambulance>): Promise<Ambulance | undefined> {
    const ambulance = this.ambulances.get(id);
    if (!ambulance) return undefined;
    const updated = { ...ambulance, ...updates };
    this.ambulances.set(id, updated);
    return updated;
  }

  async createAmbulance(ambulance: InsertAmbulance): Promise<Ambulance> {
    const id = randomUUID();
    const newAmbulance: Ambulance = { ...ambulance, id };
    this.ambulances.set(id, newAmbulance);
    return newAmbulance;
  }

  async getIncidents(): Promise<SosIncident[]> {
    return Array.from(this.incidents.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getIncident(id: string): Promise<SosIncident | undefined> {
    return this.incidents.get(id);
  }

  async createIncident(incident: InsertSosIncident): Promise<SosIncident> {
    const id = randomUUID();
    const newIncident: SosIncident = { ...incident, id };
    this.incidents.set(id, newIncident);
    return newIncident;
  }

  async updateIncident(id: string, updates: Partial<SosIncident>): Promise<SosIncident | undefined> {
    const incident = this.incidents.get(id);
    if (!incident) return undefined;
    const updated = { ...incident, ...updates };
    this.incidents.set(id, updated);
    return updated;
  }

  async createOtpSession(session: InsertOtpSession): Promise<OtpSession> {
    const id = randomUUID();
    const newSession: OtpSession = { ...session, id };
    this.otpSessions.set(id, newSession);
    return newSession;
  }

  async getOtpSession(id: string): Promise<OtpSession | undefined> {
    return this.otpSessions.get(id);
  }

  async verifyOtpSession(id: string): Promise<OtpSession | undefined> {
    const session = this.otpSessions.get(id);
    if (!session) return undefined;
    const updated = { ...session, verified: true };
    this.otpSessions.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
