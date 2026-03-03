import { openDB } from 'idb';
import type { CapturePayload } from './types';

const DB_NAME = 'ldt-offline';
const STORE = 'pending';

export async function queueCapture(payload: CapturePayload) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) { db.createObjectStore(STORE, { keyPath: 'id' }); }
  });
  await db.put(STORE, payload);
}

export async function listPending(): Promise<CapturePayload[]> {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) { db.createObjectStore(STORE, { keyPath: 'id' }); }
  });
  return db.getAll(STORE);
}

export async function removePending(id: string) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) { db.createObjectStore(STORE, { keyPath: 'id' }); }
  });
  await db.delete(STORE, id);
}
