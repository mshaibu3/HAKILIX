import { integer, pgTable, serial, text, timestamp, boolean, jsonb, doublePrecision } from "drizzle-orm/pg-core";

// Users table (integrates with Firebase Auth)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(), // Firebase Auth UID
  email: text("email").notNull(),
  role: text("role").default("carer"), // 'carer', 'clinician', 'manager'
  createdAt: timestamp("created_at").defaultNow(),
});

// Organisations table
export const organisations = pgTable("organisations", {
  id: text("id").primaryKey(), // e.g. 'org-hakilix-demo-01'
  name: text("name").notNull(),
  organisationType: text("organisation_type").notNull(),
  registrationNumber: text("registration_number"),
  addressLine1: text("address_line_1"),
  city: text("city"),
  postcode: text("postcode"),
  country: text("country"),
  status: text("status").default("active"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

// Facilities table
export const facilities = pgTable("facilities", {
  id: text("id").primaryKey(), // e.g. 'fac-rosewood-01'
  organisationId: text("organisation_id").references(() => organisations.id).notNull(),
  name: text("name").notNull(),
  facilityType: text("facility_type").notNull(),
  addressLine1: text("address_line_1"),
  city: text("city"),
  postcode: text("postcode"),
  country: text("country"),
  managerUserId: text("manager_user_id"),
  numberOfRooms: integer("number_of_rooms").default(10),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

// Properties table
export const properties = pgTable("properties", {
  id: text("id").primaryKey(), // e.g. 'prop-rosewood-main-01'
  organisationId: text("organisation_id").references(() => organisations.id).notNull(),
  facilityId: text("facility_id").references(() => facilities.id).notNull(),
  propertyName: text("property_name").notNull(),
  propertyType: text("property_type").notNull(),
  addressLine1: text("address_line_1"),
  city: text("city"),
  postcode: text("postcode"),
  country: text("country"),
  propertyContactName: text("property_contact_name"),
  propertyContactPhone: text("property_contact_phone"),
  propertyContactEmail: text("property_contact_email"),
  status: text("status").default("active"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

// Rooms table
export const rooms = pgTable("rooms", {
  id: text("id").primaryKey(), // e.g. 'room-101'
  facilityId: text("facility_id").references(() => facilities.id).notNull(),
  residentialPropertyId: text("residential_property_id").references(() => properties.id).notNull(),
  floorId: text("floor_id"),
  name: text("name").notNull(),
  roomNumber: text("room_number").notNull(),
  roomType: text("room_type"),
  floorNumber: text("floor_number"),
  occupancyStatus: text("occupancy_status").default("vacant"), // 'vacant', 'occupied', 'maintenance'
  installationStatus: text("installation_status").default("operational"),
  digitalTwinEnabled: boolean("digital_twin_enabled").default(true),
  roomGeometry: jsonb("room_geometry"), // JSON for coordinates/zones
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

// Residents table
export const residents = pgTable("residents", {
  id: text("id").primaryKey(), // e.g. 'res-01'
  residentReferenceCode: text("resident_reference_code").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  displayName: text("display_name"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  admissionDate: text("admission_date"),
  expectedDischargeDate: text("expected_discharge_date"),
  careCategory: text("care_category"),
  reablementStatus: text("reablement_status"),
  mobilityStatus: text("mobility_status"),
  baselineMobilityScore: integer("baseline_mobility_score").default(50),
  currentMobilityScore: integer("current_mobility_score").default(50),
  cognitiveSupportLevel: text("cognitive_support_level"),
  dementiaSupportRequired: boolean("dementia_support_required").default(false),
  fallsRiskLevel: text("falls_risk_level").default("standard"), // 'standard', 'high', 'very_high'
  wanderingRiskLevel: text("wandering_risk_level").default("standard"), // 'standard', 'alert'
  nightSupportLevel: text("night_support_level").default("standard"), // 'standard', 'high_frequency'
  consentStatus: text("consent_status").default("granted"),
  profileStatus: text("profile_status").default("active"), // 'active', 'archived'
  roomId: text("room_id").references(() => rooms.id),
  organisationId: text("organisation_id").references(() => organisations.id),
  facilityId: text("facility_id").references(() => facilities.id),
  residentialPropertyId: text("residential_property_id").references(() => properties.id),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

// Carer notes table
export const carerNotes = pgTable("carer_notes", {
  id: text("id").primaryKey(),
  residentId: text("resident_id").references(() => residents.id).notNull(),
  alertId: text("alert_id"),
  authorUserId: text("author_user_id"),
  authorName: text("author_name"),
  noteType: text("note_type"),
  noteText: text("note_text").notNull(),
  moodObserved: text("mood_observed"),
  mobilityObserved: text("mobility_observed"),
  assistanceLevel: text("assistance_level"),
  activityCompleted: text("activity_completed"),
  concernFlag: boolean("concern_flag").default(false),
  visibilityLevel: text("visibility_level").default("care_team"),
  createdAt: text("created_at").notNull(), // ISO Date String
  updatedAt: text("updated_at"),
  method: text("method").default("manual"), // 'manual', 'voice_dictated'
});

// Clinician notes table
export const clinicianNotes = pgTable("clinician_notes", {
  id: text("id").primaryKey(),
  residentId: text("resident_id").references(() => residents.id).notNull(),
  authorUserId: text("author_user_id"),
  authorName: text("author_name"),
  clinicianRole: text("clinician_role"),
  noteType: text("note_type"),
  clinicalSummary: text("clinical_summary").notNull(),
  functionalObservation: text("functional_observation"),
  mobilityScore: integer("mobility_score"),
  confidenceScore: integer("confidence_score"),
  independenceScore: integer("independence_score"),
  recommendedActions: text("recommended_actions"),
  reviewDate: text("review_date"),
  nextReviewDate: text("next_review_date"),
  createdAt: text("created_at").notNull(), // ISO Date String
  updatedAt: text("updated_at"),
});

// Reablement Goals table
export const reablementGoals = pgTable("reablement_goals", {
  id: text("id").primaryKey(),
  residentId: text("resident_id").references(() => residents.id).notNull(),
  goalTitle: text("goal_title").notNull(),
  goalDescription: text("goal_description"),
  targetScore: integer("target_score").notNull(),
  currentScore: integer("current_score").notNull(),
  status: text("status").default("active"), // 'active', 'completed', 'discontinued'
  startDate: text("start_date"),
  endDate: text("end_date"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

// Recovery Trends table
export const recoveryTrends = pgTable("recovery_trends", {
  id: text("id").primaryKey(),
  residentId: text("resident_id").references(() => residents.id).notNull(),
  trendDate: text("trend_date"),
  mobilityScore: integer("mobility_score"),
  independenceScore: integer("independence_score"),
  confidenceScore: integer("confidence_score"),
  sleepQualityScore: integer("sleep_quality_score"),
  activityParticipationScore: integer("activity_participation_score"),
  careSupportNeedScore: integer("care_support_need_score"),
  overallReablementProgressScore: integer("overall_reablement_progress_score"),
  trendDirection: text("trend_direction"),
  summary: text("summary"),
  sourceSummary: jsonb("source_summary"),
  createdAt: text("created_at"),
});

// Devices table
export const devices = pgTable("devices", {
  id: text("id").primaryKey(), // e.g. 'dev-101'
  facilityId: text("facility_id").references(() => facilities.id).notNull(),
  residentialPropertyId: text("residential_property_id").references(() => properties.id).notNull(),
  roomId: text("room_id").references(() => rooms.id), // Nullable for edge/simulator gateways
  deviceName: text("device_name"),
  deviceType: text("device_type").notNull(), // 'radar', 'thermal', 'environmental', etc.
  model: text("model"),
  serialNumber: text("serial_number"),
  installationDate: text("installation_date"),
  currentStatus: text("current_status").default("online"), // 'online', 'offline', 'rebooting'
  ipAddress: text("ip_address"),
  macAddress: text("mac_address"),
  firmwareVersion: text("firmware_version"),
  batteryLevel: integer("battery_level"),
  signalStrength: integer("signal_strength"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

// Device health logs
export const deviceHealthLogs = pgTable("device_health_logs", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").references(() => devices.id).notNull(),
  status: text("status").notNull(),
  errorMessage: text("error_message"),
  latencyMs: integer("latency_ms"),
  packageLoss: doublePrecision("package_loss"),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

// Sensor events (generic)
export const sensorEvents = pgTable("sensor_events", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").references(() => devices.id).notNull(),
  sensorType: text("sensor_type").notNull(),
  value: text("value"),
  metadataJson: jsonb("metadata_json"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Radar specific events
export const radarEvents = pgTable("radar_events", {
  id: serial("id").primaryKey(),
  roomId: text("room_id").references(() => rooms.id).notNull(),
  movementState: text("movement_state"), // 'In Bed', 'Out of Bed' etc.
  respirationRate: doublePrecision("respiration_rate"),
  heartRate: doublePrecision("heart_rate"),
  zonePositionX: doublePrecision("zone_position_x"),
  zonePositionY: doublePrecision("zone_position_y"),
  distance: doublePrecision("distance"),
  createdAt: text("created_at").notNull(), // ISO Date String
});

// Thermal specific events
export const thermalEvents = pgTable("thermal_events", {
  id: serial("id").primaryKey(),
  roomId: text("room_id").references(() => rooms.id).notNull(),
  thermalState: text("thermal_state"), // 'stable', 'fall_detected', etc.
  thermalMatrixJson: jsonb("thermal_matrix_json"),
  targetCount: integer("target_count"),
  avgTemp: doublePrecision("avg_temp"),
  maxTemp: doublePrecision("max_temp"),
  createdAt: text("created_at").notNull(), // ISO String
});

// Environmental specific events
export const environmentalEvents = pgTable("environmental_events", {
  id: serial("id").primaryKey(),
  roomId: text("room_id").references(() => rooms.id).notNull(),
  temperature: doublePrecision("temperature"),
  humidity: doublePrecision("humidity"),
  noiseLevel: doublePrecision("noise_level"),
  lightLevel: doublePrecision("light_level"),
  motionDetected: boolean("motion_detected"),
  co2Level: doublePrecision("co2_level"),
  createdAt: text("created_at").notNull(), // ISO String
});

// Alerts and Alarms
export const alerts = pgTable("alerts", {
  id: text("id").primaryKey(),
  facilityId: text("facility_id").references(() => facilities.id),
  residentialPropertyId: text("residential_property_id").references(() => properties.id),
  roomId: text("room_id").references(() => rooms.id).notNull(),
  residentId: text("resident_id").references(() => residents.id),
  sensorEventId: text("sensor_event_id"),
  alertType: text("alert_type").notNull(), // 'Presence Alert', 'Out of Bed', 'Bathroom Stay Limit', 'Fall Waveform Sensor Alert'
  priority: text("priority").notNull(), // 'amber', 'critical'
  status: text("status").default("New"), // 'New', 'Acknowledged', 'Resolved', 'False Positive'
  summary: text("summary").notNull(),
  generatedAt: text("generated_at").notNull(), // ISO String
  acknowledgedAt: text("acknowledged_at"),
  resolvedAt: text("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  escalationLevel: integer("escalation_level").default(0),
  updatedAt: text("updated_at"),
});

// Digital twin states representing active room status
export const digitalTwinStates = pgTable("digital_twin_states", {
  id: text("id").primaryKey(), // maps to room_id or custom
  facilityId: text("facility_id").references(() => facilities.id),
  roomId: text("room_id").references(() => rooms.id).notNull().unique(),
  residentId: text("resident_id").references(() => residents.id),
  stateTimestamp: text("state_timestamp"),
  activityState: text("activity_state"), // 'In Bed', 'Moving', etc.
  presenceDetected: boolean("presence_detected"),
  occupancyDurationMins: integer("occupancy_duration_mins"),
  targetCount: integer("target_count"),
  radarSignalStatus: text("radar_signal_status"),
  lastInteractionTime: text("last_interaction_time"),
  updatedAt: text("updated_at"),
});

// System Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(),
  description: text("description").notNull(),
  userId: text("user_id"),
  userEmail: text("user_email"),
  ipAddress: text("ip_address"),
  payloadJson: jsonb("payload_json"),
  createdAt: timestamp("created_at").defaultNow(),
});
