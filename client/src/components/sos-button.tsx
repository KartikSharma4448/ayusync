import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Phone, MapPin, Loader2, Ambulance, Clock, CheckCircle2 } from "lucide-react";

interface SosButtonProps {
  patientId: string;
}

interface SosResponse {
  incident: {
    id: string;
    status: string;
    eta: string;
  };
  assignedAmbulance: {
    vehicleNumber: string;
    driverName: string;
    driverPhone: string;
  } | null;
  nearestAmbulances: Array<{
    id: string;
    vehicleNumber: string;
    distance: number;
    eta: number;
    status: string;
  }>;
}

export function SosButton({ patientId }: SosButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [sosResult, setSosResult] = useState<SosResponse | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sosMutation = useMutation({
    mutationFn: async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
      const res = await apiRequest("POST", "/api/sos", {
        patientId,
        latitude,
        longitude,
      });
      return res.json() as Promise<SosResponse>;
    },
    onSuccess: (data) => {
      setSosResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ambulances"] });
      if (data.assignedAmbulance) {
        toast({
          title: "Ambulance Dispatched",
          description: `${data.assignedAmbulance.vehicleNumber} is on the way. ETA: ${data.incident.eta}`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "SOS Failed",
        description: error.message || "Failed to send SOS. Please try calling emergency services.",
        variant: "destructive",
      });
    },
  });

  const handleSosClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmSos = async () => {
    setShowConfirm(false);
    setGettingLocation(true);

    if (!navigator.geolocation) {
      setGettingLocation(false);
      toast({
        title: "Location Unavailable",
        description: "Your browser doesn't support geolocation. Using approximate location.",
        variant: "destructive",
      });
      sosMutation.mutate({ latitude: 28.6139, longitude: 77.209 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGettingLocation(false);
        sosMutation.mutate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        setGettingLocation(false);
        toast({
          title: "Location Error",
          description: "Could not get your location. Using approximate location.",
          variant: "destructive",
        });
        sosMutation.mutate({ latitude: 28.6139, longitude: 77.209 });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const isLoading = gettingLocation || sosMutation.isPending;

  if (sosResult && sosResult.assignedAmbulance) {
    return (
      <Card className="border-accent">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Help is Coming</CardTitle>
              <CardDescription>Ambulance dispatched</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <div className="flex items-center gap-3">
              <Ambulance className="h-6 w-6 text-primary" />
              <div>
                <p className="font-semibold">{sosResult.assignedAmbulance.vehicleNumber}</p>
                <p className="text-sm text-muted-foreground">
                  {sosResult.assignedAmbulance.driverName}
                </p>
              </div>
            </div>
            <Badge className="bg-accent text-accent-foreground">
              <Clock className="mr-1 h-3 w-3" />
              ETA: {sosResult.incident.eta}
            </Badge>
          </div>

          <a
            href={`tel:${sosResult.assignedAmbulance.driverPhone}`}
            className="flex items-center justify-center gap-2 w-full h-12 rounded-lg bg-primary text-primary-foreground font-medium"
            data-testid="link-call-driver"
          >
            <Phone className="h-5 w-5" />
            Call Driver
          </a>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSosResult(null)}
            data-testid="button-dismiss-sos"
          >
            Dismiss
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Emergency SOS
          </CardTitle>
          <CardDescription>
            Press for immediate ambulance dispatch
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <button
            onClick={handleSosClick}
            disabled={isLoading}
            className="relative w-40 h-40 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg transition-transform active:scale-95 disabled:opacity-70"
            style={{
              boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.4)",
              animation: isLoading ? "none" : "pulse-ring 2s ease-out infinite",
            }}
            data-testid="button-sos"
          >
            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-10 w-10 animate-spin" />
                <span className="text-sm font-medium">
                  {gettingLocation ? "Getting Location..." : "Sending SOS..."}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <AlertTriangle className="h-12 w-12" />
                <span className="text-2xl font-bold">SOS</span>
              </div>
            )}
          </button>

          <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Uses your current location</span>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
          }
          70% {
            box-shadow: 0 0 0 20px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
      `}</style>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-6 w-6" />
              Confirm Emergency SOS
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will dispatch the nearest available ambulance to your current location.
              Only use this for genuine medical emergencies.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-sos">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSos}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-sos"
            >
              Send SOS Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
