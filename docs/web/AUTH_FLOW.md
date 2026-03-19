# AUTH_FLOW.md — Nyaya Web: Google Sign-In Flow

> Share this with anyone who needs to understand how auth works in Nyaya.
> The goal: user clicks one button, gets full AI access. Zero friction. Zero API keys.

---

## The Big Picture

```
Google Account ──────────────────────────────────────────────────────────►
                                                                          │
                         Firebase Auth (Free)                             │
                         ────────────────────                             │
                         Handles all OAuth complexity                     │
                         Returns ID Token (JWT) to browser                │
                                                                          │
Browser ──── Firebase ID Token ────────────────────────────────► Backend │
                                                                          │
                         Firebase Admin SDK                               │
                         ───────────────────                              │
                         Verifies the token is real                       │
                         Extracts: uid, email, name                       │
                                                                          │
                         Rate Limiter                                     │
                         ────────────                                     │
                         Checks: has this uid used < 50 AI calls today?   │
                                                                          │
                         Gemini API (Backend's key, not user's)           │
                         ─────────────────────────────────────────────────
                         Makes the AI call
                         Returns result to user
```

---

## Step-by-Step: First Time User

### Step 1 — User arrives at Nyaya
- Lands on `/` (landing page)
- Can immediately search cases (no sign-in)
- Can browse dictionary, maxims, rights cards (no sign-in)

### Step 2 — User tries an AI feature
- Clicks "✨ Generate AI Summary" on a case
- The `<AuthGate>` component detects they're not signed in
- Shows: preview skeleton + sign-in prompt card
- Prompt text: *"Sign in with Google to unlock AI summaries — it's completely free. We only use your account to identify you."*
- One button: **Continue with Google**

### Step 3 — Google Sign-In
```typescript
// src/lib/firebase/auth.ts
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
};
```
- Firebase opens a Google popup
- User selects their Google account
- Firebase handles the OAuth handshake
- Returns a `User` object to the frontend

### Step 4 — Auth State Stored
```typescript
// src/lib/stores/auth.store.ts
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    const idToken = await firebaseUser.getIdToken();
    useAuthStore.setState({
      user: firebaseUser,
      idToken,
      isLoading: false,
    });
  } else {
    useAuthStore.setState({ user: null, idToken: null, isLoading: false });
  }
});
```

### Step 5 — AuthGate Disappears, Feature Loads
- Zustand auth store updates
- `<AuthGate>` sees `user !== null` → renders the actual feature
- AI Summary generates immediately
- User never had to configure anything

---

## Step-by-Step: Authenticated API Call

```typescript
// src/lib/api/client.ts

async get<T>(path: string): Promise<T> {
  // 1. Get current Firebase user
  const user = getAuth().currentUser;

  // 2. Get fresh ID token (Firebase auto-refreshes if expired)
  const token = user ? await user.getIdToken() : null;

  // 3. Build headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  // 4. Make request
  const res = await fetch(`${this.baseUrl}${path}`, { headers });

  // 5. Handle errors
  if (res.status === 401) throw new AuthError('Please sign in to continue');
  if (res.status === 429) throw new RateLimitError('Daily AI limit reached');
  if (!res.ok) throw new ApiError(res.status, await res.json());

  return res.json();
}
```

---

## Step-by-Step: Backend Verification

```python
# backend/routers/cases.py

@router.get("/{doc_id}/summary")
async def get_summary(
    doc_id: str,
    current_user: FirebaseUser = Depends(get_current_user),  # ← Auth check
    db=Depends(get_firestore),
):
    # 1. Check rate limit
    usage = rate_limiter.check_and_increment(current_user.uid)

    # 2. Check Firestore cache (so we don't regenerate for same case)
    cached = await db.collection('summaries').document(doc_id).get()
    if cached.exists:
        return {**cached.to_dict(), "usage": usage}

    # 3. Fetch case text from Kanoon
    case = await kanoon.get_full_doc(doc_id)

    # 4. Generate summary via Gemini (using BACKEND's API key)
    summary = await gemini.summarise(case['doc'])

    # 5. Cache in Firestore (all users benefit from this cache)
    await db.collection('summaries').document(doc_id).set({
        **summary,
        "generatedAt": datetime.utcnow().isoformat()
    })

    return {**summary, "usage": usage}
```

---

## Firebase Setup (One-Time Manual Steps)

### 1. Create Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create new project: "nyaya-app"
3. Disable Google Analytics (not needed)

### 2. Enable Google Sign-In
1. Authentication → Sign-in method → Google → Enable
2. Add project support email (your Gmail)
3. Save

### 3. Create Web App
1. Project Overview → Add app → Web
2. Register app name: "Nyaya Web"
3. Copy the Firebase config object → paste into `.env.local`

### 4. Enable Firestore
1. Firestore Database → Create database
2. Start in **production mode**
3. Choose region: `asia-south1` (Mumbai)
4. Deploy security rules from `WEBSITE_ARCHITECTURE.md`

### 5. Download Service Account (for Backend)
1. Project Settings → Service accounts
2. Generate new private key
3. Download JSON → save as `backend/firebase-service-account.json`
4. **Add to `.gitignore` immediately — NEVER commit this file**

### 6. Add Authorized Domains
1. Authentication → Settings → Authorized domains
2. Add: `localhost` (dev), `nyaya.vercel.app` (prod)

---

## What Data Does Google Give Us?

When a user signs in with Google, Firebase gives us:

```typescript
{
  uid: "abc123xyz",           // Unique ID — this is what we use
  email: "user@gmail.com",    // Their Gmail
  displayName: "Priya Sharma", // Their Google display name
  photoURL: "https://...",    // Their Google profile photo
  emailVerified: true,        // Always true for Google sign-in
}
```

We store: `uid`, `displayName`, `photoURL` in Firestore (for bookmarks, etc.)
We do NOT store: passwords, phone numbers, or anything else

---

## Rate Limit UX

When a user hits the 50 AI calls/day limit:

```typescript
// Frontend handling
if (error instanceof RateLimitError) {
  toast.error(
    "You've used all 50 free AI requests for today. Come back tomorrow!",
    {
      description: "Your limit resets at midnight IST",
      duration: 6000,
    }
  );
}
```

The `<AIUsageMeter>` component in the nav shows:
- A small progress bar: "AI calls: 12 / 50 today"
- Greens out to orange to red as it fills
- Clicking it explains the limit and why it exists

---

## Security Notes

| Risk | Mitigation |
|---|---|
| User spoofs another user's UID | Backend verifies token with Firebase Admin SDK — impossible to fake |
| Someone extracts Gemini API key from frontend | Key is only in backend `.env` — never sent to browser |
| User makes 1000 AI calls a day | Rate limiter: 50/day/uid, enforced server-side |
| Service account JSON leaked | In `.gitignore`, never committed. Render.com env vars used in production |
| Token expiry | Firebase SDK auto-refreshes tokens every hour — handled transparently |

---

## Token Lifetime

- Firebase ID tokens expire after **1 hour**
- Firebase SDK auto-refreshes them silently
- Our API client calls `getIdToken()` before every request — always gets a fresh token
- Refresh tokens (long-lived) are managed by Firebase — we never touch them
- User stays "signed in" across browser sessions (Firebase persistence = LOCAL by default)

---

*Document: AUTH_FLOW.md · Project: Nyaya Web · Phase: 1*
