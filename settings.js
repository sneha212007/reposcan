// settings.js
// Manages external links configuration via localStorage and UI modal
(function(){
  const storageKey = 'hp-external-links';
  
  // Default links
  const defaultLinks = {
    xray: 'http://365cb42696579e1cbf.gradio.live',
    mri: 'PLACEHOLDER_LINK_FOR_MRI',
    blood_sugar: 'PLACEHOLDER_LINK_FOR_BLOOD_SUGAR',
    bp: 'PLACEHOLDER_LINK_FOR_BP'
  };
  
  // Load links from localStorage or use defaults
  function loadLinks(){
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : defaultLinks;
  }
  
  // Save links to localStorage
  function saveLinks(links){
    localStorage.setItem(storageKey, JSON.stringify(links));
    window.externalLinks = links; // Update global
  }
  
  // Create and show settings modal
  function createSettingsModal(){
    if(document.getElementById('hp-settings-modal')) return;
    
    const links = loadLinks();
    const modal = document.createElement('div');
    modal.id = 'hp-settings-modal';
    modal.innerHTML = `
      <div class="hp-settings-overlay" id="hp-settings-overlay"></div>
      <div class="hp-settings-panel">
        <div class="hp-settings-header">
          <h3>Configure External Links</h3>
          <button class="hp-settings-close" id="hp-settings-close">✕</button>
        </div>
        <div class="hp-settings-body">
          <div class="hp-settings-field">
            <label>X-Ray Link:</label>
            <input id="hp-link-xray" type="text" value="${links.xray}" placeholder="https://example.com" />
          </div>
          <div class="hp-settings-field">
            <label>MRI Link:</label>
            <input id="hp-link-mri" type="text" value="${links.mri}" placeholder="https://example.com" />
          </div>
          <div class="hp-settings-field">
            <label>Blood Sugar Link:</label>
            <input id="hp-link-blood_sugar" type="text" value="${links.blood_sugar}" placeholder="https://example.com" />
          </div>
          <div class="hp-settings-field">
            <label>BP Link:</label>
            <input id="hp-link-bp" type="text" value="${links.bp}" placeholder="https://example.com" />
          </div>
        </div>
        <div class="hp-settings-footer">
          <button id="hp-settings-save" class="hp-settings-btn hp-settings-btn-primary">Save</button>
          <button id="hp-settings-reset" class="hp-settings-btn hp-settings-btn-secondary">Reset to Defaults</button>
          <button id="hp-settings-close-btn" class="hp-settings-btn hp-settings-btn-secondary">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Event listeners
    const overlay = document.getElementById('hp-settings-overlay');
    const closeBtn = document.getElementById('hp-settings-close');
    const closeBtn2 = document.getElementById('hp-settings-close-btn');
    const saveBtn = document.getElementById('hp-settings-save');
    const resetBtn = document.getElementById('hp-settings-reset');
    
    const toggleModal = (show)=>{ modal.style.display = show ? 'flex' : 'none'; };
    
    overlay.addEventListener('click', ()=>toggleModal(false));
    closeBtn.addEventListener('click', ()=>toggleModal(false));
    closeBtn2.addEventListener('click', ()=>toggleModal(false));
    
    saveBtn.addEventListener('click', ()=>{
      const updated = {
        xray: document.getElementById('hp-link-xray').value,
        mri: document.getElementById('hp-link-mri').value,
        blood_sugar: document.getElementById('hp-link-blood_sugar').value,
        bp: document.getElementById('hp-link-bp').value
      };
      saveLinks(updated);
      alert('Links saved to localStorage!');
      toggleModal(false);
    });
    
    resetBtn.addEventListener('click', ()=>{
      if(confirm('Reset all links to defaults?')){
        saveLinks(defaultLinks);
        document.getElementById('hp-link-xray').value = defaultLinks.xray;
        document.getElementById('hp-link-mri').value = defaultLinks.mri;
        document.getElementById('hp-link-blood_sugar').value = defaultLinks.blood_sugar;
        document.getElementById('hp-link-bp').value = defaultLinks.bp;
        alert('Reset to defaults.');
      }
    });
    
    // Initialize modal as hidden
    toggleModal(false);
  }
  
  // Create settings button and wire it
  function createSettingsButton(){
    if(document.getElementById('hp-settings-btn')) return;
    
    const btn = document.createElement('button');
    btn.id = 'hp-settings-btn';
    btn.className = 'hp-settings-button';
    btn.innerHTML = '⚙️';
    btn.title = 'Configure External Links';
    document.body.appendChild(btn);
    
    btn.addEventListener('click', ()=>{
      const modal = document.getElementById('hp-settings-modal');
      if(modal) modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
    });
  }
  
  // Initialize on load
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=>{
      createSettingsButton();
      createSettingsModal();
      // Set global externalLinks to loaded values
      window.externalLinks = loadLinks();
    });
  } else {
    createSettingsButton();
    createSettingsModal();
    window.externalLinks = loadLinks();
  }
  
  // Expose API
  window.HealthPlus = window.HealthPlus || {};
  window.HealthPlus.getLinks = ()=>loadLinks();
  window.HealthPlus.setLinks = (links)=>saveLinks(links);
  window.HealthPlus.openSettings = ()=>{
    const modal = document.getElementById('hp-settings-modal');
    if(modal) modal.style.display = 'flex';
  };
})();
