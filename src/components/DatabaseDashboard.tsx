import React from 'react';
import { 
  Database, 
  Layers, 
  Workflow, 
  Server, 
  CheckCircle, 
  XOctagon, 
  Users, 
  Cpu, 
  AlertTriangle, 
  TrendingUp, 
  BookOpen, 
  ShieldCheck, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { DatabaseDashboardMetrics } from '../types';

interface DatabaseDashboardProps {
  metrics: DatabaseDashboardMetrics | null;
  isLoading: boolean;
  onFlushDb?: () => void;
}

export default function DatabaseDashboard({
  metrics,
  isLoading,
  onFlushDb
}: DatabaseDashboardProps) {

  const schemaTables = [
    {
      name: 'users',
      module: 'Identity & Access Control',
      fields: [
        'id UUID PK',
        'organisation_id UUID FK',
        'facility_id UUID FK',
        'first_name varchar(100)',
        'last_name varchar(100)',
        'display_name varchar(150)',
        'email varchar(255) UNIQUE INDEX',
        'role varchar(50)',
        'status varchar(50) [active, locked, disabled]',
        'created_at timestamp',
        'updated_at timestamp'
      ]
    },
    {
      name: 'organisations',
      module: 'Facilities & Properties',
      fields: [
        'id UUID PK',
        'name varchar(255)',
        'organisation_type varchar(100)',
        'address_line_1 varchar(255)',
        'city varchar(100)',
        'postcode varchar(30)',
        'country varchar(100) DEFAULT United Kingdom',
        'status varchar(50)',
        'created_at timestamp'
      ]
    },
    {
      name: 'rooms',
      module: 'Spatial Environment',
      fields: [
        'id UUID PK',
        'facility_id UUID FK',
        'residential_property_id UUID FK',
        'name varchar(100)',
        'room_number varchar(50)',
        'room_type varchar(100)',
        'occupancy_status varchar(50) [occupied, unoccupied]',
        'installation_status varchar(50)',
        'digital_twin_enabled boolean',
        'room_geometry JSONB',
        'created_at timestamp'
      ]
    },
    {
      name: 'residents',
      module: 'Resident / Client Ledger',
      fields: [
        'id UUID PK',
        'organisation_id UUID FK',
        'facility_id UUID FK',
        'room_id UUID FK',
        'resident_reference_code varchar(100) UNIQUE',
        'display_name varchar(100)',
        'falls_risk_level varchar(50) [standard, high, very_high]',
        'wandering_risk_level varchar(50)',
        'consent_status varchar(50)',
        'profile_status varchar(50) [active, archived]',
        'created_at timestamp',
        'archived_at timestamp'
      ]
    },
    {
      name: 'devices',
      module: 'Peripherals & Edge Hardware',
      fields: [
        'id UUID PK',
        'facility_id UUID FK',
        'room_id UUID FK',
        'device_name varchar(255)',
        'device_type varchar(100) [81GHz Radar, Thermal, Gateway]',
        'serial_number varchar(255) UNIQUE',
        'health_status varchar(50) [online, degraded, offline]',
        'tamper_status varchar(50) [normal, tampered]',
        'is_simulated boolean',
        'last_seen_at timestamp'
      ]
    },
    {
      name: 'alerts',
      module: 'Safety Alert Engine',
      fields: [
        'id UUID PK',
        'facility_id UUID FK',
        'room_id UUID FK',
        'resident_id UUID FK',
        'sensor_event_id UUID FK',
        'alert_type varchar(100) [Fall Candidate, Bed Exit, Restless]',
        'priority varchar(50) [low, medium, high, critical]',
        'status varchar(50) [New, Acknowledged, Resolved]',
        'confidence_score float',
        'summary text',
        'resolution_notes text',
        'created_at timestamp',
        'updated_at timestamp'
      ]
    },
    {
      name: 'sensor_events',
      module: 'Telemetry & Ingestion',
      fields: [
        'id UUID PK',
        'room_id UUID FK',
        'resident_id UUID FK',
        'device_id UUID FK',
        'event_type varchar(100) [radar, thermal, env]',
        'event_timestamp timestamp',
        'confidence_score float',
        'severity varchar(50)',
        'metadata JSONB',
        'created_at timestamp'
      ]
    },
    {
      name: 'audit_logs',
      module: 'Compliance & Governance',
      fields: [
        'id UUID PK',
        'user_id UUID FK',
        'action_type varchar(150)',
        'module_name varchar(100)',
        'record_type varchar(100)',
        'record_id UUID',
        'ip_address varchar(100)',
        'details JSONB',
        'created_at timestamp'
      ]
    }
  ];

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center p-12">
        <Database className="w-8 h-8 text-slate-400 animate-spin mr-3" />
        <span className="text-slate-500 font-medium">Reading Database Schema Tables...</span>
      </div>
    );
  }

  // Group metrics into human readable divisions as required
  const metricGroups = [
    {
      title: 'Infrastructure & Sites',
      icon: Layers,
      color: 'border-slate-200/60 bg-slate-50/50',
      items: [
        { label: 'Total Organisations', value: metrics.totalOrganisations },
        { label: 'Total Facilities', value: metrics.totalFacilities },
        { label: 'Properties Registered', value: metrics.totalProperties },
        { label: 'Staff User Access Keys', value: metrics.totalUsers }
      ]
    },
    {
      title: 'Rooms & Occupancy',
      icon: Server,
      color: 'border-emerald-100 bg-emerald-50/10',
      items: [
        { label: 'Room Registry Count', value: metrics.totalRooms },
        { label: 'Occupied Units', value: metrics.occupiedRooms, badge: 'Occupied' },
        { label: 'Available Units', value: metrics.availableRooms, badge: 'Vacancy' }
      ]
    },
    {
      title: 'Audited Residents',
      icon: Users,
      color: 'border-sky-100 bg-sky-50/10',
      items: [
        { label: 'Total Client Profiles', value: metrics.totalResidents },
        { label: 'Active Care Recipient Profiles', value: metrics.activeResidents },
        { label: 'Archived Client Files', value: metrics.archivedResidents },
        { label: 'Assigned to Rooms', value: metrics.assignedResidents },
        { label: 'Unassigned/Awaiting Room', value: metrics.unassignedResidents }
      ]
    },
    {
      title: 'PoE Sensor Hardware Nodes',
      icon: Cpu,
      color: 'border-purple-100 bg-purple-50/10',
      items: [
        { label: 'Active Hardware Registered', value: metrics.totalDevices },
        { label: 'Heartbeat Online Nodes', value: metrics.onlineDevices, green: true },
        { label: 'Degraded/Offline Hardware', value: metrics.offlineDevices, red: true }
      ]
    },
    {
      title: 'Ingestion & Alerts Log',
      icon: AlertTriangle,
      color: 'border-rose-100 bg-rose-50/10',
      items: [
        { label: 'Relational Sensor Events', value: metrics.totalSensorEvents },
        { label: 'Total Alerts Generated', value: metrics.totalAlerts },
        { label: 'Pending Care Action / Open', value: metrics.openAlerts, red: metrics.openAlerts > 0 },
        { label: 'Resolved (Closed & Checked)', value: metrics.resolvedAlerts }
      ]
    },
    {
      title: 'Governance & Auditing',
      icon: ShieldCheck,
      color: 'border-amber-100 bg-amber-50/10',
      items: [
        { label: 'Immutable Audit Log Rows', value: metrics.auditLogsCount },
        { label: 'Reablement PDF Reports Created', value: metrics.reportsGenerated }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 inline-flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-600" />
            HAKILIX Relational Database Monitor
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time physical schema metric monitoring, table registries compliance, and entity ERD modeling.
          </p>
        </div>
        
        {onFlushDb && (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset the client database file to default Rosewood seed data? Any new additions will be cleared.')) {
                onFlushDb();
              }
            }}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-100 font-medium px-3.5 py-2 rounded-lg transition focus:outline-none"
          >
            Reset DB to Seed Data
          </button>
        )}
      </div>

      {/* Relational Metrics Counters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {metricGroups.map((group, gIdx) => {
          const Icon = group.icon;
          return (
            <div 
              key={gIdx} 
              className={`border rounded-2xl p-5 shadow-xs transition-transform hover:translate-y-[-2px] flex flex-col justify-between ${group.color}`}
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-xxs">
                    <Icon className="w-4 h-4 text-slate-700" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                    {group.title}
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {group.items.map((item, iIdx) => (
                    <div key={iIdx} className="flex justify-between items-center text-xs text-slate-600 font-mono">
                      <span>{item.label}</span>
                      <span className={`font-bold px-2 py-0.5 rounded ${
                        item.green ? 'bg-emerald-100 text-emerald-800 font-mono' :
                        item.red ? 'bg-rose-100 text-rose-800 font-mono animate-pulse' :
                        'bg-slate-200/60 text-slate-700 font-mono'
                      }`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schema Structure Diagram & ERD Modeling as explicitly requested in prompt */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 inline-flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            HAKILIX Relational Entity Schema Layout
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Visual inspection of active PostgreSQL/SQLite table properties, key index alignments, and referential integrity.
          </p>
        </div>

        {/* ERD Diagram Visual Layout (SVG blocks mapped cleanly) */}
        <div id="erd-canvas" className="border border-slate-100 rounded-xl bg-slate-950 p-6 overflow-x-auto select-none">
          <div className="min-w-[900px] flex gap-4 overflow-x-auto py-2">
            
            {schemaTables.map((tbl, idx) => (
              <div 
                key={idx} 
                className="w-72 bg-slate-900 border border-slate-800 rounded-lg shrink-0 overflow-hidden flex flex-col font-mono text-[10px]"
              >
                {/* Table Title */}
                <div className="bg-slate-850 p-2.5 border-b border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-slate-100 font-mono">tbl: {tbl.name}</span>
                  <span className="text-[8px] bg-emerald-950 text-emerald-400 font-mono px-1.5 py-0.5 rounded">
                    {tbl.module}
                  </span>
                </div>

                {/* Fields list */}
                <div className="p-2.5 space-y-1.5 text-slate-400 font-mono bg-slate-900 flex-1">
                  {tbl.fields.map((f, fIndex) => (
                    <div 
                      key={fIndex} 
                      className={`flex justify-between font-mono ${
                        f.includes('PK') ? 'text-emerald-400 font-semibold' :
                        f.includes('FK') ? 'text-sky-300 font-semibold' :
                        f.includes('UNIQUE') ? 'text-amber-300 font-semibold' :
                        'text-slate-400'
                      }`}
                    >
                      <span className="font-mono">{f.split(' ')[0]}</span>
                      <span className="text-xxs font-mono text-slate-500">
                        {f.replace(f.split(' ')[0], '').trim()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

          </div>
        </div>

        <div className="p-4 bg-amber-50/50 border border-amber-150 rounded-xl text-xxs text-amber-800 leading-normal flex items-start gap-2.5 font-mono">
          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>SCHEMA GOVERNANCE POLICY:</strong> This relational engine employs UUID Primary Keys to defeat timing attacks, JSONB columns for advanced ambient telemetry point clouds, and automated transaction logs mapping every query profile. Under dementia care safety mandates, all soft-disposed (deleted_at) rows are decoupled into archived cache buckets to ensure historical audit trails are preserved intact for clinical care review.
          </div>
        </div>

      </div>

    </div>
  );
}
