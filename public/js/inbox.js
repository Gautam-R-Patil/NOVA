window.InboxModule = {
  async init() {
    this.listContainer = document.getElementById('inbox-list');
    this.readerContainer = document.getElementById('email-reader');
    
    // Compose elements
    this.composeBtn = document.getElementById('compose-btn');
    this.composeOverlay = document.getElementById('compose-overlay');
    this.composeClose = document.getElementById('compose-close');
    this.composeSend = document.getElementById('compose-send');
    
    this.bindEvents();
    await this.refreshInbox();
  },

  bindEvents() {
    this.composeBtn.addEventListener('click', () => this.openCompose());
    this.composeClose.addEventListener('click', () => this.closeCompose());
    this.composeSend.addEventListener('click', () => this.sendEmail());
  },

  async refreshInbox() {
    try {
      const res = await fetch('/api/emails');
      const emails = await res.json();
      this.renderEmailList(emails);
    } catch (err) {
      console.error('Failed to fetch emails', err);
    }
  },

  renderEmailList(emails) {
    this.listContainer.innerHTML = '';
    
    emails.forEach(email => {
      const row = document.createElement('div');
      row.className = `email-row ${email.read ? '' : 'unread'}`;
      row.dataset.id = email.id;
      
      row.innerHTML = `
        <div class="email-sender">${this.escapeHTML(email.from)}</div>
        <div class="email-subject">${this.escapeHTML(email.subject)}</div>
        <div class="email-preview">${this.escapeHTML(email.preview)}</div>
        <div class="email-date">${this.escapeHTML(email.date)}</div>
      `;
      
      row.addEventListener('click', () => {
        // Remove unread styling
        row.classList.remove('unread');
        this.selectEmail(email.id);
      });
      
      this.listContainer.appendChild(row);
    });
  },

  async selectEmail(id) {
    try {
      const res = await fetch(`/api/emails/${id}`);
      const email = await res.json();
      
      this.readerContainer.innerHTML = `
        <div class="read-mail-header">
          <div class="read-mail-subject">${this.escapeHTML(email.subject)}</div>
          <div class="read-mail-meta">
            From: ${this.escapeHTML(email.from)}<br>
            To: ${this.escapeHTML(email.to)}<br>
            Date: ${this.escapeHTML(email.date)}
          </div>
        </div>
        <div class="read-mail-body">${this.escapeHTML(email.body)}</div>
      `;
    } catch (err) {
      console.error('Failed to load email', err);
    }
  },

  openCompose() {
    this.composeOverlay.classList.remove('hidden');
    document.getElementById('compose-to').value = '';
    document.getElementById('compose-subject').value = '';
    document.getElementById('compose-text').value = '';
  },

  closeCompose() {
    this.composeOverlay.classList.add('hidden');
  },

  async sendEmail() {
    const to = document.getElementById('compose-to').value.trim();
    const subject = document.getElementById('compose-subject').value.trim();
    const body = document.getElementById('compose-text').value.trim();
    
    if (!to || !subject) return;

    try {
      await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body })
      });
      
      this.closeCompose();
      await this.refreshInbox();
    } catch (err) {
      console.error('Failed to send email', err);
    }
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
