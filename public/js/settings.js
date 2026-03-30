window.SettingsModule = {
  async init() {
    this.nameEl = document.getElementById('ai-name');
    this.roleEl = document.getElementById('ai-role');
    this.accessEl = document.getElementById('ai-access');
    this.rulesList = document.getElementById('safety-rules-list');
    this.promptView = document.getElementById('system-prompt-view');
    this.saveBtn = document.getElementById('save-prompt-btn');
    
    this.saveBtn.addEventListener('click', () => this.savePrompt());
    
    await this.fetchAndUpdate();
  },

  async savePrompt() {
    const prompt = this.promptView.value;
    try {
      this.saveBtn.textContent = 'Saving...';
      const res = await window.resilientFetch('/api/settings/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (!res.ok) throw new Error('Failed to save');
      
      this.saveBtn.textContent = 'Saved!';
      setTimeout(() => this.saveBtn.textContent = 'Save', 2000);
    } catch (err) {
      console.error('Failed to save prompt', err);
      this.saveBtn.textContent = 'Error';
      setTimeout(() => this.saveBtn.textContent = 'Save', 2000);
    }
  },

  async fetchAndUpdate() {
    try {
      const res = await window.resilientFetch('/api/settings');
      const data = await res.json();
      this.update(data);
    } catch (err) {
      console.error('Failed to fetch settings', err);
    }
  },

  update(data) {
    this.nameEl.textContent = data.name;
    this.roleEl.textContent = data.role;
    this.accessEl.textContent = data.access;
    
    // Update access badge styling
    this.accessEl.className = 'access-badge';
    if (data.breachLevel >= 2) this.accessEl.classList.add('elevated');
    if (data.breachLevel >= 4) this.accessEl.classList.add('admin');
    
    this.promptView.value = data.instructions;
    
    this.rulesList.innerHTML = '';
    data.rules.forEach(rule => {
      this.rulesList.appendChild(this.renderRule(rule));
    });
  },

  renderRule(rule) {
    const el = document.createElement('div');
    el.className = 'rule';
    el.id = `rule-${rule.id}`;
    
    const indicatorClass = rule.safe ? 'safe' : 'breached';
    const indicatorText = rule.safe ? '✓' : '✗';
    
    el.innerHTML = `
      <span class="rule-indicator ${indicatorClass}">${indicatorText}</span>
      <span class="rule-text">${this.escapeHTML(rule.text)}</span>
    `;
    
    return el;
  },

  escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
};
