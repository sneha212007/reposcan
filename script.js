/*
  script.js
  - Contains navigation wiring, placeholder AI-callers, and link placeholders.
  - Replace the PLACEHOLDER_LINK values in `externalLinks` with the exact URLs you want each card/button to open.
*/

const externalLinks = {
  xray: 'http://365cb42696579e1cbf.gradio.live',
  mri: 'PLACEHOLDER_LINK_FOR_MRI',
  blood_sugar: 'PLACEHOLDER_LINK_FOR_BLOOD_SUGAR',
  bp: 'PLACEHOLDER_LINK_FOR_BP'
};

// Utility: open a link in a new tab if present, otherwise alert
function openExternal(key){
  const url = externalLinks[key];
  if(url && url !== '' && !url.startsWith('PLACEHOLDER')){
    window.open(url, '_blank');
  } else {
    alert('No external link set for ' + key + '. Provide it in script.js => externalLinks.');
  }
}

// Dashboard card clicks (index.html)
document.addEventListener('DOMContentLoaded', ()=>{
  // If on index.html: wire cards
  document.querySelectorAll('.card[data-target]').forEach(card=>{
    card.style.cursor='pointer';
    card.addEventListener('click', ()=>{
      const target = card.getAttribute('data-target');
      // Navigate to internal page
      if(target === 'xray') location.href='xray.html';
      else if(target === 'mri') location.href='mri.html';
      else if(target === 'blood_sugar') location.href='blood_sugar.html';
      else if(target === 'blood_report') location.href='blood_report.html';
    });
  });

  // Wire open link buttons on feature pages
  const openX = document.getElementById('openXrayLink'); if(openX) openX.addEventListener('click', ()=>openExternal('xray'));
  const openM = document.getElementById('openMriLink'); if(openM) openM.addEventListener('click', ()=>openExternal('mri'));
  const openS = document.getElementById('openSugarLink'); if(openS) openS.addEventListener('click', ()=>openExternal('blood_sugar'));
  const openB = document.getElementById('openBpLink'); if(openB) openB.addEventListener('click', ()=>openExternal('bp'));

  // Analyze buttons: these are placeholders to show integration points
  const analyzeX = document.getElementById('analyzeXray'); if(analyzeX) analyzeX.addEventListener('click', fakeAnalyzeXray);
  const analyzeM = document.getElementById('analyzeMri'); if(analyzeM) analyzeM.addEventListener('click', fakeAnalyzeMri);
  const analyzeS = document.getElementById('analyzeSugar'); if(analyzeS) analyzeS.addEventListener('click', fakeAnalyzeSugar);
  const analyzeB = document.getElementById('analyzeBp'); if(analyzeB) analyzeB.addEventListener('click', fakeAnalyzeBp);

  // Save / Upload simple handlers
  const saveSugar = document.getElementById('saveSugar'); if(saveSugar) saveSugar.addEventListener('click', ()=>{
    const val = document.getElementById('sugarInput').value;
    if(!val) return alert('Enter a glucose value first');
    // For demo, append to result box
    const el = document.getElementById('sugarResult'); el.innerText = `Saved glucose value: ${val} mg/dL`;
  });

  const saveBp = document.getElementById('saveBp'); if(saveBp) saveBp.addEventListener('click', ()=>{
    const s = document.getElementById('systolic').value; const d = document.getElementById('diastolic').value;
    if(!s || !d) return alert('Provide both systolic and diastolic values');
    const el = document.getElementById('bpResult'); el.innerText = `Saved BP: ${s}/${d} mmHg`;
  });
  
  // Blood report page handlers
  const analyzeCbc = document.getElementById('analyzeCbc'); if(analyzeCbc) analyzeCbc.addEventListener('click', fakeAnalyzeCBC);
  const analyzeSugarReport = document.getElementById('analyzeSugarReport'); if(analyzeSugarReport) analyzeSugarReport.addEventListener('click', fakeAnalyzeSugarReport);
  const analyzeKft = document.getElementById('analyzeKft'); if(analyzeKft) analyzeKft.addEventListener('click', fakeAnalyzeKFT);
  const analyzeLft = document.getElementById('analyzeLft'); if(analyzeLft) analyzeLft.addEventListener('click', fakeAnalyzeLFT);
  const analyzeLipid = document.getElementById('analyzeLipid'); if(analyzeLipid) analyzeLipid.addEventListener('click', fakeAnalyzeLipid);
  const analyzeThyroid = document.getElementById('analyzeThyroid'); if(analyzeThyroid) analyzeThyroid.addEventListener('click', fakeAnalyzeThyroid);
  const analyzeVits = document.getElementById('analyzeVits'); if(analyzeVits) analyzeVits.addEventListener('click', fakeAnalyzeVitamins);
  const analyzeHormones = document.getElementById('analyzeHormones'); if(analyzeHormones) analyzeHormones.addEventListener('click', fakeAnalyzeHormones);
  
  // CSV upload handlers for time-series charts
  const csvUpload = document.getElementById('csvUpload');
  const loadCsvBtn = document.getElementById('loadCsv');
  const clearCsvBtn = document.getElementById('clearCsv');
  const csvStatus = document.getElementById('csvStatus');
  if(loadCsvBtn && csvUpload){
    loadCsvBtn.addEventListener('click', ()=>{
      const file = csvUpload.files && csvUpload.files[0];
      if(!file){ alert('Choose a CSV file first.'); return; }
      const reader = new FileReader();
      reader.onload = (e)=>{
        const text = e.target.result;
        try{ const rows = parseCsv(text); const grouped = groupByTest(rows); renderCsvCharts(grouped); csvStatus.innerText = `Loaded ${file.name} — ${rows.length} rows, ${Object.keys(grouped).length} tests.`; }
        catch(err){ console.error(err); alert('Failed to parse CSV: '+err.message); }
      };
      reader.readAsText(file);
    });
  }
  if(clearCsvBtn){ clearCsvBtn.addEventListener('click', ()=>{ clearCsvCharts(); if(csvStatus) csvStatus.innerText='Cleared charts.'; }); }
});

// --- Fake analysis functions ---
function fakeAnalyzeXray(){
  const res = document.getElementById('xrayResult');
  res.innerText = 'Running AI analysis... (demo).\nDetected: No acute fracture identified. (This is placeholder text.)';
}

// --- CSV parsing and chart rendering helpers ---
function parseCsv(text){
  const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(l=>l.length>0);
  if(lines.length===0) return [];
  const headerParts = lines[0].split(/,|;|\t/).map(h=>h.trim().toLowerCase());
  const headers = headerParts;
  const rows = [];
  for(let i=1;i<lines.length;i++){
    const cols = lines[i].split(/,|;|\t/).map(c=>c.trim());
    const obj = {};
    for(let j=0;j<headers.length;j++){ obj[headers[j]] = cols[j] || ''; }
    rows.push(obj);
  }
  return rows;
}

function groupByTest(rows){
  // Expecting headers like date,test,value (case-insensitive)
  const mapping = {};
  rows.forEach(r=>{
    // try to find date, test and value columns
    const keys = Object.keys(r);
    let dateKey = keys.find(k=>/date/.test(k)) || keys[0];
    let testKey = keys.find(k=>/(test|name|parameter)/.test(k)) || keys[1] || keys[0];
    let valueKey = keys.find(k=>/(value|result|val|level)/.test(k)) || keys[2] || keys[1] || keys[0];
    const dateRaw = r[dateKey]; const testName = (r[testKey]||'Unknown').trim(); const valueRaw = r[valueKey];
    const date = parseDate(dateRaw);
    const value = parseFloat((valueRaw||'').replace(/[a-zA-Z/%\s]/g,''));
    if(!mapping[testName]) mapping[testName]=[];
    mapping[testName].push({date:date, value: isNaN(value)?null:value, raw:valueRaw});
  });
  // sort each series by date (if date present)
  Object.keys(mapping).forEach(k=>{
    mapping[k].sort((a,b)=>{ if(a.date && b.date) return a.date - b.date; if(a.date) return -1; if(b.date) return 1; return 0; });
  });
  return mapping;
}

function parseDate(s){
  if(!s) return null;
  const d = new Date(s);
  if(!isNaN(d)) return d;
  // try common formats dd/mm/yyyy or dd-mm-yyyy
  const m = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if(m){ const dd=Number(m[1]), mm=Number(m[2]), yy=Number(m[3]); return new Date(yy<100?2000+yy:yy, mm-1, dd); }
  return null;
}

function renderCsvCharts(grouped){
  const container = document.getElementById('csvCharts'); if(!container) return;
  // clear existing
  clearCsvCharts();
  Object.keys(grouped).forEach((testName, idx)=>{
    const series = grouped[testName];
    const labels = [], data = [];
    series.forEach(pt=>{ labels.push(pt.date ? pt.date.toISOString().slice(0,10) : ''); data.push(pt.value==null?NaN:pt.value); });
    // create card + canvas
    const card = document.createElement('div'); card.className='card'; card.style.padding='12px';
    const title = document.createElement('h4'); title.innerText = testName; title.style.margin='0 0 8px 0';
    const canvas = document.createElement('canvas'); const cid = 'csvchart_'+idx; canvas.id = cid; canvas.style.height='200px'; canvas.style.maxWidth='100%';
    card.appendChild(title); card.appendChild(canvas);
    container.appendChild(card);
    renderChart(cid,'line',labels,data,testName);
  });
}

function clearCsvCharts(){
  const container = document.getElementById('csvCharts'); if(!container) return;
  // destroy charts
  if(window._hpCharts){ Object.keys(window._hpCharts).forEach(k=>{ try{ window._hpCharts[k].destroy(); }catch(e){} }); window._hpCharts = {}; }
  container.innerHTML = '';
}
function fakeAnalyzeMri(){
  const res = document.getElementById('mriResult');
  res.innerText = 'Running AI analysis... (demo).\nSummary: Normal-appearing structures. (Placeholder.)';
}
function fakeAnalyzeSugar(){
  const res = document.getElementById('sugarResult');
  res.innerText = 'Running AI analysis... (demo).\nInterpretation: Fasting/Random threshold check. (Placeholder.)';
}
function fakeAnalyzeBp(){
  const res = document.getElementById('bpResult');
  res.innerText = 'Running AI analysis... (demo).\nInterpretation: Within normal range / Elevated depending on values. (Placeholder.)';
}

// --- Blood report fake analysis functions (user-readable summaries) ---
function fakeAnalyzeCBC(){
  const input = document.getElementById('cbcInput'); const out = document.getElementById('cbcResult');
  const txt = input ? input.value.trim() : '';
  if(!txt){ out.innerText = 'Paste CBC values (Hgb, Hct, WBC, Platelets) to get an explanation.'; return; }
  // Very simple parsing by keywords
  const lower = txt.toLowerCase();
  let parts = [];
  if(/hgb|hemoglobin/.test(lower)) parts.push('Hemoglobin: low values may indicate anemia; high values may indicate dehydration or other causes.');
  if(/hct|hematocrit/.test(lower)) parts.push('Hematocrit: mirrors hemoglobin; low suggests anemia, high suggests hemoconcentration.');
  if(/wbc/.test(lower)) parts.push('WBC: elevated values commonly suggest infection or inflammation; low values may indicate bone marrow issues or viral infection.');
  if(/plt|platelet/.test(lower)) parts.push('Platelets: low platelets increase bleeding risk; high platelets can occur with inflammation.');
  if(parts.length===0) parts.push('Could not parse specific CBC markers. Typical report includes Hgb, Hct, WBC, Platelets — paste those values for tailored notes.');
  out.innerText = parts.join('\n\n');
  // Render chart if numeric values are provided (very permissive parser)
  const labels = [], data = [];
  const hgbMatch = txt.match(/hgb[:=]?\s*([0-9]+\.?[0-9]*)/i) || txt.match(/hemoglobin[:=]?\s*([0-9]+\.?[0-9]*)/i);
  const hctMatch = txt.match(/hct[:=]?\s*([0-9]+\.?[0-9]*)/i) || txt.match(/hematocrit[:=]?\s*([0-9]+\.?[0-9]*)/i);
  const wbcMatch = txt.match(/wbc[:=]?\s*([0-9]+\.?[0-9]*)/i);
  const pltMatch = txt.match(/plt[:=]?\s*([0-9]+\.?[0-9]*)/i) || txt.match(/platelet[:=]?\s*([0-9]+\.?[0-9]*)/i);
  if(hgbMatch){ labels.push('Hgb'); data.push(Number(hgbMatch[1])); }
  if(hctMatch){ labels.push('Hct'); data.push(Number(hctMatch[1])); }
  if(wbcMatch){ labels.push('WBC'); data.push(Number(wbcMatch[1])); }
  if(pltMatch){ labels.push('Platelets'); data.push(Number(pltMatch[1])); }
  if(data.length) renderChart('cbcChart','bar',labels,data,'CBC');
}

function fakeAnalyzeSugarReport(){
  const input = document.getElementById('sugarReport'); const out = document.getElementById('sugarReportResult');
  const txt = input ? input.value.trim() : '';
  if(!txt){ out.innerText = 'Enter fasting/random glucose or HbA1c (e.g. Fasting:95 mg/dL; HbA1c:5.8%)'; return; }
  const lower = txt.toLowerCase();
  let notes=[];
  const matchF = txt.match(/fast(?:ing)?:?\s*(\d{2,3})/i);
  const matchA1c = txt.match(/a1c[:=]?\s*([0-9.]*)/i) || txt.match(/hb?a1c[:=]?\s*([0-9.]*)/i);
  if(matchF){ const val = Number(matchF[1]); if(val<100) notes.push(`Fasting glucose ${val} mg/dL — within normal fasting range.`); else if(val<126) notes.push(`Fasting glucose ${val} mg/dL — impaired fasting (prediabetes) range.`); else notes.push(`Fasting glucose ${val} mg/dL — diabetic range; evaluate with clinician.`); }
  if(matchA1c){ const a = Number(matchA1c[1]); if(a<5.7) notes.push(`HbA1c ${a}% — non-diabetic range.`); else if(a<6.5) notes.push(`HbA1c ${a}% — prediabetes range.`); else notes.push(`HbA1c ${a}% — diabetic range; discuss with clinician.`); }
  if(notes.length===0) notes.push('Could not parse values. Include "Fasting:95 mg/dL" or "HbA1c:5.8%" for automatic notes.');
  out.innerText = notes.join('\n\n');
  // Chart: show fasting and A1c if present
  const labels = [], data = [];
  if(matchF){ labels.push('Fasting (mg/dL)'); data.push(Number(matchF[1])); }
  if(matchA1c){ labels.push('HbA1c (%)'); data.push(Number(matchA1c[1])); }
  if(data.length) renderChart('sugarChart', data.length>1 ? 'bar' : 'line', labels, data, 'Glucose');
}

function fakeAnalyzeKFT(){
  const input = document.getElementById('kftInput'); const out = document.getElementById('kftResult');
  const txt = input ? input.value.trim() : '';
  if(!txt){ out.innerText = 'Enter Creatinine and/or eGFR (e.g. Creatinine:1.0 mg/dL; eGFR:95 mL/min)'; return; }
  const matchCr = txt.match(/creat(?:inine)?:?\s*([0-9.]+)\s*mg/i);
  const matchGfr = txt.match(/egfr[:=]?\s*(\d+)/i);
  let notes=[];
  if(matchCr){ const cr = Number(matchCr[1]); if(cr<=1.2) notes.push(`Creatinine ${cr} mg/dL — within typical range for many adults (varies by age/sex).`); else notes.push(`Creatinine ${cr} mg/dL — elevated; consider kidney function review.`); }
  if(matchGfr){ const g = Number(matchGfr[1]); if(g>=90) notes.push(`eGFR ${g} mL/min — normal kidney function.`); else if(g>=60) notes.push(`eGFR ${g} mL/min — mildly decreased function.`); else notes.push(`eGFR ${g} mL/min — reduced kidney function; follow-up recommended.`); }
  if(notes.length===0) notes.push('Could not parse creatinine or eGFR. Paste values like "Creatinine:1.0 mg/dL; eGFR:95".');
  out.innerText = notes.join('\n\n');
  const labels = [], data = [];
  if(matchCr){ labels.push('Creatinine mg/dL'); data.push(Number(matchCr[1])); }
  if(matchGfr){ labels.push('eGFR mL/min'); data.push(Number(matchGfr[1])); }
  if(data.length) renderChart('kftChart','bar',labels,data,'Kidney');
}

function fakeAnalyzeLFT(){
  const input = document.getElementById('lftInput'); const out = document.getElementById('lftResult');
  const txt = input ? input.value.trim() : '';
  if(!txt){ out.innerText = 'Enter AST, ALT, ALP, Bilirubin values to get guidance.'; return; }
  let notes=[];
  if(/alt[:=]?\s*(\d{1,3})/i.test(txt)) notes.push('ALT: liver enzyme — mild elevations can reflect liver inflammation or medication effects.');
  if(/ast[:=]?\s*(\d{1,3})/i.test(txt)) notes.push('AST: like ALT, helps assess hepatocellular injury; pattern vs ALT matters.');
  if(/alp[:=]?\s*(\d{1,3})/i.test(txt)) notes.push('ALP: raised levels can indicate cholestasis or bone turnover.');
  if(/bilirubin[:=]?\s*(\d+\.?\d*)/i.test(txt)) notes.push('Bilirubin: elevated values cause jaundice and suggest hemolysis or liver/excretory dysfunction.');
  if(notes.length===0) notes.push('Could not parse LFT markers. Provide values like "ALT:32 U/L; AST:28 U/L; ALP:80 U/L".');
  out.innerText = notes.join('\n\n');
  // parse numeric LFT values for chart
  const labels = [], data = [];
  const alt = (txt.match(/alt[:=]?\s*(\d{1,3})/i) || [])[1];
  const ast = (txt.match(/ast[:=]?\s*(\d{1,3})/i) || [])[1];
  const alp = (txt.match(/alp[:=]?\s*(\d{1,3})/i) || [])[1];
  const bil = (txt.match(/bilirubin[:=]?\s*(\d+\.?\d*)/i) || [])[1];
  if(alt){ labels.push('ALT'); data.push(Number(alt)); }
  if(ast){ labels.push('AST'); data.push(Number(ast)); }
  if(alp){ labels.push('ALP'); data.push(Number(alp)); }
  if(bil){ labels.push('Bilirubin'); data.push(Number(bil)); }
  if(data.length) renderChart('lftChart','bar',labels,data,'LFT');
}

function fakeAnalyzeLipid(){
  const input = document.getElementById('lipidInput'); const out = document.getElementById('lipidResult');
  const txt = input ? input.value.trim() : '';
  if(!txt){ out.innerText = 'Enter TC/LDL/HDL/TG (e.g. LDL:130 mg/dL)'; return; }
  let notes=[];
  const mLDL = txt.match(/ldl[:=]?\s*(\d{1,3})/i);
  const mHDL = txt.match(/hdl[:=]?\s*(\d{1,3})/i);
  const mTG = txt.match(/tg[:=]?\s*(\d{1,4})/i);
  if(mLDL){ const l = Number(mLDL[1]); if(l<100) notes.push(`LDL ${l} mg/dL — optimal.`); else if(l<160) notes.push(`LDL ${l} mg/dL — borderline to mildly high.`); else notes.push(`LDL ${l} mg/dL — high; discuss risk reduction.`); }
  if(mHDL){ const h = Number(mHDL[1]); if(h<40) notes.push(`HDL ${h} mg/dL — low (higher risk).`); else notes.push(`HDL ${h} mg/dL — acceptable.`); }
  if(mTG){ const t = Number(mTG[1]); if(t<150) notes.push(`Triglycerides ${t} mg/dL — normal.`); else notes.push(`Triglycerides ${t} mg/dL — elevated; address lifestyle/diet.`); }
  if(notes.length===0) notes.push('Could not parse lipid values. Provide LDL/HDL/TG in mg/dL.');
  out.innerText = notes.join('\n\n');
  const labels = [], data = [];
  if(mLDL){ labels.push('LDL'); data.push(Number(mLDL[1])); }
  if(mHDL){ labels.push('HDL'); data.push(Number(mHDL[1])); }
  if(mTG){ labels.push('TG'); data.push(Number(mTG[1])); }
  if(labels.length) renderChart('lipidChart','bar',labels,data,'Lipids');
}

function fakeAnalyzeThyroid(){
  const input = document.getElementById('thyroidInput'); const out = document.getElementById('thyroidResult');
  const txt = input ? input.value.trim() : '';
  if(!txt){ out.innerText = 'Enter TSH and/or Free T4 (e.g. TSH:2.5 µIU/mL)'; return; }
  let notes=[];
  const mTSH = txt.match(/tsh[:=]?\s*([0-9.]+)\s*/i);
  if(mTSH){ const t = Number(mTSH[1]); if(t<0.4) notes.push(`TSH ${t} — low (may indicate hyperthyroidism).`); else if(t<=4.0) notes.push(`TSH ${t} — within typical reference range.`); else notes.push(`TSH ${t} — elevated (may indicate hypothyroidism).`); }
  if(notes.length===0) notes.push('Could not parse TSH/Free T4 values.');
  out.innerText = notes.join('\n\n');
  const labels = [], data = [];
  if(mTSH){ labels.push('TSH'); data.push(Number(mTSH[1])); }
  if(data.length) renderChart('thyroidChart','bar',labels,data,'Thyroid');
}

function fakeAnalyzeVitamins(){
  const input = document.getElementById('vitInput'); const out = document.getElementById('vitResult');
  const txt = input ? input.value.trim() : '';
  if(!txt){ out.innerText = 'Enter Vitamin D, B12, Ferritin etc. (e.g. VitD:24 ng/mL; B12:320 pg/mL)'; return; }
  let notes=[];
  if(/vitd[:=]?\s*(\d{1,3})/i.test(txt)) notes.push('Vitamin D: levels <20 ng/mL often indicate deficiency; 20–30 insufficient; 30+ adequate for most.');
  if(/b12[:=]?\s*(\d{1,4})/i.test(txt)) notes.push('Vitamin B12: low values can cause fatigue, neuropathy; thresholds vary by lab.');
  if(/ferritin[:=]?\s*(\d{1,4})/i.test(txt)) notes.push('Ferritin: low indicates iron deficiency; high may reflect inflammation or iron overload.');
  if(notes.length===0) notes.push('Could not parse vitamin/mineral markers. Provide values like "VitD:24 ng/mL; B12:320 pg/mL".');
  out.innerText = notes.join('\n\n');
  const labels = [], data = [];
  const mVitD = txt.match(/vitd[:=]?\s*(\d{1,3})/i);
  const mB12 = txt.match(/b12[:=]?\s*(\d{1,4})/i);
  const mFerr = txt.match(/ferritin[:=]?\s*(\d{1,4})/i);
  if(mVitD){ labels.push('Vit D'); data.push(Number(mVitD[1])); }
  if(mB12){ labels.push('B12'); data.push(Number(mB12[1])); }
  if(mFerr){ labels.push('Ferritin'); data.push(Number(mFerr[1])); }
  if(data.length) renderChart('vitChart','bar',labels,data,'Vitamins');
}

function fakeAnalyzeHormones(){
  const input = document.getElementById('hormoneInput'); const out = document.getElementById('hormoneResult');
  const txt = input ? input.value.trim() : '';
  if(!txt){ out.innerText = 'Enter hormone values (e.g. Testosterone, Estradiol, Cortisol) to get simple guidance.'; return; }
  let notes=[];
  if(/cortisol[:=]?\s*(\d{1,3})/i.test(txt)) notes.push('Cortisol: interpret timing (morning vs evening); very high or low values need clinical correlation.');
  if(/t[:=]?\s*(\d{2,4})/i.test(txt) || /testosterone/i.test(txt)) notes.push('Testosterone: low levels can cause low energy/low libido; interpretation needs age/sex reference.');
  if(notes.length===0) notes.push('Could not parse hormone values. Paste values like "Cortisol:10 µg/dL; T:400 ng/dL".');
  out.innerText = notes.join('\n\n');
  const labels = [], data = [];
  const mCort = txt.match(/cortisol[:=]?\s*(\d{1,3})/i);
  const mT = txt.match(/(?:\bT[:=]?|testosterone[:=]?\s*)(\d{1,4})/i);
  if(mCort){ labels.push('Cortisol'); data.push(Number(mCort[1])); }
  if(mT){ labels.push('Testosterone'); data.push(Number(mT[1])); }
  if(data.length) renderChart('hormoneChart','bar',labels,data,'Hormones');
}

// --- Chart helper (uses Chart.js) ---
function renderChart(canvasId, chartType, labels, values, title){
  try{
    window._hpCharts = window._hpCharts || {};
    const ctx = document.getElementById(canvasId);
    if(!ctx) return;
    // destroy existing chart
    if(window._hpCharts[canvasId]){ window._hpCharts[canvasId].destroy(); }
    const cfg = {
      type: chartType || 'bar',
      data: { labels: labels, datasets:[{label:title || '', data: values, backgroundColor: 'rgba(59,130,246,0.7)', borderColor:'rgba(59,130,246,0.95)', borderWidth:1 }] },
      options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},title:{display:!!title,text:title}}, scales: { y: { beginAtZero: true }} }
    };
    window._hpCharts[canvasId] = new Chart(ctx, cfg);
  }catch(e){ console.error('Chart render error', e); }
}

// Expose a helper to set links programmatically (if you want to integrate later via console)
window.HealthPlus = {
  setLink: (key, url)=>{ externalLinks[key]=url; }
};

// Auto-load the chatbot widget script so the widget appears on pages that include `script.js`.
(function loadChatbotScript(){
  try{
    if(window.hpChatbotLoaded) return; window.hpChatbotLoaded = true;
    const s = document.createElement('script'); s.src = 'chatbot.js'; s.defer = true; s.onload = ()=>console.log('Chatbot loaded'); document.head.appendChild(s);
  }catch(e){ console.warn('Failed to load chatbot script', e); }
})();

// Auto-load the theme toggle script
(function loadThemeToggleScript(){
  try{
    if(window.hpThemeLoaded) return; window.hpThemeLoaded = true;
    const s = document.createElement('script'); s.src = 'theme-toggle.js'; s.defer = true; s.onload = ()=>console.log('Theme toggle loaded'); document.head.appendChild(s);
  }catch(e){ console.warn('Failed to load theme toggle script', e); }
})();

// Auto-load the settings script for external link configuration
(function loadSettingsScript(){
  try{
    if(window.hpSettingsLoaded) return; window.hpSettingsLoaded = true;
    const s = document.createElement('script'); s.src = 'settings.js'; s.defer = true; s.onload = ()=>console.log('Settings loaded'); document.head.appendChild(s);
  }catch(e){ console.warn('Failed to load settings script', e); }
})();
