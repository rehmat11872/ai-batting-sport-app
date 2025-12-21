# 🔧 Fix: GitHub Secrets vs Environment Variables

## ❌ The Problem

You added `APP_URL` as an **Environment variable**, but the workflow needs it as a **Repository Secret**.

**GitHub has 2 different places:**
1. **Repository Secrets** → Accessed via `${{ secrets.APP_URL }}` ✅ (What we need)
2. **Environment Variables** → Accessed via `${{ env.APP_URL }}` ❌ (What you added)

---

## ✅ How to Fix

### **Step 1: Go to Repository Secrets (NOT Environment Variables)**

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. You should see **"Repository secrets"** tab (this is what we need!)

### **Step 2: Add as Repository Secret**

1. Click **"New repository secret"** button
2. **Name:** `APP_URL`
3. **Secret:** `https://ai-batting-sport-app.vercel.app`
4. Click **"Add secret"**

### **Step 3: Add CRON_SECRET Too**

1. Click **"New repository secret"** again
2. **Name:** `CRON_SECRET`
3. **Secret:** (same value as in your `.env.local`)
   - If you don't have one, generate it:
     ```bash
     openssl rand -base64 32
     ```
4. Click **"Add secret"**

---

## 📍 Where to Find It

```
GitHub Repo
  └── Settings
      └── Secrets and variables
          └── Actions
              ├── Repository secrets  ← ADD HERE! ✅
              └── Environment secrets (ignore this)
```

---

## ✅ Verify It's Added

After adding, you should see in **Repository secrets**:
- ✅ `APP_URL` (shows as `***`)
- ✅ `CRON_SECRET` (shows as `***`)

**Note:** You can't see the values after saving (they're hidden for security).

---

## 🧪 Test Again

1. Go to **Actions** tab
2. Select **Refresh Insider Alerts**
3. Click **Run workflow** → **Run workflow**
4. Should work now! ✅

---

## 🔍 Quick Check

**Wrong place (what you did):**
- Settings → Secrets and variables → Actions → **Environments** tab
- This is for environment-specific variables

**Right place (what you need):**
- Settings → Secrets and variables → Actions → **Repository secrets** tab
- This is for workflow secrets

---

## 📝 Summary

| Type | Location | Access in Workflow | What You Need |
|------|----------|-------------------|---------------|
| **Repository Secret** | Secrets → Actions → Repository secrets | `${{ secrets.APP_URL }}` | ✅ **This one!** |
| **Environment Variable** | Secrets → Actions → Environments | `${{ env.APP_URL }}` | ❌ Wrong place |

**Add `APP_URL` and `CRON_SECRET` as Repository Secrets!** 🎯

