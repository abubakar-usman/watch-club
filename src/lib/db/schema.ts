import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  unique,
  AnyPgColumn,
} from "drizzle-orm/pg-core";

// ── Better Auth Tables ──────────────────────────────────────────────────
// Note: id generation for these tables is handled internally by Better Auth's
// own insert logic — no $defaultFn needed here.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Custom Application Tables ──────────────────────────────────────────
// These tables need an explicit default ID generator since our own API
// routes handle inserts directly, not through Better Auth's internal logic.

export const reactionTypeEnum = pgEnum("reaction_type", [
  "like",
  "love",
  "favorite",
  "dislike",
]);

export const comments = pgTable("comments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  movieId: text("movie_id").notNull(),
  content: text("content").notNull(),
  parentCommentId: text("parent_comment_id").references(
    (): AnyPgColumn => comments.id,
    { onDelete: "cascade" }
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const watchlist = pgTable("watchlist", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  movieId: text("movie_id").notNull(),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});

export const reactions = pgTable(
  "reactions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    movieId: text("movie_id").notNull(),
    type: reactionTypeEnum("type").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    unique("user_movie_reaction_unique").on(table.userId, table.movieId),
  ]
);