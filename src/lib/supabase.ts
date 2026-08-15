import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
  realtime: { params: { eventsPerSecond: 5 } },
});

// ---- Shared types (mirror the DB schema) ----

export interface CitizenReportRow {
  id: string;
  category: 'Traffic Jam' | 'Accident' | 'Road Damage' | 'Illegal Parking' | 'Broken Signal';
  location: string;
  lat: number | null;
  lng: number | null;
  description: string;
  photo_url: string | null;
  status: 'Submitted' | 'Under Review' | 'Resolved';
  upvotes: number;
  created_at: string;
}

export interface RoadDamageRow {
  id: string;
  damage_type: 'Pothole' | 'Broken Road' | 'Waterlogging' | 'Obstacle' | 'Damaged Sign';
  location: string;
  lat: number | null;
  lng: number | null;
  severity: 'Minor' | 'Moderate' | 'Critical';
  repair_priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  photo_url: string | null;
  status: 'Reported' | 'Scheduled' | 'In Repair' | 'Completed';
  created_at: string;
}

export interface ParkingReservationRow {
  id: string;
  lot_id: string;
  lot_name: string;
  location: string;
  hours: number;
  cost: number;
  slot_number: number;
  status: 'Reserved' | 'Active' | 'Completed' | 'Cancelled';
  created_at: string;
}

// ---- Storage helper: upload an evidence photo ----

export async function uploadEvidence(file: File): Promise<string | null> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('evidence').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) return null;
  const { data } = supabase.storage.from('evidence').getPublicUrl(path);
  return data.publicUrl;
}
