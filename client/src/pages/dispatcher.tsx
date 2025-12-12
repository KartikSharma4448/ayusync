import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { DispatcherMap } from "@/components/dispatcher-map";
import { useToast } from "@/hooks/use-toast";
import type { Ambulance, Hospital, SosIncident } from "@shared/schema";
import {
  Heart,
  ArrowLeft,
  Ambulance as AmbulanceIcon,
  Building2,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  Navigation,
  Users,
  Loader2,
} from "lucide-react";

interface AmbulanceWithDistance extends Ambulance {
  distance?: number;
  eta?: number;
}

export default function DispatcherPage() {
  const [, setLocation] = useLocation();
  const [selectedIncident, setSelectedIncident] = useState<SosIncident | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: hospitals, isLoading: hospitalsLoading } = useQuery<Hospital[]>({
    queryKey: ["/api/hospitals"],
  });

  const { data: ambulances, isLoading: ambulancesLoading } = useQuery<Ambulance[]>({
    queryKey: ["/api/ambulances"],
    refetchInterval: 5000,
  });

  const { data: incidents, isLoading: incidentsLoading } = useQuery<SosIncident[]>({
    queryKey: ["/api/incidents"],
    refetchInterval: 3000,
  });

  const assignMutation = useMutation({
    mutationFn: async ({
      incidentId,
      ambulanceId,
    }: {
      incidentId: string;
      ambulanceId: string;
    }) => {
      const res = await apiRequest("POST", `/api/incidents/${incidentId}/assign`, {
        ambulanceId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ambulances"] });
      toast({
        title: "Ambulance Assigned",
        description: "The ambulance has been dispatched to the incident.",
      });
      setSelectedIncident(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to assign ambulance.",
        variant: "destructive",
      });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (incidentId: string) => {
      const res = await apiRequest("POST", `/api/incidents/${incidentId}/resolve`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ambulances"] });
      toast({
        title: "Incident Resolved",
        description: "The incident has been marked as resolved.",
      });
      setSelectedIncident(null);
    },
  });

  const activeIncidents = incidents?.filter((i) => i.status !== "resolved") || [];
  const availableAmbulances = ambulances?.filter((a) => a.status === "available") || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "assigned":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "en_route":
        return "bg-primary/10 text-primary";
      case "arrived":
        return "bg-accent/10 text-accent";
      case "resolved":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getAmbulanceStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-accent/10 text-accent";
      case "busy":
        return "bg-destructive/10 text-destructive";
      case "offline":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
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
  };

  const getNearestAmbulances = (incident: SosIncident): AmbulanceWithDistance[] => {
    if (!ambulances) return [];
    return ambulances
      .filter((a) => a.status === "available")
      .map((amb) => ({
        ...amb,
        distance: calculateDistance(
          incident.latitude,
          incident.longitude,
          amb.latitude,
          amb.longitude
        ),
        eta: Math.ceil(
          calculateDistance(incident.latitude, incident.longitude, amb.latitude, amb.longitude) *
            3
        ),
      }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/dashboard")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">Dispatcher Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                <span>{activeIncidents.length} Active</span>
              </div>
              <div className="flex items-center gap-2">
                <AmbulanceIcon className="h-4 w-4 text-accent" />
                <span>{availableAmbulances.length} Available</span>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 relative">
          <DispatcherMap
            hospitals={hospitals || []}
            ambulances={ambulances || []}
            incidents={incidents || []}
            selectedIncident={selectedIncident}
            onIncidentSelect={setSelectedIncident}
          />
        </div>

        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l bg-background overflow-auto max-h-[50vh] lg:max-h-none">
          <div className="p-4 space-y-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Active Incidents
              </h2>

              {incidentsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : activeIncidents.length > 0 ? (
                <div className="space-y-3">
                  {activeIncidents.map((incident) => (
                    <Card
                      key={incident.id}
                      className={`cursor-pointer transition-all ${
                        selectedIncident?.id === incident.id
                          ? "ring-2 ring-primary"
                          : "hover-elevate"
                      }`}
                      onClick={() => setSelectedIncident(incident)}
                      data-testid={`card-incident-${incident.id}`}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">SOS Alert</p>
                              <p className="text-xs text-muted-foreground">
                                {incident.createdAt}
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={`text-xs capitalize ${getStatusColor(incident.status)}`}
                          >
                            {incident.status.replace("_", " ")}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                          </span>
                        </div>

                        {incident.assignedAmbulanceId && incident.eta && (
                          <div className="flex items-center gap-2 text-xs">
                            <Clock className="h-3 w-3 text-primary" />
                            <span>ETA: {incident.eta}</span>
                          </div>
                        )}

                        {selectedIncident?.id === incident.id && (
                          <div className="pt-2 border-t space-y-2">
                            <p className="text-xs font-medium">Nearest Ambulances:</p>
                            {getNearestAmbulances(incident).map((amb) => (
                              <div
                                key={amb.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-muted text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <AmbulanceIcon className="h-4 w-4" />
                                  <span>{amb.vehicleNumber}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {amb.distance?.toFixed(1)} km
                                  </span>
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      assignMutation.mutate({
                                        incidentId: incident.id,
                                        ambulanceId: amb.id,
                                      });
                                    }}
                                    disabled={assignMutation.isPending}
                                    data-testid={`button-assign-${amb.id}`}
                                  >
                                    {assignMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      "Assign"
                                    )}
                                  </Button>
                                </div>
                              </div>
                            ))}

                            {incident.status !== "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  resolveMutation.mutate(incident.id);
                                }}
                                disabled={resolveMutation.isPending}
                                data-testid="button-resolve-incident"
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Mark Resolved
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center py-8">
                    <CheckCircle2 className="h-10 w-10 text-accent mb-2" />
                    <p className="font-medium">No Active Incidents</p>
                    <p className="text-sm text-muted-foreground">All clear</p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <AmbulanceIcon className="h-5 w-5" />
                Ambulance Fleet
              </h2>

              {ambulancesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {ambulances?.map((amb) => (
                    <div
                      key={amb.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted"
                      data-testid={`ambulance-${amb.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                          <AmbulanceIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{amb.vehicleNumber}</p>
                          <p className="text-xs text-muted-foreground">{amb.driverName}</p>
                        </div>
                      </div>
                      <Badge className={`text-xs capitalize ${getAmbulanceStatusColor(amb.status)}`}>
                        {amb.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <Building2 className="h-5 w-5" />
                Hospitals
              </h2>

              {hospitalsLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {hospitals?.map((hospital) => (
                    <div
                      key={hospital.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted"
                      data-testid={`hospital-${hospital.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{hospital.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {hospital.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
