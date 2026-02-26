# Traffic Seeder - Warm-up Traffic Only

⚠️ **IMPORTANT: This is TEMPORARY warm-up traffic only**

## Purpose

This system provides **gentle, natural warm-up traffic** to help:
- Google discover the site
- Improve crawl frequency
- Give the site a sense of life during initial launch

## ⚠️ Rules

1. **TEMPORARY ONLY** - Use only during first 30 days
2. **NO VISIBLE INDICATORS** - Never show visitor counts to real users
3. **NATURAL BEHAVIOR** - Simulates real user patterns
4. **CONSERVATIVE** - Very low traffic (5-15 visits/day)
5. **AUTO-DISABLE** - Stops after 30 days automatically

## Configuration

### Environment Variables

```bash
# Enable/Disable
TRAFFIC_SEEDER_ENABLED=true

# Site URL
SITE_URL=https://halfmovies.com
```

### Settings (in trafficSeeder.js)

```javascript
MIN_VISITS_PER_DAY: 5      // Minimum visits per day
MAX_VISITS_PER_DAY: 15     // Maximum visits per day
MIN_INTERVAL_MINUTES: 45   // Minimum time between visits
MAX_INTERVAL_MINUTES: 180  // Maximum time between visits
MAX_DAYS: 30               // Auto-disable after 30 days
```

## How It Works

1. **Natural User-Agents** - Uses real browser user agents
2. **Distributed Timing** - Visits spread throughout the day
3. **Natural Behavior**:
   - Visit homepage
   - Navigate to random movie
   - Stay 45-120 seconds (reading/watching)
   - Natural exit
4. **No Bounce** - Always completes full session
5. **No Pressure** - Very low frequency

## Usage

### Start

```bash
# Set environment variable
export TRAFFIC_SEEDER_ENABLED=true

# Or in .env file
TRAFFIC_SEEDER_ENABLED=true

# Start server (seeder starts automatically)
node server.js
```

### Check Status

```bash
curl http://localhost:4000/api/traffic-seeder/status
```

### Disable

```bash
# Method 1: Environment variable
export TRAFFIC_SEEDER_ENABLED=false

# Method 2: API
curl -X POST http://localhost:4000/api/traffic-seeder/toggle

# Method 3: Edit state file
# Set "enabled": false in .traffic-seeder-state.json
```

## State File

`.traffic-seeder-state.json` tracks:
- Start date
- Total visits
- Last visit time
- Enabled status

**DO NOT** commit this file to git (already in .gitignore).

## After 30 Days

The system will:
1. Auto-disable after MAX_DAYS
2. Log a message
3. Stop all traffic generation

**Then rely on:**
- SEO
- Content quality
- Internal search
- Organic growth

## Security

- ✅ No fake numbers shown to users
- ✅ No "X users online" indicators
- ✅ No misleading metrics
- ✅ Only helps with discovery
- ✅ Natural patterns only

## Monitoring

Check logs for:
```
[Traffic Seeder] Visit #X completed successfully
[Traffic Seeder] Next visit in X minutes
[Traffic Seeder] Auto-disabled after 30 days
```

## ⚠️ Important Notes

1. **This is NOT for fake traffic** - It's warm-up only
2. **Use temporarily** - Only during initial launch
3. **HalfMovies style** - Light, quiet, natural
4. **No deception** - Never show metrics to real users
5. **Auto-stop** - System disables itself after 30 days

## Questions?

This system is designed to be:
- **Safe** - Natural patterns only
- **Temporary** - Auto-disables
- **Light** - Very low frequency
- **Helpful** - Aids discovery, not deception

