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
import { ReviewCard, MistakeCause, PracticeAttempt } from '../types';

export function subscribeToReviewCards(
  userId: string,
  onCardsUpdated: (cards: ReviewCard[]) => void
): () => void {
  const path = 'review_cards';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const cards: ReviewCard[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          cards.push({
            id: docSnap.id,
            userId: d.userId,
            questionId: d.questionId,
            questionTitle: d.questionTitle,
            causeTag: d.causeTag as MistakeCause,
            skillSlug: d.skillSlug || 'general',
            intervalDays: d.intervalDays || 1,
            easeFactor: d.easeFactor || 2.5,
            lapses: d.lapses || 0,
            dueAt: d.dueAt || new Date().toISOString(),
            createdAt: d.createdAt || new Date().toISOString(),
            updatedAt: d.updatedAt || new Date().toISOString(),
          });
        });
        cards.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
        onCardsUpdated(cards);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function addReviewCard(
  userId: string,
  questionId: string,
  questionTitle: string,
  causeTag: MistakeCause,
  skillSlug: string = 'general'
): Promise<void> {
  const path = 'review_cards';
  const cardId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date();
  // Due tomorrow initially
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const card: ReviewCard = {
    id: cardId,
    userId,
    questionId,
    questionTitle,
    causeTag,
    skillSlug,
    intervalDays: 1,
    easeFactor: 2.5,
    lapses: 0,
    dueAt: tomorrow.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  try {
    await setDoc(doc(db, path, cardId), card);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${cardId}`);
  }
}

export async function recordPracticeAttempt(
  userId: string,
  questionId: string,
  verdict: 'accepted' | 'wrong_answer' | 'syntax_error' | 'timeout',
  score: number = 100,
  timeSpentSeconds: number = 30
): Promise<void> {
  const path = 'practice_attempts';
  const attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const attempt: PracticeAttempt = {
    id: attemptId,
    userId,
    questionId,
    verdict,
    score,
    timeSpentSeconds,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, path, attemptId), attempt);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${attemptId}`);
  }
}

export async function markReviewCardComplete(cardId: string): Promise<void> {
  const path = 'review_cards';
  try {
    await deleteDoc(doc(db, path, cardId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${cardId}`);
  }
}
