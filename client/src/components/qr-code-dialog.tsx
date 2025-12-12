import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Patient } from "@shared/schema";
import { Download, Share2, QrCode } from "lucide-react";

interface QrCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
}

export function QrCodeDialog({ open, onOpenChange, patient }: QrCodeDialogProps) {
  const qrData = JSON.stringify({
    type: "aayusync_patient",
    abhaId: patient.abhaId,
    name: patient.name,
    bloodGroup: patient.bloodGroup,
    emergencyContact: patient.emergencyContact,
    viewUrl: `${window.location.origin}/view/${patient.abhaId}`,
  });

  const handleDownload = () => {
    const svg = document.getElementById("patient-qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 300, 300);
        ctx.drawImage(img, 0, 0, 300, 300);
      }
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `aayusync-qr-${patient.abhaId}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AayuSync Health Profile",
          text: `View ${patient.name}'s health profile`,
          url: `${window.location.origin}/view/${patient.abhaId}`,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Your Health QR Code
          </DialogTitle>
          <DialogDescription>
            Doctors can scan this QR code to view your medical history
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-6 space-y-4">
          <div className="p-4 bg-white rounded-lg">
            <QRCodeSVG
              id="patient-qr-code"
              value={qrData}
              size={200}
              level="H"
              includeMargin={false}
              data-testid="qr-code"
            />
          </div>

          <div className="text-center space-y-1">
            <p className="font-semibold" data-testid="text-qr-patient-name">{patient.name}</p>
            <p className="text-sm text-muted-foreground">ABHA: {patient.abhaId}</p>
            {patient.bloodGroup && (
              <p className="text-sm text-muted-foreground">
                Blood Group: {patient.bloodGroup}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDownload}
            data-testid="button-download-qr"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          {navigator.share && (
            <Button
              className="flex-1"
              onClick={handleShare}
              data-testid="button-share-qr"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
