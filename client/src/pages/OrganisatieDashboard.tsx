import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MessageCircle, Plus, Eye, FileText } from "lucide-react";
import type { Vacancy, Application } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";

export default function OrganisatieDashboard() {
  const [, setLocation] = useLocation();

  const { data: vacancies, isLoading: vacanciesLoading } = useQuery<Vacancy[]>({
    queryKey: ["/api/my-vacancies"],
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const statsLoading = vacanciesLoading || applicationsLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Beheer je advertenties en bekijk reacties van professionals.</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mijn Advertenties</CardTitle>
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
                <p className="text-xs text-muted-foreground mt-1">Actieve advertenties</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reacties</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="stat-applications">
                  {applications?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Van professionals</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Berichten</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Ongelezen berichten</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-primary/50 bg-accent/30">
        <CardHeader>
          <CardTitle>Nieuwe advertentie plaatsen</CardTitle>
          <CardDescription>
            Bereik direct honderden zorgprofessionals met je advertentie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setLocation("/my-vacancies/new")} data-testid="button-create-vacancy">
            <Plus className="h-4 w-4 mr-2" />
            Advertentie aanmaken
          </Button>
        </CardContent>
      </Card>

      {/* My Advertenties */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Mijn Advertenties</h2>
          <Button variant="outline" onClick={() => setLocation("/my-vacancies")} data-testid="button-view-all-vacancies">
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
            {vacancies.map((vacancy) => (
              <Card key={vacancy.id} className="hover-elevate transition-all duration-200" data-testid={`vacancy-card-${vacancy.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{vacancy.title}</CardTitle>
                      <CardDescription>{vacancy.location} · {vacancy.contractType}</CardDescription>
                    </div>
                    <Badge variant={vacancy.status === 'active' ? 'default' : 'secondary'}>
                      {vacancy.status === 'active' ? 'Actief' : 'Inactief'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {vacancy.description}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" data-testid={`button-view-vacancy-${vacancy.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Bekijk
                    </Button>
                    <Button size="sm" variant="outline" data-testid={`button-vacancy-applications-${vacancy.id}`}>
                      <FileText className="h-4 w-4 mr-2" />
                      Reacties
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Je hebt nog geen advertenties geplaatst</p>
              <Button onClick={() => setLocation("/my-vacancies/new")} data-testid="button-create-first-vacancy">
                <Plus className="h-4 w-4 mr-2" />
                Eerste advertentie plaatsen
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
