import { pgTable, text, varchar, timestamp, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const patients = pgTable("patients", {
  id: varchar("id").primaryKey(),
  abhaId: varchar("abha_id").notNull().unique(),
  name: text("name").notNull(),
  phone: varchar("phone").notNull(),
  email: text("email"),
  dateOfBirth: text("date_of_birth"),
  bloodGroup: text("blood_group"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
});

export const insertPatientSchema = createInsertSchema(patients).omit({ id: true });
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;

export const medicalRecords = pgTable("medical_records", {
  id: varchar("id").primaryKey(),
  patientId: varchar("patient_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  doctorName: text("doctor_name").notNull(),
  hospitalName: text("hospital_name"),
  date: text("date").notNull(),
  fileUrl: text("file_url"),
  notes: text("notes"),
});

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({ id: true });
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
export type MedicalRecord = typeof medicalRecords.$inferSelect;

export const hospitals = pgTable("hospitals", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  bedsAvailable: text("beds_available"),
  specialties: text("specialties"),
});

export const insertHospitalSchema = createInsertSchema(hospitals).omit({ id: true });
export type InsertHospital = z.infer<typeof insertHospitalSchema>;
export type Hospital = typeof hospitals.$inferSelect;

export const ambulances = pgTable("ambulances", {
  id: varchar("id").primaryKey(),
  vehicleNumber: varchar("vehicle_number").notNull().unique(),
  driverName: text("driver_name").notNull(),
  driverPhone: text("driver_phone").notNull(),
  status: text("status").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  hospitalId: varchar("hospital_id"),
});

export const insertAmbulanceSchema = createInsertSchema(ambulances).omit({ id: true });
export type InsertAmbulance = z.infer<typeof insertAmbulanceSchema>;
export type Ambulance = typeof ambulances.$inferSelect;

export const sosIncidents = pgTable("sos_incidents", {
  id: varchar("id").primaryKey(),
  patientId: varchar("patient_id").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  status: text("status").notNull(),
  assignedAmbulanceId: varchar("assigned_ambulance_id"),
  createdAt: text("created_at").notNull(),
  resolvedAt: text("resolved_at"),
  eta: text("eta"),
  notes: text("notes"),
});

export const insertSosIncidentSchema = createInsertSchema(sosIncidents).omit({ id: true });
export type InsertSosIncident = z.infer<typeof insertSosIncidentSchema>;
export type SosIncident = typeof sosIncidents.$inferSelect;

export const otpSessions = pgTable("otp_sessions", {
  id: varchar("id").primaryKey(),
  abhaId: varchar("abha_id").notNull(),
  otp: varchar("otp").notNull(),
  expiresAt: text("expires_at").notNull(),
  verified: boolean("verified").notNull(),
});

export const insertOtpSessionSchema = createInsertSchema(otpSessions).omit({ id: true });
export type InsertOtpSession = z.infer<typeof insertOtpSessionSchema>;
export type OtpSession = typeof otpSessions.$inferSelect;
