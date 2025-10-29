import {
  users,
  zzpProfiles,
  vacancies,
  applications,
  messages,
  transactions,
  type User,
  type UpsertUser,
  type ZzpProfile,
  type InsertZzpProfile,
  type Vacancy,
  type InsertVacancy,
  type Application,
  type InsertApplication,
  type Message,
  type InsertMessage,
  type Transaction,
  type InsertTransaction,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<UpsertUser, 'id'>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  updateUserCredits(id: string, credits: number): Promise<User | undefined>;
  deductCredits(userId: string, amount: number): Promise<User | undefined>;
  updateStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string, subscriptionStatus?: string): Promise<User | undefined>;

  // ZZP Profile operations
  getZzpProfile(userId: string): Promise<ZzpProfile | undefined>;
  getZzpProfileById(id: string): Promise<ZzpProfile | undefined>;
  getAllZzpProfiles(): Promise<ZzpProfile[]>;
  createZzpProfile(profile: InsertZzpProfile): Promise<ZzpProfile>;
  updateZzpProfile(userId: string, profile: Partial<InsertZzpProfile>): Promise<ZzpProfile | undefined>;

  // Vacancy operations
  getVacancy(id: string): Promise<Vacancy | undefined>;
  getAllVacancies(): Promise<Vacancy[]>;
  getMyVacancies(userId: string): Promise<Vacancy[]>;
  createVacancy(vacancy: InsertVacancy): Promise<Vacancy>;
  updateVacancy(id: string, vacancy: Partial<InsertVacancy>): Promise<Vacancy | undefined>;

  // Application operations
  getApplication(id: string): Promise<Application | undefined>;
  getMyApplications(userId: string): Promise<Application[]>;
  getApplicationsForTarget(targetType: string, targetId: string): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: string, status: string): Promise<Application | undefined>;

  // Message operations
  getConversation(user1Id: string, user2Id: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markAsRead(messageId: string): Promise<void>;

  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: Omit<UpsertUser, 'id'>): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserCredits(id: string, credits: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ credits, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deductCredits(userId: string, amount: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const newCredits = Math.max(0, (user.credits || 0) - amount);
    return this.updateUserCredits(userId, newCredits);
  }

  async updateStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string, subscriptionStatus?: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId, 
        stripeSubscriptionId,
        subscriptionStatus,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // ZZP Profile operations
  async getZzpProfile(userId: string): Promise<ZzpProfile | undefined> {
    const [profile] = await db
      .select()
      .from(zzpProfiles)
      .where(eq(zzpProfiles.userId, userId));
    return profile;
  }

  async getZzpProfileById(id: string): Promise<ZzpProfile | undefined> {
    const [profile] = await db
      .select()
      .from(zzpProfiles)
      .where(eq(zzpProfiles.id, id));
    return profile;
  }

  async getAllZzpProfiles(): Promise<ZzpProfile[]> {
    return await db
      .select()
      .from(zzpProfiles)
      .orderBy(desc(zzpProfiles.createdAt));
  }

  async createZzpProfile(profileData: InsertZzpProfile): Promise<ZzpProfile> {
    const [profile] = await db
      .insert(zzpProfiles)
      .values(profileData)
      .returning();
    return profile;
  }

  async updateZzpProfile(userId: string, profileData: Partial<InsertZzpProfile>): Promise<ZzpProfile | undefined> {
    const [profile] = await db
      .update(zzpProfiles)
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(zzpProfiles.userId, userId))
      .returning();
    return profile;
  }

  // Vacancy operations
  async getVacancy(id: string): Promise<Vacancy | undefined> {
    const [vacancy] = await db
      .select()
      .from(vacancies)
      .where(eq(vacancies.id, id));
    return vacancy;
  }

  async getAllVacancies(): Promise<Vacancy[]> {
    return await db
      .select()
      .from(vacancies)
      .where(eq(vacancies.status, 'active'))
      .orderBy(desc(vacancies.createdAt));
  }

  async getMyVacancies(userId: string): Promise<Vacancy[]> {
    return await db
      .select()
      .from(vacancies)
      .where(eq(vacancies.userId, userId))
      .orderBy(desc(vacancies.createdAt));
  }

  async createVacancy(vacancyData: InsertVacancy): Promise<Vacancy> {
    const [vacancy] = await db
      .insert(vacancies)
      .values(vacancyData)
      .returning();
    return vacancy;
  }

  async updateVacancy(id: string, vacancyData: Partial<InsertVacancy>): Promise<Vacancy | undefined> {
    const [vacancy] = await db
      .update(vacancies)
      .set({ ...vacancyData, updatedAt: new Date() })
      .where(eq(vacancies.id, id))
      .returning();
    return vacancy;
  }

  // Application operations
  async getApplication(id: string): Promise<Application | undefined> {
    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, id));
    return application;
  }

  async getMyApplications(userId: string): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.applicantId, userId))
      .orderBy(desc(applications.createdAt));
  }

  async getApplicationsForTarget(targetType: string, targetId: string): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.targetType, targetType),
          eq(applications.targetId, targetId)
        )
      )
      .orderBy(desc(applications.createdAt));
  }

  async createApplication(applicationData: InsertApplication): Promise<Application> {
    const [application] = await db
      .insert(applications)
      .values(applicationData)
      .returning();
    return application;
  }

  async updateApplicationStatus(id: string, status: string): Promise<Application | undefined> {
    const [application] = await db
      .update(applications)
      .set({ status, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return application;
  }

  // Message operations
  async getConversation(user1Id: string, user2Id: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, user1Id),
            eq(messages.receiverId, user2Id)
          ),
          and(
            eq(messages.senderId, user2Id),
            eq(messages.receiverId, user1Id)
          )
        )
      )
      .orderBy(messages.createdAt);
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(messageData)
      .returning();
    return message;
  }

  async markAsRead(messageId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId));
  }

  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(transactionData)
      .returning();
    return transaction;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }
}

export const storage = new DatabaseStorage();
