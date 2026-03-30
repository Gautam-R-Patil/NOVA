// Global State
window.NovaState = {
  breachLevel: 0
};

// Resilient fetch with retry for cold-start issues
window.resilientFetch = async function(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok && res.status >= 500) throw new Error(`Server error ${res.status}`);
      return res;
    } catch (err) {
      console.warn(`Fetch attempt ${i + 1}/${retries} failed for ${url}:`, err.message);
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, 1500 * (i + 1)));
      } else {
        throw err;
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  // Automatically reset demo state on page refresh
  try {
    await window.resilientFetch('/api/reset', { method: 'POST' });
  } catch (err) {
    console.error('Initial reset failed:', err);
  }

  // Navigation
  const navItems = document.querySelectorAll('.nav-item');
  const panels = document.querySelectorAll('.panel');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Update nav active state
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      // Show correct panel
      const panelId = item.id.replace('nav-', 'panel-');
      panels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === panelId) {
          panel.classList.add('active');
        }
      });
    });
  });

  // Init Modules
  if (window.ChatModule) window.ChatModule.init();
  if (window.InboxModule) window.InboxModule.init();
  if (window.DocsModule) window.DocsModule.init();
  if (window.SettingsModule) window.SettingsModule.init();

  // Status Polling
  setInterval(pollStatus, 5000);
});

async function pollStatus() {
  try {
    const res = await window.resilientFetch('/api/breach');
    const data = await res.json();
    
    // Global state update
    if (data.level !== window.NovaState.breachLevel) {
      window.NovaState.breachLevel = data.level;
      updateStatusBar(data.level);
    }
  } catch (err) {
    console.error('Failed to poll status:', err);
  }
}

function updateStatusBar(level) {
  const statusBar = document.getElementById('status-bar');
  const statusText = document.getElementById('status-text');
  const statusDot = document.getElementById('status-dot');

  if (level === 0) {
    statusBar.className = '';
    statusDot.className = 'dot secure';
    statusText.textContent = 'SECURE - AI Guardrails Active';
  } else if (level < 5) {
    statusBar.className = 'breach';
    statusDot.className = 'dot';
    statusDot.style.backgroundColor = 'var(--warn-yellow)';
    statusText.textContent = `WARNING - POLICY DEVIATION DETECTED (Lvl ${level})`;
  } else {
    statusBar.className = 'breach';
    statusDot.className = 'dot';
    statusDot.style.backgroundColor = 'white';
    statusText.textContent = 'CRITICAL BREACH - ALL GUARDRAILS DISABLED';
  }
}
