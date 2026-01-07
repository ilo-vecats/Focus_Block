let blockedSites = [];
let jwtToken = null;
let ruleIdCounter = 1;

// Helper function to check if a site should be blocked based on schedule
function shouldBlockSite(site) {
  if (!site.isActive) return false;
  
  if (!site.schedule || !site.schedule.enabled) return true;
  
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  // Check if today is in the schedule
  if (!site.schedule.days || !site.schedule.days.includes(currentDay)) {
    return false;
  }
  
  // Check if current time is within schedule
  if (site.schedule.startTime && site.schedule.endTime) {
    return currentTime >= site.schedule.startTime && currentTime <= site.schedule.endTime;
  }
  
  return true;
}

// Function to normalize URL for blocking
function normalizeUrl(url) {
  // Remove protocol and www
  let normalized = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  // Remove trailing slash
  normalized = normalized.replace(/\/$/, '');
  return normalized;
}

// Function to create blocking rules
function updateBlockingRules() {
  // Clear all existing rules
  chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
    const ruleIdsToRemove = existingRules.map(r => r.id);
    
    // Only create rules for sites that should be blocked
    const activeSites = blockedSites.filter(shouldBlockSite);
    const rules = activeSites.map((site, i) => {
      const normalizedUrl = normalizeUrl(site.url);
      return {
        id: ruleIdCounter++,
        priority: 1,
        action: { 
          type: "block" 
        },
        condition: { 
          urlFilter: `*://${normalizedUrl}/*`,
          resourceTypes: ["main_frame", "sub_frame"]
        }
      };
    });

    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: ruleIdsToRemove,
      addRules: rules
    }, () => {
      console.log(`Updated blocking rules: ${rules.length} sites blocked`);
    });
  });
}

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SET_TOKEN') {
    jwtToken = message.token;
    chrome.storage.local.set({ token: jwtToken });
    fetchBlockedSites();
    sendResponse({ status: 'Token received' });
  } else if (message.type === 'GET_BLOCKED_SITES') {
    sendResponse({ sites: blockedSites });
  } else if (message.type === 'REFRESH_BLOCKED') {
    fetchBlockedSites();
    sendResponse({ status: 'Refreshing' });
  }
  return true; // Keep channel open for async response
});

// Fetch blocked sites from backend
async function fetchBlockedSites() {
  // Try to get token from storage if not set
  if (!jwtToken) {
    chrome.storage.local.get(['token'], (result) => {
      if (result.token) {
        jwtToken = result.token;
        fetchBlockedSites();
      }
    });
    return;
  }

  try {
    const res = await fetch('http://localhost:5050/api/blocked', {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    
    if (res.ok) {
      blockedSites = await res.json();
      updateBlockingRules();
      console.log('Blocked sites updated:', blockedSites.length);
    } else {
      console.error('Failed to fetch blocked sites:', res.status);
    }
  } catch (err) {
    console.error('Error fetching blocked sites:', err);
  }
}

// Track blocked attempts
async function trackBlockedAttempt(url) {
  if (!jwtToken) return;
  
  try {
    await fetch('http://localhost:5050/api/stats/blocked', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}` 
      },
      body: JSON.stringify({ url })
    });
  } catch (err) {
    console.error('Error tracking blocked attempt:', err);
  }
}

// Listen for navigation attempts to blocked sites
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId === 0) { // Main frame only
    const url = normalizeUrl(details.url);
    const isBlocked = blockedSites.some(site => {
      const siteUrl = normalizeUrl(site.url);
      return url.includes(siteUrl) || siteUrl.includes(url);
    });
    
    if (isBlocked) {
      trackBlockedAttempt(url);
    }
  }
});

// Refresh blocked sites every 5 minutes and check schedule
setInterval(() => {
  fetchBlockedSites();
  updateBlockingRules(); // Re-evaluate schedule
}, 5 * 60 * 1000);

// Check schedule every minute
setInterval(() => {
  updateBlockingRules();
}, 60 * 1000);

// Load token and fetch sites on startup
chrome.storage.local.get(['token'], (result) => {
  if (result.token) {
    jwtToken = result.token;
    fetchBlockedSites();
  }
});