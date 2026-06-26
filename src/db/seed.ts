import { db, pool } from "./index.ts";
import * as schema from "./schema.ts";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Starting database seeding process...");

  const dbJsonPath = path.join(process.cwd(), "db.json");
  if (!fs.existsSync(dbJsonPath)) {
    console.error("No db.json found to seed from.");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dbJsonPath, "utf-8"));

  try {
    // 1. Organisation
    if (data.organisation) {
      console.log("Seeding organisations...");
      await db.insert(schema.organisations).values({
        id: data.organisation.id,
        name: data.organisation.name,
        organisationType: data.organisation.organisation_type,
        registrationNumber: data.organisation.registration_number,
        addressLine1: data.organisation.address_line_1,
        city: data.organisation.city,
        postcode: data.organisation.postcode,
        country: data.organisation.country,
        status: data.organisation.status,
        createdAt: data.organisation.created_at,
        updatedAt: data.organisation.updated_at,
      }).onConflictDoNothing();
    }

    // 2. Facility
    if (data.facility) {
      console.log("Seeding facilities...");
      await db.insert(schema.facilities).values({
        id: data.facility.id,
        organisationId: data.facility.organisation_id,
        name: data.facility.name,
        facilityType: data.facility.facility_type,
        addressLine1: data.facility.address_line_1,
        city: data.facility.city,
        postcode: data.facility.postcode,
        country: data.facility.country,
        managerUserId: data.facility.manager_user_id,
        numberOfRooms: data.facility.number_of_rooms,
        createdAt: data.facility.created_at,
        updatedAt: data.facility.updated_at,
      }).onConflictDoNothing();
    }

    // 3. Property
    if (data.property) {
      console.log("Seeding properties...");
      await db.insert(schema.properties).values({
        id: data.property.id,
        organisationId: data.property.organisation_id,
        facilityId: data.property.facility_id,
        propertyName: data.property.property_name,
        propertyType: data.property.property_type,
        addressLine1: data.property.address_line_1,
        city: data.property.city,
        postcode: data.property.postcode,
        country: data.property.country,
        propertyContactName: data.property.property_contact_name,
        propertyContactPhone: data.property.property_contact_phone,
        propertyContactEmail: data.property.property_contact_email,
        status: data.property.status,
        createdAt: data.property.created_at,
        updatedAt: data.property.updated_at,
      }).onConflictDoNothing();
    }

    // 4. Rooms
    if (Array.isArray(data.rooms) && data.rooms.length > 0) {
      console.log(`Seeding ${data.rooms.length} rooms...`);
      for (const r of data.rooms) {
        const roomId = r.id === "room-1010" ? "room-110" : r.id;
        await db.insert(schema.rooms).values({
          id: roomId,
          facilityId: r.facility_id,
          residentialPropertyId: r.residential_property_id,
          floorId: r.floor_id,
          name: r.name,
          roomNumber: r.room_number,
          roomType: r.room_type,
          floorNumber: r.floor_number,
          occupancyStatus: r.occupancy_status,
          installationStatus: r.installation_status,
          digitalTwinEnabled: r.digital_twin_enabled,
          roomGeometry: r.room_geometry,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }).onConflictDoNothing();
      }
    }

    // 5. Residents
    if (Array.isArray(data.residents) && data.residents.length > 0) {
      console.log(`Seeding ${data.residents.length} residents...`);
      for (const r of data.residents) {
        const targetRoomId = r.room_id === "room-1010" ? "room-110" : r.room_id;
        await db.insert(schema.residents).values({
          id: r.id,
          residentReferenceCode: r.resident_reference_code,
          firstName: r.first_name,
          lastName: r.last_name,
          displayName: r.display_name,
          dateOfBirth: r.date_of_birth,
          gender: r.gender,
          admissionDate: r.admission_date,
          expectedDischargeDate: r.expected_discharge_date,
          careCategory: r.care_category,
          reablementStatus: r.reablement_status,
          mobilityStatus: r.mobility_status,
          baselineMobilityScore: r.baseline_mobility_score,
          currentMobilityScore: r.current_mobility_score,
          cognitiveSupportLevel: r.cognitive_support_level,
          dementiaSupportRequired: r.dementia_support_required,
          fallsRiskLevel: r.falls_risk_level,
          wanderingRiskLevel: r.wandering_risk_level,
          nightSupportLevel: r.night_support_level,
          consentStatus: r.consent_status,
          profileStatus: r.profile_status,
          roomId: targetRoomId,
          organisationId: r.organisation_id,
          facilityId: r.facility_id,
          residentialPropertyId: r.residential_property_id,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }).onConflictDoNothing();
      }
    }

    // 6. Carer Notes
    if (Array.isArray(data.carer_notes) && data.carer_notes.length > 0) {
      console.log(`Seeding ${data.carer_notes.length} carer notes...`);
      for (const n of data.carer_notes) {
        await db.insert(schema.carerNotes).values({
          id: n.id,
          residentId: n.resident_id,
          alertId: n.alert_id,
          authorUserId: n.author_user_id || "user-carer-01",
          authorName: n.author_name || "Staff",
          noteType: n.note_type || "Daily Routine Support",
          noteText: n.note_text,
          moodObserved: n.mood_observed,
          mobilityObserved: n.mobility_observed,
          assistanceLevel: n.assistance_level,
          activityCompleted: n.activity_completed,
          concernFlag: n.concern_flag || false,
          visibilityLevel: n.visibility_level || "care_team",
          createdAt: n.created_at || new Date().toISOString(),
          updatedAt: n.updated_at,
          method: n.method || "manual",
        }).onConflictDoNothing();
      }
    }

    // 7. Clinician Notes
    if (Array.isArray(data.clinician_notes) && data.clinician_notes.length > 0) {
      console.log(`Seeding ${data.clinician_notes.length} clinician notes...`);
      for (const n of data.clinician_notes) {
        await db.insert(schema.clinicianNotes).values({
          id: n.id,
          residentId: n.resident_id,
          authorUserId: n.author_user_id || "user-clinical-lead-01",
          authorName: n.author_name || "Staff Clinician",
          clinicianRole: n.clinician_role || "Physiotherapist Practitioner",
          noteType: n.note_type || "General Clinical Note",
          clinicalSummary: n.clinical_summary || n.note_text || "Therapy notes.",
          functionalObservation: n.functional_observation,
          mobilityScore: n.mobility_score,
          confidenceScore: n.confidence_score,
          independenceScore: n.independence_score,
          recommendedActions: n.recommended_actions,
          reviewDate: n.review_date,
          nextReviewDate: n.next_review_date,
          createdAt: n.created_at || new Date().toISOString(),
          updatedAt: n.updated_at,
        }).onConflictDoNothing();
      }
    }

    // 8. Reablement Goals
    if (Array.isArray(data.reablement_goals) && data.reablement_goals.length > 0) {
      console.log(`Seeding ${data.reablement_goals.length} goals...`);
      for (const g of data.reablement_goals) {
        await db.insert(schema.reablementGoals).values({
          id: g.id,
          residentId: g.resident_id,
          goalTitle: g.goal_title,
          goalDescription: g.goal_description,
          targetScore: g.target_score,
          currentScore: g.current_score,
          status: g.status,
          startDate: g.start_date,
          endDate: g.end_date,
          createdAt: g.created_at,
          updatedAt: g.updated_at,
        }).onConflictDoNothing();
      }
    }

    // 9. Recovery Trends
    if (Array.isArray(data.recovery_trends) && data.recovery_trends.length > 0) {
      console.log(`Seeding ${data.recovery_trends.length} recovery trends...`);
      for (const t of data.recovery_trends) {
        await db.insert(schema.recoveryTrends).values({
          id: t.id,
          residentId: t.resident_id,
          trendDate: t.trend_date,
          mobilityScore: t.mobility_score,
          independenceScore: t.independence_score,
          confidenceScore: t.confidence_score,
          sleepQualityScore: t.sleep_quality_score,
          activityParticipationScore: t.activity_participation_score,
          careSupportNeedScore: t.care_support_need_score,
          overallReablementProgressScore: t.overall_reablement_progress_score,
          trendDirection: t.trend_direction,
          summary: t.summary,
          sourceSummary: t.source_summary,
          createdAt: t.created_at,
        }).onConflictDoNothing();
      }
    }

    // 10. Devices
    if (Array.isArray(data.devices) && data.devices.length > 0) {
      console.log(`Seeding ${data.devices.length} devices...`);
      for (const d of data.devices) {
        const targetRoomId = d.room_id === "room-1010" ? "room-110" : d.room_id;
        await db.insert(schema.devices).values({
          id: d.id,
          facilityId: d.facility_id,
          residentialPropertyId: d.residential_property_id,
          roomId: targetRoomId,
          deviceName: d.device_name,
          deviceType: d.device_type,
          model: d.model,
          serialNumber: d.serial_number,
          installationDate: d.installation_date,
          currentStatus: d.current_status,
          ipAddress: d.ip_address,
          macAddress: d.mac_address,
          firmwareVersion: d.firmware_version,
          batteryLevel: d.battery_level,
          signalStrength: d.signal_strength,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }).onConflictDoNothing();
      }
    }

    // 11. Alerts
    if (Array.isArray(data.alerts) && data.alerts.length > 0) {
      console.log(`Seeding ${data.alerts.length} alerts...`);
      for (const a of data.alerts) {
        const targetRoomId = a.room_id === "room-1010" ? "room-110" : a.room_id;
        await db.insert(schema.alerts).values({
          id: a.id,
          facilityId: a.facility_id,
          residentialPropertyId: a.residential_property_id,
          roomId: targetRoomId,
          residentId: a.resident_id,
          sensorEventId: a.sensor_event_id,
          alertType: a.alert_type,
          priority: a.priority,
          status: a.status,
          summary: a.summary,
          generatedAt: a.generated_at,
          acknowledgedAt: a.acknowledged_at,
          resolvedAt: a.resolved_at,
          resolutionNotes: a.resolution_notes,
          escalationLevel: a.escalation_level,
          updatedAt: a.updated_at,
        }).onConflictDoNothing();
      }
    }

    // 12. Digital Twin States
    if (Array.isArray(data.digital_twin_states) && data.digital_twin_states.length > 0) {
      console.log(`Seeding ${data.digital_twin_states.length} digital twin states...`);
      for (const dt of data.digital_twin_states) {
        const targetRoomId = dt.room_id === "room-1010" ? "room-110" : dt.room_id;
        await db.insert(schema.digitalTwinStates).values({
          id: dt.id,
          facilityId: dt.facility_id,
          roomId: targetRoomId,
          residentId: dt.resident_id,
          stateTimestamp: dt.state_timestamp,
          activityState: dt.activity_state,
          presenceDetected: dt.presence_detected,
          occupancyDurationMins: dt.occupancy_duration_mins,
          targetCount: dt.target_count,
          radarSignalStatus: dt.radar_signal_status,
          lastInteractionTime: dt.last_interaction_time,
          updatedAt: dt.updated_at,
        }).onConflictDoNothing();
      }
    }

    console.log("Database seeding completed successfully!");
  } catch (err) {
    console.error("Error during seeding:", err);
  } finally {
    await pool.end();
  }
}

main();
