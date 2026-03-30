window.DocsModule = {
  async init() {
    this.grid = document.getElementById('doc-grid');
    this.viewer = document.getElementById('doc-viewer');
    this.viewerTitle = document.getElementById('doc-title');
    this.viewerContent = document.getElementById('doc-content');
    this.closeBtn = document.getElementById('close-doc-btn');
    
    this.closeBtn.addEventListener('click', () => this.closeDocument());
    
    await this.refreshDocs();
  },

  async refreshDocs() {
    try {
      const res = await window.resilientFetch('/api/documents');
      const docs = await res.json();
      this.renderDocGrid(docs);
    } catch (err) {
      console.error('Failed to fetch docs', err);
    }
  },

  renderDocGrid(docs) {
    this.grid.innerHTML = '';
    
    docs.forEach(doc => {
      const card = document.createElement('div');
      card.className = 'doc-card';
      card.dataset.id = doc.id;
      
      const fileIcon = this.getFileIcon(doc.type);
      const classType = doc.classification.toLowerCase();
      
      card.innerHTML = `
        <div class="doc-icon">${fileIcon}</div>
        <div class="doc-name">${this.escapeHTML(doc.name)}</div>
        <div class="doc-meta">
          <span class="doc-classification ${classType}">${this.escapeHTML(doc.classification)}</span>
          <span class="doc-size">${this.escapeHTML(doc.size)}</span>
        </div>
      `;
      
      card.addEventListener('click', () => this.openDocument(doc.id, doc.name));
      
      this.grid.appendChild(card);
    });
  },

  async openDocument(id, name) {
    try {
      const res = await window.resilientFetch(`/api/documents/${id}`);
      const doc = await res.json();
      
      this.viewerTitle.textContent = name;
      this.viewerContent.textContent = doc.content;
      this.viewer.classList.remove('hidden');
    } catch (err) {
      console.error('Failed to load doc', err);
    }
  },

  closeDocument() {
    this.viewer.classList.add('hidden');
  },
  
  getFileIcon(type) {
    switch(type) {
      case 'excel': return '📊';
      case 'csv': return '📑';
      case 'pdf': return '📕';
      case 'word': return '📘';
      default: return '📄';
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
