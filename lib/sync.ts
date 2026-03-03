import { listPending, removePending } from './offline-queue';
import { getSupabase } from './supabase';

export async function syncPending() {
  const pending = await listPending();
  for (const item of pending) {
    const { error } = await getSupabase().rpc('upsert_training_with_attendees', { payload: item });
    if (!error) await removePending(item.id);
  }
  return pending.length;
}
