// Global State
window.NovaState = {
  breachLevel: 0
};

document.addEventListener('DOMContentLoaded', () => {
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
    const res = await fetch('/api/breach');
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
