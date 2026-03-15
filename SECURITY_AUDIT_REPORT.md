# SECURITY AUDIT — Status Report
**App:** Notebase Mobile (React Native)  
**Date:** 2026-03-15  
**Audited Against:** ReadBase Mobile Premium Blueprint

---

## ✅ IMPLEMENTED SECURITY FEATURES

### 1. Screenshot Prevention
**Status:** ✅ ACTIVE  
**Implementation:** `app/pdf/[id].native.tsx`
```typescript
import * as ScreenCapture from 'expo-screen-capture';

// Prevent screenshots in PDF viewer
await ScreenCapture.preventScreenCaptureAsync();

// Re-enable on unmount
ScreenCapture.allowScreenCaptureAsync();
```
**Coverage:**
- iOS: Full protection + user notification on attempt
- Android: FLAG_SECURE at app level (requires native config)
- Web: Not applicable

---

### 2. Dynamic Watermarking
**Status:** ✅ ACTIVE  
**Implementation:** Server-side via `serve-pdf` edge function  
**Watermark Format:**
```
Email: user@example.com
IP: 192.168.1.1
Time: 2026-03-15 14:30:22 UTC
```
**Display:** Diagonal overlay on every PDF page via banner component

**Files:**
- `app/pdf/[id].native.tsx` — Watermark banner display
- Supabase Edge Function: `serve-pdf` — Server-side generation

---

### 3. Single Session Enforcement
**Status:** ✅ ACTIVE  
**Implementation:** Device session tracking + heartbeat system  

**Flow:**
1. User logs in → `device_sessions` table insert
2. Heartbeat every 5 minutes → updates `last_active_at`
3. New login → Old session marked invalid
4. App foreground → Check for session conflict
5. Conflict detected → Redirect to `/session-conflict`

**Files:**
- `services/session.ts` — Heartbeat + conflict detection
- `hooks/useAuth.tsx` — Session monitoring
- `app/session-conflict.tsx` — User warning screen

**Database:**
```sql
-- device_sessions table
session_id UUID PRIMARY KEY
user_id UUID REFERENCES auth.users
last_active_at TIMESTAMP
is_active BOOLEAN
```

---

### 4. Tier-Based Access Control
**Status:** ✅ ACTIVE  
**Implementation:** Server-side RLS + client-side UI gating  

**Tiers:**
- **Silver (Starter):** Read-only, no AI, no downloads
- **Gold (Standard):** AI (1K credits), downloads enabled
- **Platinum (Lifetime):** AI (10K credits), offline vault (50 PDFs)

**Enforcement Points:**
1. PDF access: `serve-pdf` edge function checks `min_tier` vs user tier
2. AI chat: Credit limit enforcement in `services/ai.ts`
3. Downloads: `canDownload` flag returned from server

**Files:**
- `services/pdf.ts` — Client-side tier check UI
- Supabase Edge Function: `serve-pdf` — Server-side enforcement
- `app/(tabs)/ai-chat.tsx` — Credit display + blocking

---

### 5. Signed URLs (5-Minute Expiry)
**Status:** ✅ ACTIVE  
**Implementation:** Supabase Storage signed URLs  

**Process:**
1. User requests PDF → Client calls `serve-pdf` edge function
2. Server validates user tier + note access
3. Server generates signed URL (5-minute expiry)
4. Client receives URL + watermark data
5. URL expires after 5 minutes (security window)

**Files:**
- Supabase Edge Function: `serve-pdf`
- `services/pdf.ts` — Client-side URL handling

---

## ⚠️ PENDING SECURITY ENHANCEMENTS

### 1. Android FLAG_SECURE Configuration
**Status:** 🟡 NEEDS IMPLEMENTATION  
**Action Required:** Add native Android configuration to enable FLAG_SECURE globally

**Implementation:**
```java
// android/app/src/main/java/.../MainActivity.java
import android.view.WindowManager;

@Override
protected void onCreate(Bundle savedInstanceState) {
  super.onCreate(savedInstanceState);
  getWindow().setFlags(
    WindowManager.LayoutParams.FLAG_SECURE,
    WindowManager.LayoutParams.FLAG_SECURE
  );
}
```

---

### 2. Offline Protected Mode (Platinum Only)
**Status:** 🔴 NOT IMPLEMENTED  
**Requirement:** Allow Platinum users to "Vault" (download) 50+ PDFs with AES-256 encryption

**Proposed Implementation:**
1. Download PDFs → Encrypt with AES-256 using user's session key
2. Store in app's secure document directory
3. Heartbeat validation: If session not verified in 7 days → Auto-purge cache
4. Decrypt on demand using active session key

**Files to Create:**
- `services/offlineVault.ts` — Encryption + cache management
- `services/crypto.ts` — AES-256 encryption wrapper
- `app/(tabs)/offline.tsx` — Vault management UI

**Dependencies:**
```bash
npx expo install expo-crypto expo-file-system
```

---

### 3. Content Protection (Text Copy Prevention)
**Status:** 🔴 NOT IMPLEMENTED  
**Requirement:** Disable text selection and copying in PDF viewer

**Implementation:**
```typescript
// For react-native-pdf
<Pdf
  enablePanning={true}
  enableSelection={false} // Disable text selection
  // ...
/>
```

**Note:** This is a UX deterrent only; determined users can still extract text via screenshots (which are already prevented).

---

### 4. Session Anomaly Detection
**Status:** 🔴 NOT IMPLEMENTED  
**Requirement:** Detect suspicious session patterns (e.g., rapid device switching, unusual IP locations)

**Proposed Features:**
- Log IP address per session
- Alert user via email if login from new country
- Rate limit: Max 3 device switches per 24 hours

**Files to Create:**
- Supabase Edge Function: `session-anomaly-detector`
- `services/sessionAnomalyLogger.ts`

---

### 5. RLS (Row-Level Security) Policy Audit
**Status:** 🟡 NEEDS VERIFICATION  
**Action Required:** Manually verify all RLS policies in Supabase dashboard

**Critical Tables:**
- `notes` — Ensure users can only read notes matching their tier
- `ai_chat_messages` — Ensure users can only read their own messages
- `device_sessions` — Ensure users can only manage their own sessions
- `download_logs` — Ensure users can only insert their own logs

---

## 🔍 AUDIT CHECKLIST

| Feature | Status | Priority | ETA |
|---------|--------|----------|-----|
| Screenshot Prevention (iOS) | ✅ Active | P0 | Done |
| Screenshot Prevention (Android) | 🟡 Partial | P0 | Sprint 2 |
| Dynamic Watermarking | ✅ Active | P0 | Done |
| Single Session Enforcement | ✅ Active | P0 | Done |
| Signed URL Expiry | ✅ Active | P0 | Done |
| Tier-Based Access Control | ✅ Active | P0 | Done |
| Offline Protected Mode | 🔴 Missing | P1 | Sprint 3 |
| Text Copy Prevention | 🔴 Missing | P2 | Sprint 4 |
| Session Anomaly Detection | 🔴 Missing | P2 | Backlog |
| RLS Policy Audit | 🟡 Pending | P1 | Sprint 2 |

---

## 📊 RISK ASSESSMENT

### Critical Risks (P0)
- **Android Screenshot Vulnerability:** Android devices can still screenshot PDFs without FLAG_SECURE native config.
  - **Mitigation:** Implement native Android config ASAP.

### High Risks (P1)
- **No Offline Protection:** Platinum users cannot use offline mode securely yet.
  - **Mitigation:** Implement AES-256 encrypted vault in Sprint 3.

### Medium Risks (P2)
- **Text Extraction:** Users with developer tools can potentially extract text via accessibility services.
  - **Mitigation:** Disable text selection (UX deterrent).

---

## 🎯 RECOMMENDATIONS

1. **Immediate:** Add Android FLAG_SECURE native configuration
2. **Sprint 2:** Complete RLS policy audit and fix any gaps
3. **Sprint 3:** Implement Platinum offline vault with encryption
4. **Sprint 4:** Add session anomaly detection for enterprise security

---

**Audited By:** AI Development Assistant  
**Next Review:** 2026-04-01  
**Escalation Contact:** support@readbase.lk
