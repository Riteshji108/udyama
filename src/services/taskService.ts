import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Task, TaskPriority, TaskStatus, TaskCategory } from '../types';
import { INITIAL_TASKS_TEMPLATE } from '../data/seedData';

const LOCAL_STORAGE_TASKS_KEY = 'udyama_local_tasks_v2';

export function getLocalTasks(): Task[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read local tasks:', e);
    return [];
  }
}

export function saveLocalTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save local tasks:', e);
  }
}

export function initializeDefaultTasks(userId: string): Task[] {
  const now = new Date().toISOString();
  return INITIAL_TASKS_TEMPLATE.map((tpl, idx) => ({
    ...tpl,
    id: `task-init-${idx + 1}-${Date.now()}`,
    userId,
    createdAt: now,
    updatedAt: now,
  }));
}

/**
 * Subscribes to real-time task updates for the authenticated user.
 * Dispatches updates whenever another device changes a task.
 */
export function subscribeToUserTasks(
  userId: string,
  onTasksUpdated: (tasks: Task[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'tasks';
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tasks: Task[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          tasks.push({
            id: docSnap.id,
            userId: data.userId,
            title: data.title,
            description: data.description || '',
            status: data.status as TaskStatus,
            priority: data.priority as TaskPriority,
            category: (data.category || 'general') as TaskCategory,
            trackSlug: data.trackSlug,
            estimatedMinutes: data.estimatedMinutes,
            actualMinutes: data.actualMinutes,
            dueDate: data.dueDate,
            completedAt: data.completedAt,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        });

        // Sort: incomplete first, then by priority, then by dueDate / updatedAt
        tasks.sort((a, b) => {
          if (a.status === 'completed' && b.status !== 'completed') return 1;
          if (a.status !== 'completed' && b.status === 'completed') return -1;
          const priorityWeight: Record<TaskPriority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
          if (priorityWeight[b.priority] !== priorityWeight[a.priority]) {
            return priorityWeight[b.priority] - priorityWeight[a.priority];
          }
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });

        onTasksUpdated(tasks);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    return unsubscribe;
  } catch (error) {
    if (onError) onError(error as Error);
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createTaskInCloud(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const path = 'tasks';
  const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  const newTask: Task = {
    ...taskData,
    id: taskId,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const taskRef = doc(db, path, taskId);
    await setDoc(taskRef, {
      ...newTask,
      serverSyncedAt: serverTimestamp(),
    });
    return newTask;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${taskId}`);
  }
}

export async function updateTaskInCloud(taskId: string, updates: Partial<Task>): Promise<void> {
  const path = 'tasks';
  try {
    const taskRef = doc(db, path, taskId);
    const cleanedUpdates: Record<string, any> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    // Delete id and userId from update payload to avoid modifying immutable fields
    delete cleanedUpdates.id;
    delete cleanedUpdates.userId;

    await updateDoc(taskRef, cleanedUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${taskId}`);
  }
}

export async function deleteTaskInCloud(taskId: string): Promise<void> {
  const path = 'tasks';
  try {
    const taskRef = doc(db, path, taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${taskId}`);
  }
}

export async function syncLocalTasksToCloud(userId: string, localTasks: Task[]): Promise<void> {
  const path = 'tasks';
  for (const t of localTasks) {
    try {
      const taskRef = doc(db, path, t.id);
      await setDoc(taskRef, {
        ...t,
        userId,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn('Task sync upload item failed:', e);
    }
  }
}
