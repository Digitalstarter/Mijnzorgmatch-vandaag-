import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Briefcase, MessageCircle, CheckCircle, Shield, Clock } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import logoImage from "@assets/Mijnzorgmatch (1000 x 600 px)_1761703998925.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoImage} alt="MijnZorgMatch.nl" className="h-16" />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              onClick={() => window.location.href = "/login"}
              data-testid="button-login"
              className="font-semibold"
            >
              Inloggen
            </Button>
            <Button
              onClick={() => window.location.href = "/register"}
              data-testid="button-register"
              className="font-semibold"
            >
              Registreren
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Vind de juiste <span className="text-primary">zorgmatch</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Het platform waar zorgprofessionals en zorgorganisaties elkaar vinden voor kwalitatieve zorg en begeleiding.
              </p>
              <div className="space-y-4">
                <p className="font-medium text-foreground">Maak een account als:</p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    onClick={() => window.location.href = "/register"}
                    data-testid="button-hero-register-zzper"
                    className="text-base px-6 font-semibold flex items-center gap-2"
                  >
                    <Briefcase className="h-5 w-5" />
                    ZZP'er
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => window.location.href = "/register"}
                    data-testid="button-hero-register-organisatie"
                    className="text-base px-6 font-semibold flex items-center gap-2"
                  >
                    <Users className="h-5 w-5" />
                    Zorgorganisatie
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                <CheckCircle className="inline h-4 w-4 text-primary mr-2" />
                Meer dan 500+ professionals actief • Gratis account aanmaken
              </p>
            </div>
            <div className="relative">
              <Card className="p-6 space-y-4 bg-gradient-to-br from-background to-primary/5 border-2 border-primary/20 shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-primary">Voorbeeld Advertentie</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Detachering gezocht - 6 maanden
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Asielzoekerscentrum • MBO-4 vereist
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 border-t border-border">
                    <span className="text-sm font-medium text-foreground">Uurtarief</span>
                    <span className="text-lg font-bold text-primary">€48,00 per uur</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-border">
                    <span className="text-sm font-medium text-foreground">Locatie</span>
                    <span className="text-sm text-muted-foreground blur-sm">███████</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-border">
                    <span className="text-sm font-medium text-foreground">Contactpersoon</span>
                    <span className="text-sm text-muted-foreground blur-sm">█████</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center mb-3">
                    🔒 Maak een gratis account aan om volledige details te zien
                  </p>
                  <Button 
                    className="w-full font-semibold"
                    onClick={() => window.location.href = "/register"}
                  >
                    Direct Reageren
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold text-foreground mb-4">Hoe werkt het?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Twee gebruikerstypen, één platform voor de perfecte match
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* ZZP'er Card */}
            <Card className="p-8 space-y-6 hover-elevate transition-all duration-200 bg-gradient-to-br from-background to-primary/5 flex flex-col">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground">Zorgprofessional (ZZP'er)</h3>
              <p className="text-muted-foreground">Ik bied zorg en begeleiding en zoek opdrachten.</p>
              <ul className="space-y-3 flex-1">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Bekijk advertenties van zorgorganisaties en bureaus</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Zie uurtarieven en opdracht details</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Maak je eigen profiel en solliciteer direct</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Chat met opdrachtgevers bij een match</span>
                </li>
              </ul>
              <div className="mt-auto">
                <Button 
                  onClick={() => window.location.href = "/register"}
                  className="w-full font-semibold"
                  data-testid="button-register-zzper"
                >
                  Registreer als ZZP'er
                </Button>
              </div>
            </Card>

            {/* Organisation Card */}
            <Card className="p-8 space-y-6 hover-elevate transition-all duration-200 bg-gradient-to-br from-background to-accent/20 flex flex-col">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground">Zorgorganisatie / Bureau</h3>
              <p className="text-muted-foreground">Wij zoeken gekwalificeerde zorgprofessionals voor opdrachten en projecten.</p>
              <ul className="space-y-3 flex-1">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Plaats vacatures en zorgopdrachten</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Toegang tot netwerk van ZZP'ers</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Direct contact en snelle matching</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Beheer opdrachten in één dashboard</span>
                </li>
              </ul>
              <div className="mt-auto">
                <Button 
                  onClick={() => window.location.href = "/register"}
                  className="w-full font-semibold"
                  data-testid="button-register-organisatie"
                >
                  Registreer als Organisatie
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold text-foreground mb-4">Waarom MijnZorgMatch?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Veilig & Betrouwbaar</h3>
              <p className="text-muted-foreground">
                Alle professionals worden geverifieerd voor uw veiligheid en gemoedsrust
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Snel Matchen</h3>
              <p className="text-muted-foreground">
                Vind binnen enkele dagen de juiste zorgprofessional of opdracht
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Direct Contact</h3>
              <p className="text-muted-foreground">
                Chat direct met kandidaten en start de samenwerking vandaag nog
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl font-semibold mb-6">Klaar om te beginnen?</h2>
          <p className="text-xl mb-8 opacity-90">
            Word lid van MijnZorgMatch en vind vandaag nog de perfecte zorgmatch
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => window.location.href = "/register"}
              data-testid="button-cta-signup"
              className="text-base px-8 font-semibold"
            >
              Aanmelden
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src={logoImage} alt="MijnZorgMatch.nl" className="h-10" />
              </div>
              <p className="text-sm text-muted-foreground">
                Het platform voor professionele zorgmatching in Nederland
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Voor ZZP'ers</li>
                <li>Voor Organisaties</li>
                <li>Voor Ouders</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Ondersteuning</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Help Center</li>
                <li>Contact</li>
                <li>Veelgestelde vragen</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Juridisch</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacybeleid</li>
                <li>Algemene voorwaarden</li>
                <li>Cookiebeleid</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2025 MijnZorgMatch.nl. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
