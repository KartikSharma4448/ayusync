import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Patient } from "@shared/schema";

interface AuthContextType {
  patient: Patient | null;
  isAuthenticated: boolean;
  login: (patient: Patient) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("aayusync_patient");
    if (stored) {
      try {
        setPatient(JSON.parse(stored));
      } catch {
        localStorage.removeItem("aayusync_patient");
      }
    }
  }, []);

  const login = (patientData: Patient) => {
    setPatient(patientData);
    localStorage.setItem("aayusync_patient", JSON.stringify(patientData));
  };

  const logout = () => {
    setPatient(null);
    localStorage.removeItem("aayusync_patient");
  };

  return (
    <AuthContext.Provider
      value={{
        patient,
        isAuthenticated: !!patient,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
