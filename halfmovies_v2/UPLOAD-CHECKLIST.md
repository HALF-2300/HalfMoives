# 📤 Upload Checklist - AICore-X1 Phase 3

**Created:** 2025-01-27  
**Purpose:** Complete list of files to upload after development phase  
**Status:** ⏳ Awaiting Upload

---

## ⚠️ IMPORTANT REMINDER

**Upload all files listed below when ready to deploy Phase 3.**

**Note:** This checklist is for the `halfmovies_v2` project.  
If you also modified files in the main `WorldStreamMaxSite` directory (like `movies.json`), check the main project upload checklist separately.

---

This checklist includes:
- ✅ New files created during Phase 3
- ✅ Modified files that need updating
- ✅ Configuration files
- ✅ Documentation files

---

## 📁 New Files Created (Phase 3)

### Core Adaptive Intelligence
- [ ] `server/src/ai/adaptiveCore.ts` ⭐ **CRITICAL**
  - Adaptive learning engine
  - Self-healing logic
  - Model weight synchronization
- [ ] `server/src/ai/telemetry.ts` ⭐ **CRITICAL**
  - Telemetry recording system
  - Anomaly detection
  - Snapshot generation
- [ ] `server/src/ai/operationalMode.ts` ⭐ **CRITICAL**
  - Operational mode activation
  - Continuous learning cycle
  - Activity event processing

### Health & Monitoring
- [ ] `server/src/routes/health.ts` ⭐ **CRITICAL**
  - Health monitoring endpoint
  - Adaptive metrics endpoint

### WebSocket Real-Time Metrics
- [ ] `server/src/routes/insight.ts` ⭐ **CRITICAL**
  - WebSocket server for live metrics
  - Real-time data streaming

### Scripts & Validation
- [ ] `scripts/validate-phase3.mjs`
  - Phase 3 validation script
  - Component verification

### Documentation
- [ ] `docs/ai/diagnostics-report.md` (updated)
- [ ] `docs/ai/autoevolution.md` (updated)
- [ ] `docs/ai/phase3-deployment-summary.md` (new)
- [ ] `docs/ai/operational-status.md` (new)
- [ ] `docs/ai/diagnostics.json` (if generated)
- [ ] `docs/ai/anomalies.log` (auto-generated, don't upload)

---

## 📝 Modified Files (Phase 3 Updates)

### Server Core
- [ ] `server/src/index.ts` ⭐ **CRITICAL**
  - Added health router
  - Added WebSocket initialization
  - Added adaptive core initialization
  - Changed to HTTP server for WebSocket support

### Recommendation Engine
- [ ] `server/src/ai/recommendation.ts` ⭐ **CRITICAL**
  - Integrated adaptive core
  - Added cache hit rate tracking
  - Added learning from events
  - Adaptive TTL support

---

## 📦 Existing Files (Verify These Are Up To Date)

### Configuration
- [ ] `.env` (if you have one - **DO NOT upload if it contains secrets**)
- [ ] `package.json` (check for new dependencies)
- [ ] `tsconfig.json`
- [ ] `server/tsconfig.json`

### Database
- [ ] `prisma/schema.prisma` (if modified)
- [ ] `prisma/migrations/` (any new migrations)

---

## 🗂️ Directory Structure to Create on Server

If these directories don't exist, create them:

- [ ] `localdata/` (for recovery.json - created automatically, but ensure writable)
- [ ] `docs/ai/` (for documentation files)

---

## 📋 Upload Instructions

### Method 1: FTP/File Manager (Recommended)

1. **Backup existing files first:**
   ```
   server/src/index.ts → server/src/index.ts.backup
   server/src/ai/recommendation.ts → server/src/ai/recommendation.ts.backup
   ```

2. **Upload new files:**
   - Upload all files from "New Files Created" section
   - Ensure directory structure matches

3. **Update modified files:**
   - Replace existing files with updated versions
   - Check file permissions (644 for files, 755 for directories)

4. **Verify:**
   - Check file sizes match
   - Check file dates are recent
   - Ensure `.env` is NOT uploaded (contains secrets)

### Method 2: Git (If using version control)

```bash
# On server, pull latest changes
git pull origin main

# Or if deploying manually
git checkout <commit-hash>
```

---

## ✅ Post-Upload Verification

After uploading, verify:

1. **Check server starts:**
   ```bash
   pnpm build
   pnpm server:start
   ```

2. **Test health endpoint:**
   ```bash
   curl http://your-domain.com/api/health/adaptive
   ```

3. **Check WebSocket:**
   - Connect to `ws://your-domain.com/ws/insight`
   - Should receive metrics every 5 seconds

4. **Verify adaptive core:**
   - Check logs for "Adaptive Core initialized"
   - Check `localdata/recovery.json` is created (if needed)

---

## 🔒 Security Notes

- ⚠️ **NEVER upload `.env` file** - contains database credentials
- ⚠️ **NEVER upload `localdata/recovery.json`** - may contain sensitive data
- ⚠️ **Check file permissions** - ensure sensitive files are not world-readable

---

## 📊 File Count Summary

- **New files:** 7 core files + 4 documentation files = 11 files
- **Modified files:** 2 critical files
- **Total to upload:** ~13 files

---

## 🗓️ Upload Schedule

**Planned Upload Date:** _______________  
**Uploaded By:** _______________  
**Status:** ⏳ Pending

---

## 📝 Notes

- All Phase 3 files are ready for upload
- Server must have Node.js 22+ and pnpm installed
- Database connection (DATABASE_URL) must be configured on server
- Redis is optional but recommended

---

**Last Updated:** 2025-01-27  
**Next Review:** Before upload

