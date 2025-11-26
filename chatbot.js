// chatbot.js
// Simple client-side chatbot widget with optional OpenAI support.
(function(){
  const cfg = {
    provider: 'local', // 'local' or 'openai'
    openaiKey: null, // set via `window.HealthPlus.setChatConfig`
    model: 'gpt-4o-mini'
  };

  function createWidget(){
    if(document.getElementById('hp-chat-widget')) return;
    const container = document.createElement('div'); container.id = 'hp-chat-widget';
    container.innerHTML = `
      <div class="hp-chat-button" id="hpChatToggle">💬</div>
      <div class="hp-chat-window" id="hpChatWindow" style="display:none">
        <div class="hp-chat-header">
          <div class="hp-chat-title">Health Assistant</div>
          <button class="hp-chat-close" id="hpChatClose">✕</button>
        </div>
        <div class="hp-chat-body" id="hpChatBody" role="log" aria-live="polite"></div>
        <div class="hp-chat-input-row">
          <input class="hp-chat-input" id="hpChatInput" placeholder="Ask about symptoms, tests, or health tips..." />
          <button class="hp-send-btn" id="hpChatSend">Send</button>
        </div>
      </div>
    `;
    document.body.appendChild(container);

    const toggle = document.getElementById('hpChatToggle');
    const win = document.getElementById('hpChatWindow');
    const closeBtn = document.getElementById('hpChatClose');
    const sendBtn = document.getElementById('hpChatSend');
    const input = document.getElementById('hpChatInput');
    const body = document.getElementById('hpChatBody');

    toggle.addEventListener('click', ()=>{ win.style.display = 'flex'; toggle.style.display='none'; input.focus(); addBotMessage('Hi! I can help with basic health info. (Demo only)'); });
    closeBtn.addEventListener('click', ()=>{ win.style.display='none'; toggle.style.display='flex'; });
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') sendMessage(); });

    function addMessage(text, who='bot'){
      const el = document.createElement('div'); el.className = 'hp-msg ' + (who==='user' ? 'user' : 'bot'); el.textContent = text; body.appendChild(el); body.scrollTop = body.scrollHeight;
    }

    function addBotMessage(text){ addMessage(text,'bot'); }

    function sendMessage(){
      const val = input.value && input.value.trim(); if(!val) return;
      addMessage(val,'user'); input.value=''; addBotMessage('Thinking...');
      // Call configured provider
      if(cfg.provider === 'openai' && cfg.openaiKey){
        callOpenAI(val).then(res=>{
          // remove last "Thinking..." then append
          const last = body.querySelectorAll('.hp-msg.bot'); if(last.length) last[last.length-1].remove();
          addBotMessage(res || 'Sorry, I could not find an answer.');
        }).catch(err=>{
          const last = body.querySelectorAll('.hp-msg.bot'); if(last.length) last[last.length-1].remove();
          addBotMessage('Error contacting API. See console for details.');
          console.error(err);
        });
      } else {
        // Local/canned responses for demo
        setTimeout(()=>{
          const last = body.querySelectorAll('.hp-msg.bot'); if(last.length) last[last.length-1].remove();
          addBotMessage(generateLocalReply(val));
        }, 700);
      }
    }

    function generateLocalReply(text){
      const t = text.toLowerCase();
      if(t.includes('blood') || t.includes('glucose') || t.includes('sugar')) return 'For blood sugar: fasting < 100 mg/dL is common; share exact values for tailored advice.';
      if(t.includes('xray') || t.includes('mri')) return 'Imaging interpretation should be done by a radiologist. I can help explain terms if you paste the report text.';
      if(t.includes('fever') || t.includes('temperature')) return 'A fever may indicate infection; if >39°C or persistent, seek medical attention.';
      return 'I can provide general info and clarify reports. For specific diagnoses or treatment, consult a clinician.';
    }

    async function callOpenAI(prompt){
      // NOTE: calling OpenAI from client-side will expose your API key to users. Prefer calling from a server.
      const payload = {model: cfg.model, messages:[{role:'user', content:prompt}]};
      const res = await fetch('https://api.openai.com/v1/chat/completions',{
        method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+cfg.openaiKey},body:JSON.stringify(payload)
      });
      if(!res.ok) throw new Error('OpenAI error: '+res.status);
      const data = await res.json();
      const msg = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      return msg || '';
    }

    // expose some controls
    window.HealthPlus = window.HealthPlus || {};
    window.HealthPlus.setChatConfig = (opts)=>{ Object.assign(cfg, opts); };
    window.HealthPlus.clearChat = ()=>{ body.innerHTML=''; };
  }

  // create on DOM ready
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createWidget); else createWidget();

})();
