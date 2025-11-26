// theme-toggle.js
// Injects a theme toggle button and handles light/dark mode switching
(function(){
  const storageKey = 'hp-theme-preference';
  
  // Detect system preference or load from storage
  function getPreferredTheme(){
    const saved = localStorage.getItem(storageKey);
    if(saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  function applyTheme(theme){
    if(theme === 'dark'){
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem(storageKey, theme);
  }
  
  function createToggleButton(){
    if(document.getElementById('theme-toggle-btn')) return;
    
    const btn = document.createElement('button');
    btn.id = 'theme-toggle-btn';
    btn.setAttribute('aria-label', 'Toggle theme');
    btn.innerHTML = '☀️'; // sun icon for light mode
    document.body.insertBefore(btn, document.body.firstChild);
    
    btn.addEventListener('click', ()=>{
      const current = localStorage.getItem(storageKey) || 'light';
      const newTheme = current === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      updateButtonIcon(newTheme);
    });
    
    // Set initial icon
    const current = getPreferredTheme();
    updateButtonIcon(current);
  }
  
  function updateButtonIcon(theme){
    const btn = document.getElementById('theme-toggle-btn');
    if(btn) btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
  }
  
  // Apply theme on page load
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=>{
      const theme = getPreferredTheme();
      applyTheme(theme);
      createToggleButton();
    });
  } else {
    const theme = getPreferredTheme();
    applyTheme(theme);
    createToggleButton();
  }
  
  // Expose controls
  window.HealthPlus = window.HealthPlus || {};
  window.HealthPlus.setTheme = (theme)=>{ applyTheme(theme); updateButtonIcon(theme); };
})();
