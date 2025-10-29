import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Check, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from '@/lib/queryClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const stripeEnabled = Boolean(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const stripePromise = stripeEnabled ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) : null;

function CreditPurchaseForm({ credits, price, onSuccess }: { credits: number; price: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Betaling mislukt",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        await apiRequest('POST', '/api/confirm-payment', { 
          paymentIntentId: paymentIntent.id 
        });
        
        toast({
          title: "Betaling geslaagd!",
          description: `${credits} credits zijn toegevoegd aan je account.`,
        });
        
        onSuccess();
      }
    } catch (err: any) {
      toast({
        title: "Fout",
        description: err.message || "Er ging iets mis",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || isProcessing} className="w-full">
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verwerken...
          </>
        ) : (
          `Betaal €${price.toFixed(2)}`
        )}
      </Button>
    </form>
  );
}

function SubscriptionForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Betaling mislukt",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Abonnement geactiveerd!",
          description: "Je kunt nu onbeperkt reageren op vacatures.",
        });
        
        onSuccess();
      }
    } catch (err: any) {
      toast({
        title: "Fout",
        description: err.message || "Er ging iets mis",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || isProcessing} className="w-full">
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verwerken...
          </>
        ) : (
          'Abonnement starten - €14,99/maand'
        )}
      </Button>
    </form>
  );
}

export default function Credits() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [creditClientSecret, setCreditClientSecret] = useState('');
  const [subscriptionClientSecret, setSubscriptionClientSecret] = useState('');
  const [selectedCredits, setSelectedCredits] = useState(0);
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [showCreditPurchase, setShowCreditPurchase] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await apiRequest('GET', '/api/transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleBuyCredits = async (credits: number, price: number) => {
    setIsLoadingPayment(true);
    setSelectedCredits(credits);
    setSelectedPrice(price);
    
    try {
      const response = await apiRequest('POST', '/api/create-payment-intent', { credits, price });
      const data = await response.json();
      setCreditClientSecret(data.clientSecret);
      setShowCreditPurchase(true);
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Kon betaling niet starten",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const handleStartSubscription = async () => {
    setIsLoadingPayment(true);
    
    try {
      const response = await apiRequest('POST', '/api/create-subscription', {});
      const data = await response.json();
      setSubscriptionClientSecret(data.clientSecret);
      setShowSubscription(true);
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Kon abonnement niet starten",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const response = await apiRequest('POST', '/api/cancel-subscription', {});
      const data = await response.json();
      
      toast({
        title: "Abonnement geannuleerd",
        description: data.message,
      });
      
      await refreshUser();
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Kon abonnement niet annuleren",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = async () => {
    setCreditClientSecret('');
    setSubscriptionClientSecret('');
    setShowCreditPurchase(false);
    setShowSubscription(false);
    await refreshUser();
    await fetchTransactions();
  };

  const creditPackages = [
    { credits: 1, price: 2, popular: false },
    { credits: 5, price: 7.50, popular: true },
    { credits: 10, price: 9.99, popular: false },
  ];

  if (!stripeEnabled) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Credits & Abonnementen</h1>
          <p className="text-muted-foreground mt-2">
            Beheer je credits en abonnementen voor het reageren op vacatures
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Betalingen niet geconfigureerd</AlertTitle>
          <AlertDescription>
            De betalingsfunctionaliteit is momenteel niet beschikbaar. 
            Neem contact op met de beheerder om Stripe te configureren.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Je Saldo</CardTitle>
            <CardDescription>Huidige credits en abonnement status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Credits</span>
              <Badge variant="secondary" className="text-lg">
                {user?.credits || 0}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Abonnement</span>
              {user?.subscriptionStatus === 'active' ? (
                <Badge className="bg-green-600">
                  <Check className="mr-1 h-3 w-3" />
                  Actief
                </Badge>
              ) : (
                <Badge variant="outline">
                  <X className="mr-1 h-3 w-3" />
                  Niet actief
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Credits & Abonnementen</h1>
        <p className="text-muted-foreground mt-2">
          Beheer je credits en abonnementen voor het reageren op vacatures
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Je Saldo</CardTitle>
            <CardDescription>Huidige credits en abonnement status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Credits</span>
              <Badge variant="secondary" className="text-lg">
                {user?.credits || 0}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Abonnement</span>
              {user?.subscriptionStatus === 'active' ? (
                <Badge className="bg-green-600">
                  <Check className="mr-1 h-3 w-3" />
                  Actief
                </Badge>
              ) : (
                <Badge variant="outline">
                  <X className="mr-1 h-3 w-3" />
                  Niet actief
                </Badge>
              )}
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                💡 Met een actief abonnement kun je onbeperkt reageren op vacatures!
              </p>
            </div>
          </CardContent>
        </Card>

        {user?.subscriptionStatus === 'active' ? (
          <Card className="border-green-600">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Check className="mr-2 h-5 w-5 text-green-600" />
                Premium Abonnement
              </CardTitle>
              <CardDescription>Onbeperkt reageren op vacatures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">€14,99/maand</div>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  <Check className="mr-2 h-4 w-4 text-green-600" />
                  Onbeperkt solliciteren
                </li>
                <li className="flex items-center text-sm">
                  <Check className="mr-2 h-4 w-4 text-green-600" />
                  Geen credits nodig
                </li>
                <li className="flex items-center text-sm">
                  <Check className="mr-2 h-4 w-4 text-green-600" />
                  Annuleer wanneer je wilt
                </li>
              </ul>
              <Button
                variant="outline"
                onClick={handleCancelSubscription}
                className="w-full"
              >
                Abonnement opzeggen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Premium Abonnement</CardTitle>
              <CardDescription>Onbeperkt reageren op vacatures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">€14,99/maand</div>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  Onbeperkt solliciteren
                </li>
                <li className="flex items-center text-sm">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  Geen credits nodig
                </li>
                <li className="flex items-center text-sm">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  Annuleer wanneer je wilt
                </li>
              </ul>
              <Button
                onClick={handleStartSubscription}
                disabled={isLoadingPayment}
                className="w-full"
              >
                {isLoadingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Laden...
                  </>
                ) : (
                  'Start abonnement'
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {!showCreditPurchase && !showSubscription && user?.subscriptionStatus !== 'active' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Koop Credits</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {creditPackages.map((pkg) => (
              <Card key={pkg.credits} className={pkg.popular ? 'border-primary' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{pkg.credits} Credits</span>
                    {pkg.popular && (
                      <Badge variant="default">Populair</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    €{pkg.price.toFixed(2)} (€{(pkg.price / pkg.credits).toFixed(2)}/credit)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleBuyCredits(pkg.credits, pkg.price)}
                    disabled={isLoadingPayment}
                    className="w-full"
                    variant={pkg.popular ? 'default' : 'outline'}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Kopen
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {showCreditPurchase && creditClientSecret && (
        <Card>
          <CardHeader>
            <CardTitle>Betaling voltooien</CardTitle>
            <CardDescription>
              Je koopt {selectedCredits} credits voor €{selectedPrice.toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret: creditClientSecret }}>
              <CreditPurchaseForm credits={selectedCredits} price={selectedPrice} onSuccess={handlePaymentSuccess} />
            </Elements>
            <Button
              variant="ghost"
              onClick={() => setShowCreditPurchase(false)}
              className="w-full mt-4"
            >
              Annuleren
            </Button>
          </CardContent>
        </Card>
      )}

      {showSubscription && subscriptionClientSecret && (
        <Card>
          <CardHeader>
            <CardTitle>Abonnement starten</CardTitle>
            <CardDescription>
              Premium abonnement voor €14,99 per maand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret: subscriptionClientSecret }}>
              <SubscriptionForm onSuccess={handlePaymentSuccess} />
            </Elements>
            <Button
              variant="ghost"
              onClick={() => setShowSubscription(false)}
              className="w-full mt-4"
            >
              Annuleren
            </Button>
          </CardContent>
        </Card>
      )}

      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transactie Historie</CardTitle>
            <CardDescription>Je recente aankopen en gebruik</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                  <div className="text-right">
                    {transaction.credits && (
                      <Badge variant={transaction.credits > 0 ? 'default' : 'secondary'}>
                        {transaction.credits > 0 ? '+' : ''}{transaction.credits} credits
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
