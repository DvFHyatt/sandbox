export type AdminLevel = 'N' | 'P' | 'G' | 'GA' | 'GM';

export type CapturePayload = {
  id: string;
  property_id: string;
  division_id: string;
  training_type_id: string;
  title: string;
  description?: string;
  facilitator_gid?: string;
  facilitator_name?: string;
  training_date: string;
  start_time: string;
  end_time: string;
  attendees: string[];
  client_updated_at: string;
};
