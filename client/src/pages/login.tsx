import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Heart, Shield, Smartphone, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type Step = "abha" | "otp" | "success";

export default function Login() {
  const [step, setStep] = useState<Step>("abha");
  const [abhaId, setAbhaId] = useState("");
  const [otp, setOtp] = useState("");
  const [sessionId, setSessionId] = useState("");
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const requestOtpMutation = useMutation({
    mutationFn: async (abhaId: string) => {
      const res = await apiRequest("POST", "/api/auth/request-otp", { abhaId });
      return res.json();
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      toast({
        title: "OTP Sent",
        description: `A 6-digit OTP has been sent to your registered mobile. Demo OTP: ${data.otp}`,
      });
      setStep("otp");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP. Please check your ABHA ID.",
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ sessionId, otp }: { sessionId: string; otp: string }) => {
      const res = await apiRequest("POST", "/api/auth/verify-otp", { sessionId, otp });
      return res.json();
    },
    onSuccess: (data) => {
      setStep("success");
      setTimeout(() => {
        login(data.patient);
        setLocation("/dashboard");
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAbhaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (abhaId.length >= 10) {
      requestOtpMutation.mutate(abhaId);
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      verifyOtpMutation.mutate({ sessionId, otp });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Heart className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">AayuSync</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Welcome to AayuSync</h1>
            <p className="text-muted-foreground">
              Your unified healthcare platform powered by ABHA
            </p>
          </div>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                ABHA Login
              </CardTitle>
              <CardDescription>
                {step === "abha" && "Enter your ABHA ID to receive an OTP"}
                {step === "otp" && "Enter the 6-digit OTP sent to your registered mobile"}
                {step === "success" && "Verification successful!"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === "abha" && (
                <form onSubmit={handleAbhaSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="abhaId">ABHA ID</Label>
                    <Input
                      id="abhaId"
                      placeholder="14-digit ABHA Number or username@abdm"
                      value={abhaId}
                      onChange={(e) => setAbhaId(e.target.value)}
                      className="h-12"
                      data-testid="input-abha-id"
                    />
                    <p className="text-xs text-muted-foreground">
                      Demo IDs: ABHA001, ABHA002, ABHA003, ABHA004, ABHA005
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12"
                    disabled={abhaId.length < 6 || requestOtpMutation.isPending}
                    data-testid="button-request-otp"
                  >
                    {requestOtpMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Request OTP
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              )}

              {step === "otp" && (
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">OTP sent to registered mobile</span>
                    </div>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={setOtp}
                        data-testid="input-otp"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Button
                      type="submit"
                      className="w-full h-12"
                      disabled={otp.length !== 6 || verifyOtpMutation.isPending}
                      data-testid="button-verify-otp"
                    >
                      {verifyOtpMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          Verify OTP
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setStep("abha");
                        setOtp("");
                      }}
                      data-testid="button-back-to-abha"
                    >
                      Change ABHA ID
                    </Button>
                  </div>
                </form>
              )}

              {step === "success" && (
                <div className="flex flex-col items-center py-8 space-y-4">
                  <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-accent-foreground" />
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="text-xl font-semibold">Verification Complete</h3>
                    <p className="text-muted-foreground">Redirecting to dashboard...</p>
                  </div>
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Secure Access</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto rounded-lg bg-accent/20 flex items-center justify-center">
                <Heart className="h-6 w-6 text-accent" />
              </div>
              <p className="text-xs text-muted-foreground">Health Records</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto rounded-lg bg-destructive/10 flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-destructive" />
              </div>
              <p className="text-xs text-muted-foreground">Emergency SOS</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
