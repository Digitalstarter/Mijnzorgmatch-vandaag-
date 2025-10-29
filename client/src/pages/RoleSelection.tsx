import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Briefcase } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@shared/schema";

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { toast } = useToast();

  const setRoleMutation = useMutation({
    mutationFn: async (role: UserRole) => {
      await apiRequest("PATCH", "/api/auth/user/role", { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: error.message || "Er is iets misgegaan",
        variant: "destructive",
      });
    },
  });

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setRoleMutation.mutate(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-4">
            <Heart className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Welkom bij MijnZorgMatch! 🎉
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Om te beginnen, kies hieronder je rol. Dit bepaalt welke functies en mogelijkheden je krijgt.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card
            className={`p-8 space-y-6 cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 bg-gradient-to-br from-background to-primary/5 ${
              selectedRole === "zzper" ? "ring-4 ring-primary shadow-2xl scale-105" : "hover:ring-2 hover:ring-primary/50"
            }`}
            onClick={() => handleRoleSelect("zzper")}
            data-testid="card-role-zzper"
          >
            <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-semibold text-card-foreground">ZZP'er</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Als zorgprofessional bekijk ik advertenties van bureaus en zorgorganisaties waar ik op kan reageren
              </p>
              <div className="text-xs text-muted-foreground pt-2 space-y-1">
                <p>✓ Bekijk alle advertenties</p>
                <p>✓ Reageer op opdrachten</p>
                <p>✓ Maak je profiel zichtbaar</p>
              </div>
            </div>
            <Button
              className="w-full font-semibold"
              size="lg"
              disabled={setRoleMutation.isPending}
              data-testid="button-select-zzper"
            >
              {selectedRole === "zzper" && setRoleMutation.isPending
                ? "Account wordt aangemaakt..."
                : "Start als ZZP'er"}
            </Button>
          </Card>

          <Card
            className={`p-8 space-y-6 cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 bg-gradient-to-br from-background to-accent/20 ${
              selectedRole === "organisatie" ? "ring-4 ring-primary shadow-2xl scale-105" : "hover:ring-2 hover:ring-primary/50"
            }`}
            onClick={() => handleRoleSelect("organisatie")}
            data-testid="card-role-organisatie"
          >
            <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-semibold text-card-foreground">Zorgorganisatie / Bureau</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Als organisatie of bureau plaats ik advertenties voor opdrachten en projecten
              </p>
              <div className="text-xs text-muted-foreground pt-2 space-y-1">
                <p>✓ Plaats advertenties</p>
                <p>✓ Bekijk reacties van ZZP'ers</p>
                <p>✓ Beheer opdrachten</p>
              </div>
            </div>
            <Button
              className="w-full font-semibold"
              size="lg"
              disabled={setRoleMutation.isPending}
              data-testid="button-select-organisatie"
            >
              {selectedRole === "organisatie" && setRoleMutation.isPending
                ? "Account wordt aangemaakt..."
                : "Start als Organisatie"}
            </Button>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          💡 Tip: Je keuze kan later altijd worden aangepast in je profiel instellingen
        </p>
      </div>
    </div>
  );
}
