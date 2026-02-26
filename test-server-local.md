# 🧪 Test Server Locally - Step by Step

## Step 1: Check Files
```bash
# Make sure these files exist:
✅ server.js
✅ package.json
```

## Step 2: Install Dependencies (if needed)
```bash
npm install
```

## Step 3: Start Server
```bash
node server.js
```

**Expected output:**
```
HalfMovie backend running on http://localhost:4000
```

## Step 4: Test AI Endpoints

### Test 1: Continuum Endpoint
Open in browser:
```
http://localhost:4000/api/health/continuum
```

**Expected:** JSON response with phase, presence, resonance, etc.

### Test 2: Continuum State
Open in browser:
```
http://localhost:4000/api/health/continuum/state
```

**Expected:** JSON response with phase, presence, light, etc.

### Test 3: Movies Endpoint (should already work)
```
http://localhost:4000/api/movies
```

---

## ⚠️ Common Issues

### Issue 1: Port Already in Use
**Error:** `EADDRINUSE: address already in use :::4000`

**Solution:**
```bash
# Find and kill process on port 4000
# Windows:
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Or change port in server.js:
const port = process.env.PORT || 5000;
```

### Issue 2: Module Not Found
**Error:** `Cannot find module 'express'`

**Solution:**
```bash
npm install
```

### Issue 3: Syntax Error
**Error:** Syntax errors in server.js

**Solution:**
- Check server.js for syntax errors
- Make sure all brackets are closed
- Check for missing commas

---

## ✅ If It Works Locally

Once it works on `localhost:4000`, you can:
1. Upload `server.js` to your server
2. Upload `package.json` to your server
3. Run `npm install` on server
4. Start server on server
5. Test: `https://yourdomain.com/api/health/continuum`

---

## 🚀 Quick Test Command

```bash
# Start server
node server.js

# In another terminal, test:
curl http://localhost:4000/api/health/continuum
```

