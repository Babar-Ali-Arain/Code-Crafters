# Security Specification: Code Crafters Firebase Rules

## 1. Data Invariants
- **User Integrity**: A user can only register or write their own user profile document (`/users/{userId}` where `userId == request.auth.uid`). They cannot escalate their own role to `"admin"` or `"team"` on creation/update.
- **Root Admin**: `babaraliarain2211@gmail.com` is verified as the default Admin who bypasses client level write blocks. Other users default to `"client"` unless changed by an existing Admin.
- **Task Assignment Protection**: Only Admins can create tasks, assign them to team members, or set priority/title/description. Team members can only update a task's `status` field, and nothing else.
- **Announcement Authority**: Only admins may write or modify `/announcements/{id}` documents. All users may read announcements.
- **Inquiry Security**: Clients can create inquiries with validation (e.g. valid name, correct email, proper message). Only Admins can list, update, or read general inquiry details.

---

## 2. The "Dirty Dozen" Poison Payloads (Zero-Trust Validation)

The following 12 payloads attempt to compromise our systems and will be rejected with `PERMISSION_DENIED`:

1. **User - Self-Admin Escalate**: `{"uid": "attacker_123", "email": "attacker@gmail.com", "name": "Attacker", "role": "admin"}` (Attempting to self-assign the admin role).
2. **User - Spoofed Owner ID**: User authenticated as `user_abc` attempting to create/update `/users/user_xyz` profile.
3. **User - Immutable Field Modification**: Trying to alter `createdAt` on user profile.
4. **Task - Client Creative Attack**: A non-authenticated or client-level user trying to create a task in `/tasks/task_123`.
5. **Task - Team Member Overreach**: A team member trying to rename a task or reassign it to someone else: changing `assignedTo` from `team_peter` to `team_john`.
6. **Task - Terminal State Lock Override**: Any client attempting to update a task after it has been marked as `"completed"`.
7. **Task - Invalid Priority Value**: Attempting to set `priority` to `"infinite"` or other non-enum value.
8. **Announcement - False Broadcast**: A standard client trying to publish a mock announcement in `/announcements/fake_news`.
9. **Inquiry - System Privilege Hijack**: Attempting to read all client inquiries from `/inquiries` as a basic logged-in client.
10. **Inquiry - Invalidate Email Field**: Creating an inquiry where `email` is not a string or has a size > 256 characters.
11. **Path Variable ID Injection**: Attempting to write a task with a massive 2KB malicious text string as the document ID to cause Denial of Service.
12. **Null/Undefined Timestamp Fraud**: Placing client-sent custom epoch numbers instead of verified server timestamps (`request.time`) for `createdAt` and `updatedAt`.

---

## 3. High-Fidelity Test Runner Spec
Below is a model of how the `firestore.rules.test.ts` or security layer checks each of the scenarios. All of these must return a permission denied status in rules verification, preserving security under all testing conditions.
