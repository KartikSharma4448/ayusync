import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMedicalRecordSchema, insertSosIncidentSchema } from "@shared/schema";
import { z } from "zod";

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/request-otp", async (req, res) => {
    try {
      const { abhaId } = req.body;
      
      if (!abhaId) {
        return res.status(400).json({ error: "ABHA ID is required" });
      }

      const patient = await storage.getPatientByAbhaId(abhaId);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found with this ABHA ID" });
      }

      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      const session = await storage.createOtpSession({
        abhaId: patient.abhaId,
        otp,
        expiresAt,
        verified: false,
      });

      res.json({
        sessionId: session.id,
        message: "OTP sent successfully",
        otp,
      });
    } catch (error) {
      console.error("Request OTP error:", error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { sessionId, otp } = req.body;

      if (!sessionId || !otp) {
        return res.status(400).json({ error: "Session ID and OTP are required" });
      }

      const session = await storage.getOtpSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (new Date(session.expiresAt) < new Date()) {
        return res.status(400).json({ error: "OTP has expired" });
      }

      if (session.otp !== otp) {
        return res.status(400).json({ error: "Invalid OTP" });
      }

      await storage.verifyOtpSession(sessionId);

      const patient = await storage.getPatientByAbhaId(session.abhaId);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }

      res.json({
        message: "OTP verified successfully",
        patient,
      });
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  });

  app.get("/api/patients", async (req, res) => {
    try {
      const patients = await storage.getAllPatients();
      res.json(patients);
    } catch (error) {
      console.error("Get patients error:", error);
      res.status(500).json({ error: "Failed to get patients" });
    }
  });

  app.get("/api/patients/:id", async (req, res) => {
    try {
      const patient = await storage.getPatient(req.params.id);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      console.error("Get patient error:", error);
      res.status(500).json({ error: "Failed to get patient" });
    }
  });

  app.get("/api/patients/:id/records", async (req, res) => {
    try {
      const records = await storage.getMedicalRecords(req.params.id);
      res.json(records);
    } catch (error) {
      console.error("Get records error:", error);
      res.status(500).json({ error: "Failed to get medical records" });
    }
  });

  app.post("/api/records", async (req, res) => {
    try {
      const validation = insertMedicalRecordSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.message });
      }

      const record = await storage.createMedicalRecord(validation.data);
      res.status(201).json(record);
    } catch (error) {
      console.error("Create record error:", error);
      res.status(500).json({ error: "Failed to create medical record" });
    }
  });

  app.get("/api/hospitals", async (req, res) => {
    try {
      const hospitals = await storage.getHospitals();
      res.json(hospitals);
    } catch (error) {
      console.error("Get hospitals error:", error);
      res.status(500).json({ error: "Failed to get hospitals" });
    }
  });

  app.get("/api/ambulances", async (req, res) => {
    try {
      const ambulances = await storage.getAmbulances();
      res.json(ambulances);
    } catch (error) {
      console.error("Get ambulances error:", error);
      res.status(500).json({ error: "Failed to get ambulances" });
    }
  });

  app.get("/api/incidents", async (req, res) => {
    try {
      const incidents = await storage.getIncidents();
      res.json(incidents);
    } catch (error) {
      console.error("Get incidents error:", error);
      res.status(500).json({ error: "Failed to get incidents" });
    }
  });

  app.post("/api/sos", async (req, res) => {
    try {
      const sosSchema = z.object({
        patientId: z.string(),
        latitude: z.number(),
        longitude: z.number(),
      });

      const validation = sosSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.message });
      }

      const { patientId, latitude, longitude } = validation.data;

      const ambulances = await storage.getAmbulances();
      const availableAmbulances = ambulances
        .filter((a) => a.status === "available")
        .map((amb) => ({
          ...amb,
          distance: calculateDistance(latitude, longitude, amb.latitude, amb.longitude),
          eta: Math.ceil(
            calculateDistance(latitude, longitude, amb.latitude, amb.longitude) * 3
          ),
        }))
        .sort((a, b) => a.distance - b.distance);

      const nearestThree = availableAmbulances.slice(0, 3);
      const assignedAmbulance = nearestThree[0];

      let etaString = "15 min";
      if (assignedAmbulance) {
        etaString = `${assignedAmbulance.eta} min`;
        await storage.updateAmbulance(assignedAmbulance.id, { status: "busy" });
      }

      const incident = await storage.createIncident({
        patientId,
        latitude,
        longitude,
        status: assignedAmbulance ? "assigned" : "pending",
        assignedAmbulanceId: assignedAmbulance?.id || null,
        createdAt: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        resolvedAt: null,
        eta: etaString,
        notes: null,
      });

      const ambulanceDetails = assignedAmbulance
        ? {
            vehicleNumber: assignedAmbulance.vehicleNumber,
            driverName: assignedAmbulance.driverName,
            driverPhone: assignedAmbulance.driverPhone,
          }
        : null;

      res.status(201).json({
        incident,
        assignedAmbulance: ambulanceDetails,
        nearestAmbulances: nearestThree.map((a) => ({
          id: a.id,
          vehicleNumber: a.vehicleNumber,
          distance: a.distance,
          eta: a.eta,
          status: a.id === assignedAmbulance?.id ? "assigned" : a.status,
        })),
      });
    } catch (error) {
      console.error("SOS error:", error);
      res.status(500).json({ error: "Failed to process SOS request" });
    }
  });

  app.post("/api/incidents/:id/assign", async (req, res) => {
    try {
      const { ambulanceId } = req.body;
      const incidentId = req.params.id;

      if (!ambulanceId) {
        return res.status(400).json({ error: "Ambulance ID is required" });
      }

      const incident = await storage.getIncident(incidentId);
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }

      const ambulance = await storage.getAmbulance(ambulanceId);
      if (!ambulance) {
        return res.status(404).json({ error: "Ambulance not found" });
      }

      const distance = calculateDistance(
        incident.latitude,
        incident.longitude,
        ambulance.latitude,
        ambulance.longitude
      );
      const eta = Math.ceil(distance * 3);

      await storage.updateAmbulance(ambulanceId, { status: "busy" });

      if (incident.assignedAmbulanceId && incident.assignedAmbulanceId !== ambulanceId) {
        await storage.updateAmbulance(incident.assignedAmbulanceId, { status: "available" });
      }

      const updatedIncident = await storage.updateIncident(incidentId, {
        assignedAmbulanceId: ambulanceId,
        status: "assigned",
        eta: `${eta} min`,
      });

      res.json({
        incident: updatedIncident,
        ambulance: {
          vehicleNumber: ambulance.vehicleNumber,
          driverName: ambulance.driverName,
          driverPhone: ambulance.driverPhone,
        },
        eta: `${eta} min`,
      });
    } catch (error) {
      console.error("Assign ambulance error:", error);
      res.status(500).json({ error: "Failed to assign ambulance" });
    }
  });

  app.post("/api/incidents/:id/resolve", async (req, res) => {
    try {
      const incidentId = req.params.id;

      const incident = await storage.getIncident(incidentId);
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }

      if (incident.assignedAmbulanceId) {
        await storage.updateAmbulance(incident.assignedAmbulanceId, { status: "available" });
      }

      const updatedIncident = await storage.updateIncident(incidentId, {
        status: "resolved",
        resolvedAt: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      });

      res.json(updatedIncident);
    } catch (error) {
      console.error("Resolve incident error:", error);
      res.status(500).json({ error: "Failed to resolve incident" });
    }
  });

  return httpServer;
}
