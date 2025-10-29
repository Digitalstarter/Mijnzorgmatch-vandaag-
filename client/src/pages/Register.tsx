import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (data.password !== data.confirmPassword) {
        throw new Error("Wachtwoorden komen niet overeen");
      }
      await apiRequest("POST", "/api/register", {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Account aangemaakt!",
        description: "Je account is succesvol aangemaakt",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Registratie mislukt",
        description: error.message || "Er is iets misgegaan",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Account aanmaken
          </h1>
          <p className="text-muted-foreground">
            Welkom bij MijnZorgMatch.nl
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mailadres *</Label>
            <Input
              id="email"
              type="email"
              placeholder="jouw@email.nl"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Voornaam</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Jan"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Achternaam</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Jansen"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Wachtwoord *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimaal 8 karakters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Bevestig wachtwoord *</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Herhaal je wachtwoord"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              minLength={8}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Bezig met aanmaken..." : "Account aanmaken"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Heb je al een account?{" "}
          <a href="/login" className="text-primary hover:underline font-medium">
            Log hier in
          </a>
        </div>
      </Card>
    </div>
  );
}
