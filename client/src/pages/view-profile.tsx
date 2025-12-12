import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Patient, MedicalRecord } from "@shared/schema";
import {
  Heart,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Droplets,
  FileText,
  Pill,
  Activity,
  Clock,
  Building2,
  Stethoscope,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { format, parseISO } from "date-fns";

export default function ViewProfile() {
  const params = useParams();
  const abhaId = params.abhaId;

  const { data: patient, isLoading: patientLoading, error: patientError } = useQuery<Patient>({
    queryKey: ["/api/patients/abha", abhaId],
    enabled: !!abhaId,
  });

  const { data: records, isLoading: recordsLoading } = useQuery<MedicalRecord[]>({
    queryKey: [`/api/patients/${patient?.id}/records`],
    enabled: !!patient?.id,
  });

  const getRecordIcon = (type: string) => {
    switch (type) {
      case "lab_report":
        return <FileText className="h-5 w-5" />;
      case "prescription":
        return <Pill className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getRecordColor = (type: string) => {
    switch (type) {
      case "lab_report":
        return "bg-chart-1/10 text-chart-1";
      case "prescription":
        return "bg-chart-2/10 text-chart-2";
      default:
        return "bg-chart-3/10 text-chart-3";
    }
  };

  if (patientLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">AayuSync</span>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <main className="p-4 max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </main>
      </div>
    );
  }

  if (patientError || !patient) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">AayuSync</span>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <main className="p-4 max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold">Patient Not Found</h2>
              <p className="text-muted-foreground text-center">
                The ABHA ID "{abhaId}" was not found in our system.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">AayuSync</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Shield className="h-3 w-3" />
              Verified Profile
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">{patient.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Shield className="h-4 w-4" />
                  ABHA: {patient.abhaId}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-destructive" />
                <div>
                  <p className="text-xs text-muted-foreground">Blood Group</p>
                  <p className="font-semibold">{patient.bloodGroup || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Date of Birth</p>
                  <p className="font-semibold">
                    {patient.dateOfBirth
                      ? format(parseISO(patient.dateOfBirth), "dd MMM yyyy")
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-semibold">{patient.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <div>
                  <p className="text-xs text-muted-foreground">Emergency</p>
                  <p className="font-semibold">{patient.emergencyContact || "N/A"}</p>
                </div>
              </div>
            </div>
            {patient.address && (
              <div className="flex items-start gap-2 mt-4 pt-4 border-t">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm">{patient.address}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Medical History
          </h2>

          {recordsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : records && records.length > 0 ? (
            <div className="space-y-3">
              {records.map((record) => (
                <Card key={record.id} data-testid={`record-card-${record.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${getRecordColor(record.type)}`}
                      >
                        {getRecordIcon(record.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium">{record.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Stethoscope className="h-3 w-3" />
                              <span>{record.doctorName}</span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="shrink-0">
                            {record.type === "lab_report" ? "Lab Report" : "Prescription"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(parseISO(record.date), "dd MMM yyyy")}
                          </span>
                          {record.hospitalName && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {record.hospitalName}
                            </span>
                          )}
                        </div>
                        {record.notes && (
                          <p className="mt-2 text-sm text-muted-foreground bg-muted p-2 rounded">
                            {record.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium">No Medical Records</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  No medical history available for this patient.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
