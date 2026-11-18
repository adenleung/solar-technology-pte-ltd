import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const enquiries = sqliteTable("enquiries", {
  id: text("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  fingerprint: text("fingerprint").notNull(),
  status: text("status").notNull(),
  createdAt: text("created_at").notNull(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  location: text("location").notNull(),
  buildingType: text("building_type").notNull(),
  roofInformation: text("roof_information").notNull(),
  interest: text("product_interest").notNull(),
  requirements: text("requirements").notNull(),
  configuration: text("configuration"),
  drawingKey: text("drawing_key"),
  drawingName: text("drawing_name"),
  consentVersion: text("consent_version").notNull(),
});

export const submissionWindows = sqliteTable("submission_windows", {
  key: text("key").primaryKey(),
  hour: integer("hour").notNull(),
  count: integer("count").notNull(),
});
