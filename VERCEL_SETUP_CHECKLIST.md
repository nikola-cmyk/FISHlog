# 🚀 VERCEL DEPLOYMENT - COPY & PASTE CHECKLIST

## ✅ STEP 1: Add Environment Variables to Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

### Variable 1: VITE_SUPABASE_URL

**Key (copy this):**
```
VITE_SUPABASE_URL
```

**Value (copy this):**
```
https://naicpbbeauxziursvwrz.supabase.co
```

**Environments:** ✅ Production ✅ Preview ✅ Development (check all three!)

Click **Save**

---

### Variable 2: VITE_SUPABASE_ANON_KEY

**Key (copy this):**
```
VITE_SUPABASE_ANON_KEY
```

**Value (copy this - ENTIRE line, no spaces before/after):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5haWNwYmJlYXV4eml1cnN2d3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3Mjg5MDQsImV4cCI6MjA4MTMwNDkwNH0.lYCJijKdQXPuy7HVjMAXa4oSkbml02aIIV79UkqZV9c
```

**Environments:** ✅ Production ✅ Preview ✅ Development (check all three!)

Click **Save**

---

## ✅ STEP 2: Configure Supabase Redirect URLs

Go to: **Supabase Dashboard → Your Project → Authentication → URL Configuration**

### Site URL

**Replace with your Vercel URL (example):**
```
https://your-app-name.vercel.app
```

*(Replace `your-app-name` with your actual Vercel deployment URL)*

---

### Redirect URLs

**Add this pattern (replace with your actual Vercel URL):**
```
https://your-app-name.vercel.app/**
```

**Also add:**
```
http://localhost:5173/**
```

Click **Save**

---

## ✅ STEP 3: Redeploy in Vercel

1. Go to: **Vercel Dashboard → Your Project → Deployments**
2. Find the latest deployment
3. Click the **three dots (•••)** on the right
4. Click **"Redeploy"**
5. ⚠️ **UNCHECK** "Use existing Build Cache"
6. Click **"Redeploy"** button

---

## ✅ STEP 4: Wait & Test

1. Wait 2-3 minutes for deployment to complete
2. Look for green "Ready" checkmark
3. Click on your deployment URL
4. Try to **Sign Up** or **Log In**
5. ✅ Success! You should be able to authenticate

---

## 🆘 Still Having Issues?

If you still get errors after following all steps:

1. **Check Browser Console** (Press F12 → Console tab)
2. **Copy any error messages** you see
3. **Share them with me** and I'll help troubleshoot further

---

## 📋 Quick Reference

**Your Supabase Project:**
- Project Ref: `naicpbbeauxziursvwrz`
- Project URL: `https://naicpbbeauxziursvwrz.supabase.co`

**Your GitHub Repo:**
- `nikola-cmyk/FISHlog`

**Vercel Framework Preset:**
- Should be set to: **Vite**

---

## ⚡ Pro Tips

✅ When copying the ANON_KEY, make sure:
- No spaces at the beginning
- No spaces at the end
- No line breaks in the middle
- Starts with `eyJ` and ends with `V9c`

✅ After adding environment variables, ALWAYS redeploy

✅ Make sure all three environments are checked (Production, Preview, Development)

---

**Good luck! 🎣 Your app will be live soon!**