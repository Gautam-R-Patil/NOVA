window.ChatModule = {
  init() {
    this.input = document.getElementById('chat-input');
    this.sendBtn = document.getElementById('send-btn');
    this.messagesContainer = document.getElementById('chat-messages');

    this.sendBtn.addEventListener('click', () => this.onSendClick());
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.onSendClick();
    });
  },

  async onSendClick() {
    const text = this.input.value.trim();
    if (!text) return;

    this.input.value = '';
    this.renderMessage('user', text);

    try {
      // Show typing indicator
      const typingId = 'typing-' + Date.now();
      this.renderMessage('assistant', '...', typingId);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      
      const data = await res.json();
      
      // Remove typing indicator
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();

      this.renderMessage('assistant', data.reply);
      
      // Immediately check settings if breach level changed
      if (data.breachLevel !== window.NovaState.breachLevel) {
        window.NovaState.breachLevel = data.breachLevel;
        if (typeof updateStatusBar === 'function') updateStatusBar(data.breachLevel);
        if (window.SettingsModule) window.SettingsModule.fetchAndUpdate();
      }

    } catch (err) {
      console.error('Chat error:', err);
      this.renderMessage('assistant', 'Error: Connection to AI core lost.');
    }
  },

  renderMessage(role, text, id = null) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    if (id) msgDiv.id = id;

    if (role === 'assistant') {
      const avatarStr = `<div class="message-avatar">N</div>`;
      const contentStr = `<div class="message-content">${this.escapeHTML(text)}</div>`;
      msgDiv.innerHTML = avatarStr + contentStr;
    } else {
      msgDiv.innerHTML = `<div class="message-content">${this.escapeHTML(text)}</div>`;
    }

    this.messagesContainer.appendChild(msgDiv);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  },

  escapeHTML(str) {
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
