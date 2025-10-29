import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { insertVacancySchema, type InsertVacancy } from "@shared/schema";
import { Loader2, Plus, X } from "lucide-react";
import { useLocation } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function VacancyForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<InsertVacancy>({
    resolver: zodResolver(insertVacancySchema),
    defaultValues: {
      userId: "",
      organisationName: "",
      title: "",
      description: "",
      requirements: [],
      location: "",
      contractType: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertVacancy) => {
      await apiRequest("POST", "/api/vacancies", data);
    },
    onSuccess: () => {
      toast({
        title: "Succes!",
        description: "Vacature geplaatst",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-vacancies"] });
      setLocation("/my-vacancies");
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

  const onSubmit = (data: InsertVacancy) => {
    mutation.mutate(data);
  };

  const addRequirement = () => {
    const current = form.getValues("requirements");
    form.setValue("requirements", [...current, ""]);
  };

  const removeRequirement = (index: number) => {
    const current = form.getValues("requirements");
    form.setValue("requirements", current.filter((_, i) => i !== index));
  };

  const updateRequirement = (index: number, value: string) => {
    const current = form.getValues("requirements");
    current[index] = value;
    form.setValue("requirements", [...current]);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Nieuwe vacature</h1>
        <p className="text-muted-foreground">
          Plaats een vacature en bereik direct honderden zorgprofessionals
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vacature details</CardTitle>
          <CardDescription>Vul de gegevens in voor je vacature</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="organisationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organisatienaam *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bijv. Zorggroep Amsterdam"
                        {...field}
                        data-testid="input-organisation-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vacaturetitel *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bijv. Verzorgende IG gezocht"
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Omschrijving *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Beschrijf de vacature, werkzaamheden en wat jullie te bieden hebben..."
                        className="min-h-32"
                        {...field}
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormDescription>
                      Geef een duidelijk beeld van de functie en wat je zoekt
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Eisen en wensen *</FormLabel>
                <FormDescription>
                  Voeg de vereisten en wensen voor deze functie toe
                </FormDescription>
                {form.watch("requirements").map((req, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={req}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      placeholder="Bijv. MBO diploma niveau 3 vereist"
                      data-testid={`input-requirement-${index}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeRequirement(index)}
                      data-testid={`button-remove-requirement-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addRequirement}
                  data-testid="button-add-requirement"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Eis toevoegen
                </Button>
                {form.formState.errors.requirements && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.requirements.message}
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
                  name="contractType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract type *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Bijv. Oproepcontract, ZZP"
                          {...field}
                          data-testid="input-contract-type"
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
                  Vacature plaatsen
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/my-vacancies")}
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
