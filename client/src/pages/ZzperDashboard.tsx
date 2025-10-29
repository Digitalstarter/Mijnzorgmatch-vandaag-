import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Heart, MessageCircle, Plus, MapPin, Calendar, Lock } from "lucide-react";
import type { Vacancy, ZzpProfile, Application } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function ZzperDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [showCreditsDialog, setShowCreditsDialog] = useState(false);
  
  const hasAccessToVacancies = () => {
    if (!user) return false;
    return (user.subscriptionStatus === 'active') || ((user.credits || 0) > 0);
  };

  const { data: profile, isLoading: profileLoading } = useQuery<ZzpProfile>({
    queryKey: ["/api/profile"],
  });

  const { data: vacancies, isLoading: vacanciesLoading } = useQuery<Vacancy[]>({
    queryKey: ["/api/vacancies"],
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery<Application[]>({
    queryKey: ["/api/my-applications"],
  });

  const statsLoading = vacanciesLoading || applicationsLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welkom terug! Hier is een overzicht van je activiteiten.</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beschikbare Advertenties</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="stat-vacancies">
                  {vacancies?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Opdrachten van bureaus</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mijn Reacties</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="stat-applications">
                  {applications?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Actieve sollicitaties</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile CTA */}
      {!profileLoading && !profile && (
        <Card className="border-primary/50 bg-accent/30">
          <CardHeader>
            <CardTitle>Maak je profiel compleet</CardTitle>
            <CardDescription>
              Creëer een professioneel profiel om gevonden te worden door zorgorganisaties en bureaus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/profile")} data-testid="button-create-profile">
              <Plus className="h-4 w-4 mr-2" />
              Profiel aanmaken
            </Button>
          </CardContent>
        </Card>
      )}

      {/* All Advertenties */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Alle Advertenties</h2>
          <Button variant="outline" onClick={() => setLocation("/vacancies")} data-testid="button-view-all-vacancies">
            Bekijk alles
          </Button>
        </div>

        {vacanciesLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : vacancies && vacancies.length > 0 ? (
          <div className="space-y-4">
            {vacancies.slice(0, 3).map((vacancy) => {
              const hasAccess = hasAccessToVacancies();
              return (
              <Card key={vacancy.id} className={`hover-elevate transition-all duration-200 ${!hasAccess ? 'relative' : ''}`} data-testid={`vacancy-card-${vacancy.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{vacancy.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {vacancy.organisationName}
                        </span>
                        {hasAccess ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {vacancy.location}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span className="blur-sm">███████</span>
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{vacancy.contractType}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {vacancy.description}
                  </p>
                  {hasAccess ? (
                    <>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {vacancy.requirements.slice(0, 3).map((req, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                      <Button size="sm" onClick={() => setLocation(`/vacancies/${vacancy.id}`)} data-testid={`button-view-vacancy-${vacancy.id}`}>
                        Bekijk details
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-sm text-muted-foreground blur-sm">███ ███████</span>
                        <span className="text-sm text-muted-foreground blur-sm">███████</span>
                      </div>
                      <div className="pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground text-center mb-3">
                          <Lock className="inline h-3 w-3 mr-1" />
                          Koop credits of neem een abonnement om volledige details te zien
                        </p>
                        <Button 
                          size="sm"
                          className="w-full"
                          onClick={() => setShowCreditsDialog(true)}
                        >
                          Credits kopen / Abonnement nemen
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )})}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nog geen advertenties beschikbaar</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Credits Dialog */}
      <Dialog open={showCreditsDialog} onOpenChange={setShowCreditsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Credits of Abonnement nodig</DialogTitle>
            <DialogDescription>
              Om volledige advertenties te bekijken en te reageren, heb je credits of een abonnement nodig.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => {
                  setShowCreditsDialog(false);
                  setLocation('/credits');
                }}
                className="w-full"
              >
                Ga naar Credits & Abonnementen
              </Button>
              <div className="text-sm text-muted-foreground text-center">
                <p>✨ Met credits kun je per advertentie reageren</p>
                <p>🎯 Met een abonnement reageer je onbeperkt</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
