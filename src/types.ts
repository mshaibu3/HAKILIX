export interface User {
  id: string;
  organisation_id: string | null;
  facility_id: string | null;
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  role: string;
  status: 'active' | 'disabled' | 'locked' | 'pending_invitation';
  created_at: string;
  updated_at: string;
}

export type UserRole =
  | 'Super Admin'
  | 'Organisation Admin'
  | 'Facility Manager'
  | 'Clinical Lead'
  | 'Senior Carer'
  | 'Care Worker'
  | 'Technical Support'
  | 'Auditor'
  | 'Demo User'
  | 'Family Viewer'
  | 'Data Protection Officer';

export interface Organisation {
  id: string;
  name: string;
  organisation_type: string;
  registration_number: string | null;
  address_line_1: string;
  city: string;
  postcode: string;
  country: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Facility {
  id: string;
  organisation_id: string;
  name: string;
  facility_type: string;
  address_line_1: string;
  city: string;
  postcode: string;
  country: string;
  manager_user_id: string | null;
  number_of_rooms: number;
  created_at: string;
  updated_at: string;
}

export interface ResidentialProperty {
  id: string;
  organisation_id: string;
  facility_id: string | null;
  property_name: string;
  property_type: 'care_home' | 'reablement_centre' | 'assisted_living' | 'extra_care_housing' | 'supported_living' | 'step_down_unit' | 'residential_property';
  address_line_1: string;
  city: string;
  postcode: string;
  country: string;
  property_contact_name: string | null;
  property_contact_phone: string | null;
  property_contact_email: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface RoomGeometry {
  width: number;
  height: number;
  bed_zone: { x: number; y: number; w: number; h: number };
  bathroom_zone: { x: number; y: number; w: number; h: number };
  door_zone: { x: number; y: number; w: number; h: number };
}

export interface Room {
  id: string;
  facility_id: string;
  residential_property_id: string;
  floor_id: string | null;
  name: string;
  room_number: string;
  room_type: string;
  floor_number: string | null;
  occupancy_status: 'occupied' | 'unoccupied' | 'reserved' | 'maintenance' | 'inactive';
  installation_status: string;
  digital_twin_enabled: boolean;
  room_geometry: RoomGeometry;
  created_at: string;
  updated_at: string;
}

export interface Resident {
  id: string;
  organisation_id: string | null;
  facility_id: string;
  residential_property_id: string | null;
  room_id: string | null;
  resident_reference_code: string;
  display_name: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  admission_date: string;
  expected_discharge_date: string | null;
  care_category: string;
  reablement_status: string;
  mobility_status: string;
  baseline_mobility_score: number;
  current_mobility_score: number;
  cognitive_support_level: string;
  dementia_support_required: boolean;
  falls_risk_level: 'standard' | 'high' | 'very_high';
  wandering_risk_level: 'standard' | 'high' | 'very_high';
  night_support_level: 'standard' | 'high';
  consent_status: 'granted' | 'not_granted' | 'unknown';
  profile_status: 'active' | 'archived' | 'inactive';
  photo_url?: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface ResidentRoomAssignment {
  id: string;
  resident_id: string;
  facility_id: string;
  residential_property_id: string;
  room_id: string;
  assigned_by: string | null;
  assignment_reason: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResidentReablementGoal {
  id: string;
  resident_id: string;
  goal_title: string;
  goal_description: string | null;
  goal_category: string;
  baseline_score: number;
  target_score: number;
  current_score: number;
  status: 'active' | 'achieved' | 'paused' | 'discontinued';
  start_date: string;
  target_date: string | null;
  completed_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResidentRecoveryTrend {
  id: string;
  resident_id: string;
  trend_date: string;
  mobility_score: number;
  independence_score: number;
  confidence_score: number;
  sleep_quality_score: number;
  activity_participation_score: number;
  care_support_need_score: number;
  overall_reablement_progress_score: number;
  trend_direction: 'improving' | 'stable' | 'declining' | 'insufficient_data';
  summary: string;
  source_summary: any;
  created_at: string;
}

export interface CarerNote {
  id: string;
  resident_id: string;
  alert_id: string | null;
  author_user_id: string;
  author_name: string;
  note_type: string;
  note_text: string;
  mood_observed: string | null;
  mobility_observed: string | null;
  assistance_level: string | null;
  activity_completed: string | null;
  concern_flag: boolean;
  visibility_level: 'care_team' | 'clinicians' | 'family';
  created_at: string;
  updated_at: string;
}

export interface ClinicianNote {
  id: string;
  resident_id: string;
  author_user_id: string;
  author_name: string;
  clinician_role: string;
  note_type: string;
  clinical_summary: string;
  functional_observation: string | null;
  mobility_score: number | null;
  confidence_score: number | null;
  independence_score: number | null;
  recommended_actions: string | null;
  review_date: string;
  next_review_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string;
  facility_id: string;
  residential_property_id: string | null;
  room_id: string | null;
  device_name: string;
  device_type: 'Edge Gateway' | '81GHz mmWave Radar' | 'Radiometric Thermal Sensor' | 'Environmental Sensor' | 'PoE Switch' | 'Dashboard Tablet' | 'Backup Router' | 'Simulator Device';
  serial_number: string;
  manufacturer: string;
  model_number: string;
  firmware_version: string;
  ip_address: string | null;
  mac_address: string | null;
  connection_type: string;
  power_source: string;
  last_seen_at: string | null;
  health_status: 'online' | 'degraded' | 'offline' | 'unknown';
  tamper_status: 'normal' | 'tampered';
  is_simulated: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeviceHealthLog {
  id: string;
  device_id: string;
  status: string;
  cpu_usage: number;
  memory_usage: number;
  temperature: number;
  latency_ms: number;
  uptime_seconds: number;
  error_message: string | null;
  created_at: string;
}

export interface SensorEvent {
  id: string;
  facility_id: string;
  residential_property_id: string | null;
  room_id: string;
  resident_id: string | null;
  device_id: string | null;
  event_type: 'radar' | 'thermal' | 'environmental' | 'fusion_alert';
  event_source: string;
  event_timestamp: string;
  confidence_score: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  event_summary: string;
  metadata: any;
  created_at: string;
}

export interface RadarEvent {
  id: string;
  sensor_event_id: string;
  device_id: string;
  x_position: number;
  y_position: number;
  z_position: number;
  velocity: number;
  vertical_velocity: number;
  range_m: number;
  gait_stability_score: number | null;
  motion_state: 'walking' | 'standing' | 'sitting' | 'horizontal_lying' | 'rapid_vertical_fall';
  fall_candidate: boolean;
  tracking_id: string;
  confidence_score: number;
  created_at: string;
}

export interface ThermalEvent {
  id: string;
  sensor_event_id: string;
  device_id: string;
  presence_confirmed: boolean;
  body_heat_signature: number;
  bed_occupancy: boolean;
  thermal_comfort_score: number;
  temperature_gradient: number;
  confidence_score: number;
  created_at: string;
}

export interface EnvironmentalEvent {
  id: string;
  sensor_event_id: string | null;
  device_id: string;
  room_id: string;
  temperature: number;
  humidity: number;
  co2: number;
  air_quality_score: number;
  light_level: number;
  noise_level: number;
  door_state: 'closed' | 'open';
  occupancy_context: string;
  created_at: string;
}

export interface DigitalTwinState {
  id: string;
  facility_id: string;
  room_id: string;
  resident_id: string | null;
  state_timestamp: string;
  activity_state: 'Room Empty' | 'In Bed' | 'Walking' | 'Near Door' | 'Restless' | 'Fall Candidate' | 'Inactive' | 'Sensor Degraded' | 'Device Offline' | 'Environmental Discomfort';
  avatar_position: { x: number; y: number; z_height: number } | null;
  movement_trail: { x: number; y: number; t: string }[];
  active_alert_id: string | null;
  device_status_summary: any;
  human_review_required: boolean;
  metadata: any;
  created_at: string;
}

export interface Alert {
  id: string;
  facility_id: string;
  residential_property_id: string | null;
  room_id: string;
  resident_id: string | null;
  sensor_event_id: string | null;
  alert_type: 'Fall Candidate' | 'Bed Exit' | 'Wandering Risk' | 'Unusual Inactivity' | 'Restlessness' | 'Environmental Discomfort' | 'Sensor Offline' | 'Device Tamper' | 'Edge Gateway Fault';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'New' | 'Acknowledged' | 'Escalated' | 'Resolved' | 'False Positive' | 'Archived';
  confidence_score: number;
  summary: string;
  human_review_required: boolean;
  generated_at: string;
  acknowledged_by: string | null;
  acknowledged_name: string | null;
  acknowledged_at: string | null;
  resolved_by: string | null;
  resolved_name: string | null;
  resolved_at: string | null;
  escalation_level: number;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_name: string | null;
  organisation_id: string | null;
  facility_id: string | null;
  action_type: string;
  module_name: string;
  record_type: string | null;
  record_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  action_result: 'success' | 'failed' | 'denied';
  details: any;
  created_at: string;
}

export interface DatabaseDashboardMetrics {
  totalOrganisations: number;
  totalFacilities: number;
  totalProperties: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  totalResidents: number;
  activeResidents: number;
  archivedResidents: number;
  assignedResidents: number;
  unassignedResidents: number;
  totalUsers: number;
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  totalSensorEvents: number;
  totalAlerts: number;
  openAlerts: number;
  resolvedAlerts: number;
  auditLogsCount: number;
  reportsGenerated: number;
}
