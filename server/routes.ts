import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./localAuth";
import {
  insertZzpProfileSchema,
  insertVacancySchema,
  insertApplicationSchema,
  insertMessageSchema,
} from "@shared/schema";
import Stripe from "stripe";

console.log('=== STRIPE DEBUG ===');
console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
console.log('STRIPE_SECRET_KEY length:', process.env.STRIPE_SECRET_KEY?.length || 0);

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

console.log('Stripe initialized:', !!stripe);
console.log('===================');

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        credits: user.credits || 0,
        subscriptionStatus: user.subscriptionStatus,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch('/api/auth/user/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { role } = req.body;

      if (!role || !['zzper', 'organisatie'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const user = await storage.updateUserRole(userId, role);
      res.json({
        id: user!.id,
        email: user!.email,
        firstName: user!.firstName,
        lastName: user!.lastName,
        role: user!.role,
      });
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  // Credits and Payment routes
  app.post('/api/create-payment-intent', isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Betalingen zijn momenteel niet beschikbaar. Neem contact op met de beheerder." });
      }

      const userId = req.user.id;
      const { credits, price } = req.body;
      
      if (!credits || credits <= 0) {
        return res.status(400).json({ message: "Ongeldig aantal credits" });
      }

      if (!price || price <= 0) {
        return res.status(400).json({ message: "Ongeldige prijs" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(price * 100),
        currency: "eur",
        metadata: {
          userId,
          credits: credits.toString(),
        },
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount: price,
        credits 
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Fout bij aanmaken betaling: " + error.message });
    }
  });

  app.post('/api/confirm-payment', isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Betalingen zijn momenteel niet beschikbaar. Neem contact op met de beheerder." });
      }

      const userId = req.user.id;
      const { paymentIntentId } = req.body;

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded' && paymentIntent.metadata.userId === userId) {
        const credits = parseInt(paymentIntent.metadata.credits || '0');
        const user = await storage.getUser(userId);
        
        if (user) {
          const newCredits = (user.credits || 0) + credits;
          await storage.updateUserCredits(userId, newCredits);
          
          await storage.createTransaction({
            userId,
            type: 'credit_purchase',
            amount: (paymentIntent.amount / 100).toString(),
            credits,
            stripePaymentIntentId: paymentIntentId,
            description: `Aankoop van ${credits} credits`,
            status: 'completed',
          });

          res.json({ success: true, credits: newCredits });
        }
      } else {
        res.status(400).json({ message: "Betaling niet geslaagd" });
      }
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Fout bij bevestigen betaling: " + error.message });
    }
  });

  app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Gebruiker niet gevonden" });
      }

      if (user.stripeSubscriptionId && user.subscriptionStatus === 'active') {
        return res.status(400).json({ message: "Je hebt al een actief abonnement" });
      }

      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          metadata: { userId },
        });
        customerId = customer.id;
        await storage.updateStripeInfo(userId, customerId);
      }

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'MijnZorgMatch Premium Abonnement',
              description: 'Onbeperkt reageren op vacatures',
            },
            unit_amount: 1499,
            recurring: {
              interval: 'month',
            },
          },
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateStripeInfo(userId, customerId, subscription.id, subscription.status);

      const invoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

      res.json({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Fout bij aanmaken abonnement: " + error.message });
    }
  });

  app.post('/api/cancel-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || !user.stripeSubscriptionId) {
        return res.status(404).json({ message: "Geen actief abonnement gevonden" });
      }

      const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      await storage.updateStripeInfo(userId, user.stripeCustomerId!, user.stripeSubscriptionId, subscription.status);

      res.json({ 
        success: true, 
        message: "Abonnement wordt geannuleerd aan het einde van de periode",
        cancelAt: subscription.cancel_at 
      });
    } catch (error: any) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ message: "Fout bij annuleren abonnement: " + error.message });
    }
  });

  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Fout bij ophalen transacties" });
    }
  });

  // ZZP Profile routes
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profile = await storage.getZzpProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.get('/api/profiles', isAuthenticated, async (req: any, res) => {
    try {
      const profiles = await storage.getAllZzpProfiles();
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  app.get('/api/profiles/:id', isAuthenticated, async (req: any, res) => {
    try {
      const profile = await storage.getZzpProfileById(req.params.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const data = insertZzpProfileSchema.parse({ ...req.body, userId });
      const profile = await storage.createZzpProfile(data);
      res.json(profile);
    } catch (error: any) {
      console.error("Error creating profile:", error);
      res.status(400).json({ message: error.message || "Failed to create profile" });
    }
  });

  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const data = req.body;
      const profile = await storage.updateZzpProfile(userId, data);
      res.json(profile);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      res.status(400).json({ message: error.message || "Failed to update profile" });
    }
  });

  // Vacancy routes
  app.get('/api/vacancies', isAuthenticated, async (req: any, res) => {
    try {
      const vacancies = await storage.getAllVacancies();
      res.json(vacancies);
    } catch (error) {
      console.error("Error fetching vacancies:", error);
      res.status(500).json({ message: "Failed to fetch vacancies" });
    }
  });

  app.get('/api/my-vacancies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const vacancies = await storage.getMyVacancies(userId);
      res.json(vacancies);
    } catch (error) {
      console.error("Error fetching my vacancies:", error);
      res.status(500).json({ message: "Failed to fetch my vacancies" });
    }
  });

  app.get('/api/vacancies/:id', isAuthenticated, async (req: any, res) => {
    try {
      const vacancy = await storage.getVacancy(req.params.id);
      if (!vacancy) {
        return res.status(404).json({ message: "Vacancy not found" });
      }
      res.json(vacancy);
    } catch (error) {
      console.error("Error fetching vacancy:", error);
      res.status(500).json({ message: "Failed to fetch vacancy" });
    }
  });

  app.post('/api/vacancies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const data = insertVacancySchema.parse({ ...req.body, userId });
      const vacancy = await storage.createVacancy(data);
      res.json(vacancy);
    } catch (error: any) {
      console.error("Error creating vacancy:", error);
      res.status(400).json({ message: error.message || "Failed to create vacancy" });
    }
  });

  // Application routes
  app.get('/api/my-applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const apps = await storage.getMyApplications(userId);
      res.json(apps);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get all vacancies or help requests created by this user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let apps: any[] = [];

      if (user.role === 'organisatie') {
        const vacancies = await storage.getMyVacancies(userId);
        for (const vacancy of vacancies) {
          const vacancyApps = await storage.getApplicationsForTarget('vacancy', vacancy.id);
          apps.push(...vacancyApps);
        }
      }

      res.json(apps);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Gebruiker niet gevonden" });
      }

      if (user.role === 'zzper') {
        const hasActiveSubscription = user.subscriptionStatus === 'active';
        const creditsRequired = 1;
        
        if (!hasActiveSubscription) {
          if ((user.credits || 0) < creditsRequired) {
            return res.status(402).json({ 
              message: "Onvoldoende credits. Koop credits of neem een abonnement.",
              creditsNeeded: creditsRequired,
              currentCredits: user.credits || 0
            });
          }
          
          await storage.deductCredits(userId, creditsRequired);
          
          await storage.createTransaction({
            userId,
            type: 'application_credit',
            amount: '0',
            credits: -creditsRequired,
            description: `Credit gebruikt voor sollicitatie`,
            status: 'completed',
          });
        }
      }
      
      const data = insertApplicationSchema.parse({ ...req.body, applicantId: userId });
      const application = await storage.createApplication(data);
      res.json(application);
    } catch (error: any) {
      console.error("Error creating application:", error);
      res.status(400).json({ message: error.message || "Failed to create application" });
    }
  });

  // Message routes
  app.get('/api/messages/:otherUserId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { otherUserId } = req.params;
      const conversation = await storage.getConversation(userId, otherUserId);
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const data = insertMessageSchema.parse({ ...req.body, senderId: userId });
      const message = await storage.createMessage(data);
      res.json(message);
    } catch (error: any) {
      console.error("Error creating message:", error);
      res.status(400).json({ message: error.message || "Failed to create message" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Setup WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data: string) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Broadcast message to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
          }
        });
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
