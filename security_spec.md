# Security Specification: Udyama Task & Productivity Sync

## 1. Data Invariants
1. A user profile document (`/users/{userId}`) can only be read or written by the authenticated user whose `request.auth.uid == userId`.
2. Tasks (`/tasks/{taskId}`) must have `userId == request.auth.uid`. A user cannot read, query, update, or delete tasks belonging to other users.
3. Every task must have a non-empty `title` (length <= 256), a valid status in `['todo', 'in_progress', 'completed', 'archived']`, and priority in `['urgent', 'high', 'medium', 'low']`.
4. Active devices (`/active_devices/{deviceId}`) belong to the authenticated user (`userId == request.auth.uid`) to provide multi-device live presence without exposing information to other users.
5. Study sessions, practice attempts, and review cards must strictly match `request.auth.uid`.
6. Document path IDs must adhere to `isValidId()` (string length <= 128, alphanumeric and hyphens/underscores).
7. Blanket reads (`allow list: if isSignedIn()`) are strictly forbidden; queries must check `resource.data.userId == request.auth.uid`.

## 2. The Dirty Dozen Payloads (Targeting Rejection)
1. **Unauthenticated Task Creation**: Anonymous/unauthenticated `create` on `/tasks/task-1`.
2. **Identity Spoofing**: User `A` creates a task with `userId: "user-B"`.
3. **Ghost Field Poisoning**: Task update inserting unauthorized schema properties like `__role: "admin"`.
4. **Id Hijacking**: User `B` reads or updates User `A`'s task at `/tasks/task-a1`.
5. **Denial of Wallet Huge String**: Task title greater than 256 characters or description greater than 2048 characters.
6. **Path ID Traversal/Poisoning**: Creating a task with doc ID containing special characters like `../../../etc`.
7. **Profile Impersonation**: User `B` attempting to read or overwrite `/users/user-A`.
8. **Invalid Enum Injection**: Task status set to `status: "deleted_forever"` or priority `priority: "ultra_high"`.
9. **Device Spoofing**: User `A` updating device heartbeat document for device registered to User `B`.
10. **Study Session Ghost Time**: User `A` logging study session with negative duration or malformed category.
11. **Spaced Repetition Leak**: Querying `/review_cards` without user boundary `userId == request.auth.uid`.
12. **Immutable Field Tampering**: Attempting to alter `userId` or `createdAt` on an existing task.
