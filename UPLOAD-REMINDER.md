# 📤 Upload Reminder - All Projects

**Created:** 2025-01-27  
**Purpose:** Quick reminder of what needs to be uploaded

---

## 🎯 Two Projects to Check

### 1. Main Project (`WorldStreamMaxSite/`)
**Location:** Root directory

**Files that may need uploading:**
- [ ] `movies.json` (if updated - now has 852 movies)
- [ ] `searchIndex.json` (if rebuilt)
- [ ] `index.html` (if modified)
- [ ] `youtube-feeds-loader.js` (if modified)
- [ ] Any other frontend files modified

**Check:** Look for files modified in the last few days

---

### 2. Phase 3 Project (`halfmovies_v2/`)
**Location:** `halfmovies_v2/` directory

**See detailed checklist:**
- 📄 `halfmovies_v2/UPLOAD-CHECKLIST.md` - Complete detailed list
- 📄 `halfmovies_v2/UPLOAD-QUICK-REFERENCE.txt` - Quick reference

**Quick summary:**
- New files: 5 core files
- Modified files: 2 critical files
- Documentation: 3 files

---

## ⏰ When to Upload

**Upload after:**
- ✅ All development phases complete
- ✅ Testing done locally
- ✅ Ready for production

**Estimated timeline:** 1-3 days from now

---

## 📝 Before Uploading

1. ✅ Review all modified files
2. ✅ Test locally first
3. ✅ Backup existing files on server
4. ✅ Check `.env` is NOT uploaded (contains secrets)

---

## 🔍 How to Find Modified Files

**On Windows (PowerShell):**
```powershell
# Find files modified in last 3 days
Get-ChildItem -Recurse -File | Where-Object {$_.LastWriteTime -gt (Get-Date).AddDays(-3)} | Select-Object FullName, LastWriteTime
```

**Or check git status (if using git):**
```bash
git status
git diff --name-only
```

---

**Last Updated:** 2025-01-27  
**Next Check:** Before upload

