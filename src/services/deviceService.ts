import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { ActiveDevice, DeviceType, StudySession } from '../types';

const DEVICE_ID_STORAGE_KEY = 'udyama_device_id_v2';
const DEVICE_NAME_STORAGE_KEY = 'udyama_device_name_v2';

export function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (!deviceId) {
    deviceId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
  }
  return deviceId;
}

export function detectDeviceDetails(): { name: string; type: DeviceType } {
  const ua = navigator.userAgent;
  let type: DeviceType = 'desktop';
  let os = 'Desktop';
  let browser = 'Browser';

  if (/Mobi|Android/i.test(ua)) {
    type = /Tablet|iPad/i.test(ua) ? 'tablet' : 'mobile';
  } else if (/iPad|Tablet/i.test(ua)) {
    type = 'tablet';
  }

  if (/iPhone|iPad|iPod/i.test(ua)) os = 'Apple iOS';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Windows NT/i.test(ua)) os = 'Windows';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/Android/i.test(ua)) os = 'Android';

  if (/Chrome|CriOS/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Firefox|FxiOS/i.test(ua)) browser = 'Firefox';

  const storedName = localStorage.getItem(DEVICE_NAME_STORAGE_KEY);
  const name = storedName || `${os} • ${browser}`;

  return { name, type };
}

export function setCustomDeviceName(name: string): void {
  localStorage.setItem(DEVICE_NAME_STORAGE_KEY, name);
}

export async function registerDeviceHeartbeat(userId: string): Promise<ActiveDevice> {
  const path = 'active_devices';
  const deviceId = getOrCreateDeviceId();
  const { name, type } = detectDeviceDetails();
  const now = new Date().toISOString();

  const deviceData: ActiveDevice = {
    id: deviceId,
    userId,
    deviceId,
    deviceName: name,
    deviceType: type,
    lastSeenAt: now,
    isCurrent: true,
  };

  try {
    const docRef = doc(db, path, deviceId);
    await setDoc(docRef, deviceData, { merge: true });
    return deviceData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${deviceId}`);
  }
}

export function subscribeToActiveDevices(
  userId: string,
  onDevicesUpdated: (devices: ActiveDevice[]) => void
): () => void {
  const path = 'active_devices';
  const currentDeviceId = getOrCreateDeviceId();
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const devices: ActiveDevice[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          devices.push({
            id: docSnap.id,
            userId: data.userId,
            deviceId: data.deviceId,
            deviceName: data.deviceName,
            deviceType: data.deviceType,
            lastSeenAt: data.lastSeenAt,
            isCurrent: data.deviceId === currentDeviceId,
          });
        });
        devices.sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime());
        onDevicesUpdated(devices);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function removeDevice(deviceId: string): Promise<void> {
  const path = 'active_devices';
  try {
    await deleteDoc(doc(db, path, deviceId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${deviceId}`);
  }
}

export async function logStudySession(
  userId: string,
  durationSeconds: number,
  category: string,
  taskTitle?: string
): Promise<void> {
  const path = 'study_sessions';
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const { name } = detectDeviceDetails();
  const session: StudySession = {
    id: sessionId,
    userId,
    durationSeconds,
    category,
    taskTitle,
    deviceName: name,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, path, sessionId), session);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${sessionId}`);
  }
}
