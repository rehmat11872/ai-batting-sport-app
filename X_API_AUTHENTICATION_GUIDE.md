# 🔐 X API Authentication Guide - Why We Need X_BEARER_TOKEN

## **According to X API Documentation** 📚

Based on [X API Getting Access documentation](https://docs.x.com/x-api/getting-started/getting-access-to-the-x-api):

### **Types of Credentials:**

| Credential | Purpose | Used For |
|------------|---------|----------|
| **API Key + Secret** | OAuth 1.0a / Generate tokens | User context requests, generating tokens |
| **Access Token + Secret** | OAuth 1.0a User Context | Requests on behalf of user |
| **Client ID + Secret** | OAuth 2.0 | Fine-grained user access |
| **App-only Access Token** ✅ | **Public data access** | **Requests to public endpoints** |

### **Why We Need App-only Access Token (Bearer Token):**

From X API docs:
> **"App only Access Token: You will use this token when making requests to endpoints that responds with information publicly available on X."**

**Our use case:**
- ✅ We're searching **public tweets** from insiders
- ✅ We don't need user-specific data
- ✅ We don't need to post tweets
- ✅ **Perfect for App-only Access Token!**

---

## **How to Get App-only Access Token** 🔑

### **Option 1: X Developer Portal (Easiest)** ⭐

1. Go to https://developer.twitter.com/en/portal/dashboard
2. Select your **Project** → **App**
3. Go to **"Keys and tokens"** tab
4. Scroll to **"Bearer Token"** section
5. Click **"Generate"** or **"Regenerate"**
6. **Copy the token** (it only shows once!)
7. Add to `.env.local`:
   ```env
   X_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAA...
   ```

**This is the App-only Access Token!**

---

### **Option 2: Generate Programmatically** (Alternative - May Not Work)

**Note:** Programmatic generation sometimes fails due to credential issues. **Use Option 1 (Portal) instead!**

If you want to try programmatic generation:
```bash
node scripts/get-bearer-token.js
```

**What it does:**
1. Base64 encodes: `X_API_KEY:X_API_KEY_SECRET`
2. Calls: `POST https://api.x.com/oauth2/token`
3. With: `grant_type=client_credentials`
4. Returns: `access_token` (this is your Bearer Token!)

**⚠️ If you get 403 error:**
- Your API Key/Secret might not have permission to generate bearer tokens
- **Solution: Use Option 1 (Portal) - it's guaranteed to work!**

---

## **Why Not Use X_API_KEY + X_API_KEY_SECRET Directly?** ❓

### **According to X API Docs:**

**API Key + Secret are used for:**
- ✅ OAuth 1.0a User Context (requires user login)
- ✅ Generating other tokens (like Bearer Token)
- ❌ **NOT for direct API calls to search endpoints**

**App-only Access Token (Bearer Token) is used for:**
- ✅ **Public data endpoints** (like `/2/tweets/search/recent`)
- ✅ **No user login needed**
- ✅ **Simpler authentication** (just one token)

### **Our Implementation:**

**File: `lib/x-client.ts`**
```typescript
// We use Bearer Token for app-only auth
const res = await fetch(`https://api.x.com/2/tweets/search/recent?query=...`, {
  headers: {
    Authorization: `Bearer ${X_BEARER_TOKEN}`, // ← App-only token!
  },
});
```

**This matches X API v2 requirements:**
- Search endpoints accept Bearer Token authentication
- No user context needed (we're reading public tweets)
- Simpler than OAuth flow

---

## **Complete Authentication Flow** 🔄

### **Step 1: Get Credentials from X Developer Portal**

You have:
- ✅ `X_API_KEY` (from portal)
- ✅ `X_API_KEY_SECRET` (from portal)

### **Step 2: Generate App-only Access Token**

**Option A: Portal (Easiest)**
- Portal → Keys and tokens → Generate Bearer Token
- Copy → `X_BEARER_TOKEN`

**Option B: Programmatic**
- Use `X_API_KEY` + `X_API_KEY_SECRET`
- Call `/oauth2/token` endpoint
- Get `access_token` → `X_BEARER_TOKEN`

### **Step 3: Use Bearer Token for API Calls**

```typescript
// lib/x-client.ts
Authorization: `Bearer ${X_BEARER_TOKEN}`
```

---

## **What You Need in `.env.local`** 📝

```env
# OAuth credentials (for generating tokens)
X_API_KEY=VIWOGJrh5nhTmemdS2P2QMKN4
X_API_KEY_SECRET=cFwuLvcemwKnCqiS80d12Pwya61LuDricYozK4BRo49zHM4eEL

# App-only Access Token (for API calls) ← REQUIRED!
X_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAA...
```

**Why both?**
- `X_API_KEY` + `X_API_KEY_SECRET`: Can generate new Bearer Token if needed
- `X_BEARER_TOKEN`: Used directly for API calls (what we need!)

---

## **According to X API SDK Documentation** 📖

From [X API SDKs documentation](https://docs.x.com/x-api/tools-and-libraries/sdks#typescript-3):

> **"If you are using the application only option to authenticate the SDKs, you will only need to provide the token and the library client will be ready to use the endpoint methods right away."**

**This confirms:**
- ✅ App-only auth = Just provide Bearer Token
- ✅ No OAuth flow needed
- ✅ Perfect for our use case!

---

## **Summary** ✅

**Why `X_BEARER_TOKEN`?**
1. ✅ Required for app-only authentication
2. ✅ Needed for public tweet search endpoints
3. ✅ Simpler than OAuth (no user login)
4. ✅ Matches X API v2 requirements

**How to get it?**
1. ✅ **Easiest**: X Developer Portal → Keys and tokens → Generate Bearer Token
2. ✅ **Alternative**: Generate from `X_API_KEY` + `X_API_KEY_SECRET` using script

**What you need:**
- ✅ `X_API_KEY` + `X_API_KEY_SECRET` (you have these)
- ✅ `X_BEARER_TOKEN` (generate this!)

**Next step:**
```bash
# Generate bearer token
node scripts/get-bearer-token.js

# Or get it from X Developer Portal
# Then add to .env.local:
# X_BEARER_TOKEN=...
```

🎉 **Everything matches X API documentation!**

