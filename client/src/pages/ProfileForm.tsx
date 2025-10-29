import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { insertZzpProfileSchema, type InsertZzpProfile, type ZzpProfile } from "@shared/schema";
import { Loader2, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function ProfileForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: existingProfile, isLoading: profileLoading } = useQuery<ZzpProfile>({
    queryKey: ["/api/profile"],
  });

  const form = useForm<InsertZzpProfile>({
    resolver: zodResolver(insertZzpProfileSchema),
    defaultValues: {
      userId: "",
      title: "",
      bio: "",
      expertise: [],
      location: "",
      availability: "",
      hourlyRate: "",
      experience: "",
    },
  });

  useEffect(() => {
    if (existingProfile) {
      form.reset({
        userId: existingProfile.userId,
        title: existingProfile.title,
        bio: existingProfile.bio,
        expertise: existingProfile.expertise,
        location: existingProfile.location,
        availability: existingProfile.availability,
        hourlyRate: existingProfile.hourlyRate || "",
        experience: existingProfile.experience || "",
      });
    }
  }, [existingProfile, form]);

  const mutation = useMutation({
    mutationFn: async (data: InsertZzpProfile) => {
      if (existingProfile) {
        await apiRequest("PATCH", "/api/profile", data);
      } else {
        await apiRequest("POST", "/api/profile", data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Succes!",
        description: existingProfile ? "Profiel bijgewerkt" : "Profiel aangemaakt",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setLocation("/");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Niet geautoriseerd",
          description: "Je bent uitgelogd. Je wordt opnieuw ingelogd...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Fout",
        description: error.message || "Er is iets misgegaan",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertZzpProfile) => {
    mutation.mutate(data);
  };

  const addExpertise = () => {
    const current = form.getValues("expertise");
    form.setValue("expertise", [...current, ""]);
  };

  const removeExpertise = (index: number) => {
    const current = form.getValues("expertise");
    form.setValue("expertise", current.filter((_, i) => i !== index));
  };

  const updateExpertise = (index: number, value: string) => {
    const current = form.getValues("expertise");
    current[index] = value;
    form.setValue("expertise", [...current]);
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {existingProfile ? "Profiel bewerken" : "Profiel aanmaken"}
        </h1>
        <p className="text-muted-foreground">
          Maak een professioneel profiel om gevonden te worden door zorgorganisaties en ouders/mantelzorgers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profiel informatie</CardTitle>
          <CardDescription>Vul je gegevens in om een aantrekkelijk profiel te maken</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Functietitel *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bijv. Gediplomeerd Zorgverlener"
                        {...field}
                        data-testid="input-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Over mij *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Vertel iets over jezelf, je ervaring en werkwijze..."
                        className="min-h-32"
                        {...field}
                        data-testid="input-bio"
                      />
                    </FormControl>
                    <FormDescription>
                      Een goede omschrijving helpt om de juiste matches te vinden
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Expertises *</FormLabel>
                <FormDescription>
                  Voeg je specialisaties en expertises toe
                </FormDescription>
                {form.watch("expertise").map((exp, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={exp}
                      onChange={(e) => updateExpertise(index, e.target.value)}
                      placeholder="Bijv. Kindzorg, Ouderenzorg, etc."
                      data-testid={`input-expertise-${index}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeExpertise(index)}
                      data-testid={`button-remove-expertise-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addExpertise}
                  data-testid="button-add-expertise"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Expertise toevoegen
                </Button>
                {form.formState.errors.expertise && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.expertise.message}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Locatie *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Bijv. Amsterdam"
                          {...field}
                          data-testid="input-location"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beschikbaarheid *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Bijv. Fulltime, Parttime"
                          {...field}
                          data-testid="input-availability"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Uurtarief (optioneel)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Bijv. €35-45 per uur"
                          {...field}
                          data-testid="input-hourly-rate"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ervaring (optioneel)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Bijv. 5+ jaar ervaring"
                          {...field}
                          data-testid="input-experience"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  data-testid="button-submit"
                >
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {existingProfile ? "Profiel bijwerken" : "Profiel aanmaken"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/")}
                  data-testid="button-cancel"
                >
                  Annuleren
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
