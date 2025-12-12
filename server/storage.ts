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
    // Jaipur Patients
    const patients: Patient[] = [
      {
        id: "p1",
        abhaId: "ABHA001",
        name: "Rahul Sharma",
        phone: "+91 98765 43210",
        email: "rahul.sharma@email.com",
        dateOfBirth: "1985-03-15",
        bloodGroup: "B+",
        address: "C-12, Malviya Nagar, Jaipur",
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
        address: "A-45, Vaishali Nagar, Jaipur",
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
        address: "D-78, Raja Park, Jaipur",
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
        address: "B-23, Mansarovar, Jaipur",
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
        address: "E-56, C-Scheme, Jaipur",
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

    // Jaipur Hospitals
    const hospitals: Hospital[] = [
      {
        id: "h1",
        name: "Sawai Man Singh Hospital",
        address: "JLN Marg, Jaipur",
        phone: "+91 141 251 8888",
        latitude: 26.8947,
        longitude: 75.8062,
        bedsAvailable: "1500",
        specialties: "Multi-specialty, Trauma, Emergency",
      },
      {
        id: "h2",
        name: "Fortis Escorts Hospital",
        address: "Malviya Nagar, Jaipur",
        phone: "+91 141 254 7000",
        latitude: 26.8582,
        longitude: 75.8012,
        bedsAvailable: "300",
        specialties: "Cardiology, Neurology, Orthopedics",
      },
      {
        id: "h3",
        name: "Narayana Multispeciality Hospital",
        address: "Sector 28, Kumbha Marg, Jaipur",
        phone: "+91 141 712 8888",
        latitude: 26.8515,
        longitude: 75.8108,
        bedsAvailable: "200",
        specialties: "Cardiac Surgery, Oncology, Nephrology",
      },
      {
        id: "h4",
        name: "Manipal Hospital",
        address: "Sector 5, Vidhyadhar Nagar, Jaipur",
        phone: "+91 141 303 0303",
        latitude: 26.9520,
        longitude: 75.7780,
        bedsAvailable: "250",
        specialties: "Emergency, Pediatrics, Gastroenterology",
      },
      {
        id: "h5",
        name: "RUHS Hospital",
        address: "Kumbha Marg, Pratap Nagar, Jaipur",
        phone: "+91 141 279 5600",
        latitude: 26.8449,
        longitude: 75.7869,
        bedsAvailable: "800",
        specialties: "Government Hospital, All Specialties",
      },
    ];

    hospitals.forEach((h) => this.hospitals.set(h.id, h));

    // Jaipur Ambulances - spread across city
    const ambulances: Ambulance[] = [
      {
        id: "a1",
        vehicleNumber: "RJ-14-AM-1234",
        driverName: "Rajesh Kumar",
        driverPhone: "+91 98111 22334",
        status: "available",
        latitude: 26.9124,
        longitude: 75.7873,
        hospitalId: "h1",
      },
      {
        id: "a2",
        vehicleNumber: "RJ-14-AM-5678",
        driverName: "Suresh Yadav",
        driverPhone: "+91 98222 33445",
        status: "available",
        latitude: 26.8820,
        longitude: 75.7590,
        hospitalId: "h2",
      },
      {
        id: "a3",
        vehicleNumber: "RJ-14-AM-9012",
        driverName: "Mohammed Ali",
        driverPhone: "+91 98333 44556",
        status: "available",
        latitude: 26.8650,
        longitude: 75.8150,
        hospitalId: "h3",
      },
      {
        id: "a4",
        vehicleNumber: "RJ-14-AM-3456",
        driverName: "Vikram Chauhan",
        driverPhone: "+91 98444 55667",
        status: "busy",
        latitude: 26.9350,
        longitude: 75.7720,
        hospitalId: "h4",
      },
      {
        id: "a5",
        vehicleNumber: "RJ-14-AM-7890",
        driverName: "Arun Sharma",
        driverPhone: "+91 98555 66778",
        status: "available",
        latitude: 26.8780,
        longitude: 75.8250,
        hospitalId: "h5",
      },
    ];

    ambulances.forEach((a) => this.ambulances.set(a.id, a));
    
    // Start ambulance movement simulation
    this.startAmbulanceSimulation();
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

  // Simulate ambulance movement around Jaipur
  private startAmbulanceSimulation() {
    setInterval(() => {
      this.ambulances.forEach((ambulance, id) => {
        // Only move available ambulances
        if (ambulance.status === "available") {
          // Small random movement (about 100-200 meters)
          const latChange = (Math.random() - 0.5) * 0.002;
          const lonChange = (Math.random() - 0.5) * 0.002;
          
          // Keep within Jaipur bounds (roughly 26.8 to 27.0 lat, 75.7 to 75.9 lon)
          let newLat = ambulance.latitude + latChange;
          let newLon = ambulance.longitude + lonChange;
          
          // Clamp to Jaipur area
          newLat = Math.max(26.82, Math.min(26.98, newLat));
          newLon = Math.max(75.72, Math.min(75.88, newLon));
          
          this.ambulances.set(id, {
            ...ambulance,
            latitude: newLat,
            longitude: newLon,
          });
        }
      });
    }, 3000); // Update every 3 seconds
  }
}

export const storage = new MemStorage();
