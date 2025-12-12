import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { SosButton } from "@/components/sos-button";
import { QrCodeDialog } from "@/components/qr-code-dialog";
import type { MedicalRecord } from "@shared/schema";
import {
  Heart,
  FileText,
  Pill,
  Calendar,
  Upload,
  QrCode,
  LogOut,
  User,
  Activity,
  Clock,
  Stethoscope,
  Building2,
} from "lucide-react";
import { format, parseISO } from "date-fns";

export default function Dashboard() {
  const { patient, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const { data: records, isLoading } = useQuery<MedicalRecord[]>({
    queryKey: [`/api/patients/${patient?.id}/records`],
    enabled: !!patient?.id,
  });

  if (!patient) {
    return null;
  }

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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">AayuSync</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                logout();
                setLocation("/");
              }}
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {patient.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl" data-testid="text-patient-name">
                  {patient.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4" />
                  ABHA ID: {patient.abhaId}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Blood Group</p>
                  <p className="font-semibold" data-testid="text-blood-group">
                    {patient.bloodGroup || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Date of Birth</p>
                  <p className="font-semibold">
                    {patient.dateOfBirth
                      ? format(parseISO(patient.dateOfBirth), "MMM d, yyyy")
                      : "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-semibold">{patient.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Emergency</p>
                  <p className="font-semibold">{patient.emergencyContact || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-3">
              <Button
                variant="outline"
                className="justify-start h-12"
                onClick={() => setShowQr(true)}
                data-testid="button-show-qr"
              >
                <QrCode className="mr-2 h-5 w-5" />
                Show My QR Code
              </Button>
              <Button
                variant="outline"
                className="justify-start h-12"
                onClick={() => setLocation("/upload")}
                data-testid="button-upload-record"
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload Report
              </Button>
              <Button
                variant="outline"
                className="justify-start h-12"
                onClick={() => setLocation("/dispatcher")}
                data-testid="button-dispatcher"
              >
                <Activity className="mr-2 h-5 w-5" />
                Dispatcher View
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Medical Timeline
              </h2>
              <Badge variant="secondary" className="text-xs">
                {records?.length || 0} records
              </Badge>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-1/3" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : records && records.length > 0 ? (
              <div className="space-y-4">
                {records.map((record) => (
                  <Card
                    key={record.id}
                    className="hover-elevate transition-all"
                    data-testid={`card-record-${record.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div
                          className={`h-12 w-12 rounded-lg flex items-center justify-center ${getRecordColor(record.type)}`}
                        >
                          {getRecordIcon(record.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <h3 className="font-semibold">{record.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Stethoscope className="h-4 w-4" />
                                  {record.doctorName}
                                </span>
                                {record.hospitalName && (
                                  <span className="flex items-center gap-1">
                                    <Building2 className="h-4 w-4" />
                                    {record.hospitalName}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {record.type.replace("_", " ")}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(parseISO(record.date), "MMM d, yyyy")}
                          </div>
                          {record.notes && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
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
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">No Medical Records</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Upload your first medical report to get started
                  </p>
                  <Button onClick={() => setLocation("/upload")}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Report
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <SosButton patientId={patient.id} />
          </div>
        </div>
      </main>

      <QrCodeDialog
        open={showQr}
        onOpenChange={setShowQr}
        patient={patient}
      />
    </div>
  );
}
