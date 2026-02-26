/**
 * HalfMovies Traffic Seeder - Warm-up Traffic Only
 * 
 * ⚠️ IMPORTANT: This is TEMPORARY warm-up traffic only
 * Use only during initial launch phase
 * After that, rely on SEO, content, and organic growth
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== Configuration =====
const CONFIG = {
  // Site URL
  SITE_URL: process.env.SITE_URL || 'https://halfmovies.com',
  
  // Traffic settings (VERY CONSERVATIVE)
  MIN_VISITS_PER_DAY: 5,      // Minimum visits per day
  MAX_VISITS_PER_DAY: 15,      // Maximum visits per day
  MIN_INTERVAL_MINUTES: 45,    // Minimum time between visits (minutes)
  MAX_INTERVAL_MINUTES: 180,   // Maximum time between visits (minutes)
  
  // Session behavior
  MIN_PAGE_VIEW_TIME: 30,      // Minimum seconds on page
  MAX_PAGE_VIEW_TIME: 90,      // Maximum seconds on page
  MIN_MOVIE_VIEW_TIME: 45,     // Minimum seconds on movie page
  MAX_MOVIE_VIEW_TIME: 120,    // Maximum seconds on movie page
  
  // Enable/Disable (set to false to stop)
  ENABLED: process.env.TRAFFIC_SEEDER_ENABLED === 'true',
  
  // Duration (days) - auto-disable after this
  MAX_DAYS: 30,  // Stop after 30 days automatically
};

// ===== Natural User-Agents (Real browsers) =====
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
];

// ===== State file =====
const STATE_FILE = path.join(__dirname, '.traffic-seeder-state.json');

function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    return {
      startDate: new Date().toISOString(),
      totalVisits: 0,
      lastVisit: null,
      enabled: CONFIG.ENABLED,
    };
  }
  try {
    const data = fs.readFileSync(STATE_FILE, 'utf8');
    const state = JSON.parse(data);
    
    // Check if max days exceeded
    const startDate = new Date(state.startDate);
    const daysSinceStart = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceStart > CONFIG.MAX_DAYS) {
      state.enabled = false;
      console.log(`[Traffic Seeder] Auto-disabled after ${CONFIG.MAX_DAYS} days`);
    }
    
    return state;
  } catch (error) {
    console.error('[Traffic Seeder] Error loading state:', error);
    return {
      startDate: new Date().toISOString(),
      totalVisits: 0,
      lastVisit: null,
      enabled: CONFIG.ENABLED,
    };
  }
}

function saveState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (error) {
    console.error('[Traffic Seeder] Error saving state:', error);
  }
}

// ===== Load movies for random selection =====
function loadMovies() {
  const moviesPath = path.join(__dirname, 'movies.json');
  if (!fs.existsSync(moviesPath)) return [];
  
  try {
    const data = fs.readFileSync(moviesPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('[Traffic Seeder] Error loading movies:', error);
    return [];
  }
}

// ===== Random delay helper =====
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ===== Simulate natural visit =====
async function simulateVisit(movies) {
  if (!CONFIG.ENABLED) {
    console.log('[Traffic Seeder] Disabled in config');
    return;
  }

  const state = loadState();
  if (!state.enabled) {
    console.log('[Traffic Seeder] Disabled in state file');
    return;
  }

  // Check if we should visit today
  const today = new Date().toDateString();
  const lastVisitDate = state.lastVisit ? new Date(state.lastVisit).toDateString() : null;
  
  if (lastVisitDate === today) {
    // Already visited today, check interval
    const lastVisitTime = new Date(state.lastVisit).getTime();
    const timeSinceLastVisit = (Date.now() - lastVisitTime) / (1000 * 60); // minutes
    const minInterval = CONFIG.MIN_INTERVAL_MINUTES;
    
    if (timeSinceLastVisit < minInterval) {
      const waitMinutes = minInterval - timeSinceLastVisit;
      console.log(`[Traffic Seeder] Waiting ${Math.ceil(waitMinutes)} more minutes before next visit`);
      return;
    }
  }

  // Select random user agent
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  
  // Select random movie
  const randomMovie = movies[Math.floor(Math.random() * movies.length)];
  const movieUrl = `${CONFIG.SITE_URL}/movie.html?id=${randomMovie.id}`;

  try {
    console.log(`[Traffic Seeder] Simulating visit...`);
    
    // Step 1: Visit homepage (natural entry)
    await axios.get(CONFIG.SITE_URL, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 10000,
    });
    
    // Natural delay before next action (2-8 seconds)
    await new Promise(resolve => setTimeout(resolve, randomDelay(2000, 8000)));
    
    // Step 2: Visit movie page (natural navigation)
    await axios.get(movieUrl, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': CONFIG.SITE_URL, // Natural referrer
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 10000,
    });
    
    // Step 3: Simulate reading/watching (natural engagement)
    const viewTime = randomDelay(CONFIG.MIN_MOVIE_VIEW_TIME * 1000, CONFIG.MAX_MOVIE_VIEW_TIME * 1000);
    console.log(`[Traffic Seeder] Simulating ${Math.floor(viewTime / 1000)}s engagement...`);
    await new Promise(resolve => setTimeout(resolve, viewTime));
    
    // Update state
    state.totalVisits++;
    state.lastVisit = new Date().toISOString();
    saveState(state);
    
    console.log(`[Traffic Seeder] Visit #${state.totalVisits} completed successfully`);
    
  } catch (error) {
    console.error('[Traffic Seeder] Error during visit:', error.message);
    // Don't update state on error - try again later
  }
}

// ===== Main scheduler =====
async function startScheduler() {
  if (!CONFIG.ENABLED) {
    console.log('[Traffic Seeder] Not enabled. Set TRAFFIC_SEEDER_ENABLED=true to enable.');
    return;
  }

  const state = loadState();
  if (!state.enabled) {
    console.log('[Traffic Seeder] Disabled in state. Check .traffic-seeder-state.json');
    return;
  }

  console.log('[Traffic Seeder] Starting warm-up traffic seeder...');
  console.log(`[Traffic Seeder] Target: ${CONFIG.MIN_VISITS_PER_DAY}-${CONFIG.MAX_VISITS_PER_DAY} visits/day`);
  console.log(`[Traffic Seeder] Interval: ${CONFIG.MIN_INTERVAL_MINUTES}-${CONFIG.MAX_INTERVAL_MINUTES} minutes`);
  console.log(`[Traffic Seeder] Max duration: ${CONFIG.MAX_DAYS} days`);
  console.log(`[Traffic Seeder] ⚠️  This is TEMPORARY warm-up only`);

  const movies = loadMovies();
  if (movies.length === 0) {
    console.error('[Traffic Seeder] No movies found. Cannot seed traffic.');
    return;
  }

  // Calculate visits per day
  const visitsPerDay = randomDelay(CONFIG.MIN_VISITS_PER_DAY, CONFIG.MAX_VISITS_PER_DAY);
  const minutesPerDay = 24 * 60;
  const avgInterval = minutesPerDay / visitsPerDay;

  console.log(`[Traffic Seeder] Planning ${visitsPerDay} visits today`);

  // Schedule visits
  let visitCount = 0;
  
  async function scheduleNextVisit() {
    const state = loadState();
    if (!state.enabled) {
      console.log('[Traffic Seeder] Stopped (disabled in state)');
      return;
    }

    // Random interval (but respect min/max)
    const interval = randomDelay(
      Math.max(CONFIG.MIN_INTERVAL_MINUTES, avgInterval * 0.7),
      Math.min(CONFIG.MAX_INTERVAL_MINUTES, avgInterval * 1.5)
    );

    console.log(`[Traffic Seeder] Next visit in ${interval} minutes`);

    setTimeout(async () => {
      await simulateVisit(movies);
      visitCount++;
      
      // Schedule next visit if we haven't reached daily limit
      if (visitCount < visitsPerDay) {
        scheduleNextVisit();
      } else {
        // Reset for next day
        visitCount = 0;
        const nextDayDelay = (24 * 60 * 60 * 1000) - (Date.now() % (24 * 60 * 60 * 1000));
        console.log(`[Traffic Seeder] Daily limit reached. Next day starts in ${Math.floor(nextDayDelay / 60000)} minutes`);
        setTimeout(() => {
          visitCount = 0;
          scheduleNextVisit();
        }, nextDayDelay);
      }
    }, interval * 60 * 1000);
  }

  // Start first visit after initial delay
  const initialDelay = randomDelay(5, 15); // 5-15 minutes
  console.log(`[Traffic Seeder] First visit in ${initialDelay} minutes`);
  setTimeout(() => {
    simulateVisit(movies);
    visitCount++;
    scheduleNextVisit();
  }, initialDelay * 60 * 1000);
}

// ===== API Endpoints (for control) =====
export function setupTrafficSeederAPI(app) {
  // Get status
  app.get('/api/traffic-seeder/status', (req, res) => {
    const state = loadState();
    res.json({
      enabled: state.enabled && CONFIG.ENABLED,
      totalVisits: state.totalVisits,
      lastVisit: state.lastVisit,
      startDate: state.startDate,
      config: {
        minVisitsPerDay: CONFIG.MIN_VISITS_PER_DAY,
        maxVisitsPerDay: CONFIG.MAX_VISITS_PER_DAY,
        maxDays: CONFIG.MAX_DAYS,
      }
    });
  });

  // Enable/Disable
  app.post('/api/traffic-seeder/toggle', (req, res) => {
    const state = loadState();
    state.enabled = !state.enabled;
    saveState(state);
    res.json({
      enabled: state.enabled,
      message: state.enabled ? 'Traffic seeder enabled' : 'Traffic seeder disabled'
    });
  });

  // Reset (for testing)
  app.post('/api/traffic-seeder/reset', (req, res) => {
    const newState = {
      startDate: new Date().toISOString(),
      totalVisits: 0,
      lastVisit: null,
      enabled: true,
    };
    saveState(newState);
    res.json({ message: 'State reset', state: newState });
  });
}

// ===== Auto-start if run directly =====
if (import.meta.url === `file://${process.argv[1]}`) {
  startScheduler().catch(console.error);
}

export { startScheduler, loadState, saveState };

