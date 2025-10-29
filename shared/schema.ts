import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles
export type UserRole = "zzper" | "organisatie";

// Users table - Email/Password Authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").$type<UserRole>(),
  credits: integer("credits").notNull().default(0),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  profileImageUrl: true,
});

export const registerUserSchema = insertUserSchema.pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
}).extend({
  password: z.string().min(8, "Wachtwoord moet minimaal 8 karakters zijn"),
  email: z.string().email("Ongeldig e-mailadres"),
});

export type RegisterUser = z.infer<typeof registerUserSchema>;

// ZZP'er profiles
export const zzpProfiles = pgTable("zzp_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title").notNull(),
  bio: text("bio").notNull(),
  expertise: text("expertise").array().notNull(),
  location: varchar("location").notNull(),
  availability: varchar("availability").notNull(),
  hourlyRate: varchar("hourly_rate"),
  experience: text("experience"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const zzpProfilesRelations = relations(zzpProfiles, ({ one }) => ({
  user: one(users, {
    fields: [zzpProfiles.userId],
    references: [users.id],
  }),
}));

export const insertZzpProfileSchema = createInsertSchema(zzpProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertZzpProfile = z.infer<typeof insertZzpProfileSchema>;
export type ZzpProfile = typeof zzpProfiles.$inferSelect;

// Vacancies (posted by organisations)
export const vacancies = pgTable("vacancies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  organisationName: varchar("organisation_name").notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").array().notNull(),
  location: varchar("location").notNull(),
  contractType: varchar("contract_type").notNull(),
  status: varchar("status").notNull().default('active'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vacanciesRelations = relations(vacancies, ({ one }) => ({
  user: one(users, {
    fields: [vacancies.userId],
    references: [users.id],
  }),
}));

export const insertVacancySchema = createInsertSchema(vacancies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export type InsertVacancy = z.infer<typeof insertVacancySchema>;
export type Vacancy = typeof vacancies.$inferSelect;


// Applications/responses
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicantId: varchar("applicant_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  targetType: varchar("target_type").notNull(), // 'vacancy' or 'profile'
  targetId: varchar("target_id").notNull(),
  message: text("message").notNull(),
  status: varchar("status").notNull().default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const applicationsRelations = relations(applications, ({ one }) => ({
  applicant: one(users, {
    fields: [applications.applicantId],
    references: [users.id],
  }),
}));

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

// Messages for chat
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverId: varchar("receiver_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
  }),
}));

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Transactions - Track credit purchases and usage
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar("type").notNull(), // 'credit_purchase', 'subscription_payment', 'application_credit'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  credits: integer("credits"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  description: text("description").notNull(),
  status: varchar("status").notNull().default('completed'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
