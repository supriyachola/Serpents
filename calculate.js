(function(){
  const form = document.getElementById('carbonFootprintForm');
  const resultEl = document.getElementById('result');
  const saveBtn = document.getElementById('saveBtn');
  const historyEl = document.getElementById('history');
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const pdfBtn = document.getElementById('pdfBtn');
  const aiAdviceBtn = document.getElementById('aiAdviceBtn');
  const aiAdviceEl = document.getElementById('aiAdvice');
  const timeframeRadios = document.querySelectorAll('input[name="timeframe"]');

  // Emission factors (kg CO2 per unit)
  const EF = {
    transport: 0.21,     // per km
    energy: 0.257,       // per kWh
    food: 1.2,           // per meal
    waste: 0.9,          // per kg
    purchase: 2.5        // per item
  };

  // Weekly recommended range (kg CO2)
  const WEEKLY_TARGET_MIN = 38.5;
  const WEEKLY_TARGET_MAX = 57.7;

  function fmt(n){ return Number(n).toFixed(2); }

  function getTimeframe(){
    return [...timeframeRadios].find(r => r.checked).value; // week | month | year
  }

  function scaleResult(total, parts, timeframe){
    let factor = 1;
    if(timeframe === 'month') factor = 4.3;
    if(timeframe === 'year') factor = 52;
    const scaledParts = {};
    for(const k in parts) scaledParts[k] = parts[k] * factor;
    return { total: total * factor, parts: scaledParts, factor };
  }

  function calc(values){
    const transportationFootprint = values.transportation * EF.transport;
    const energyUsageFootprint    = values.energyUsage * EF.energy;
    const foodFootprint           = values.foodConsumption * EF.food;
    const wasteFootprint          = values.wasteProduction * EF.waste;
    const purchaseFootprint       = values.purchasingHabits * EF.purchase;
    const total = transportationFootprint + energyUsageFootprint + foodFootprint + wasteFootprint + purchaseFootprint;

    return {
      total,
      parts: {
        Transportation: transportationFootprint,
        Energy: energyUsageFootprint,
        Food: foodFootprint,
        Waste: wasteFootprint,
        Purchasing: purchaseFootprint
      }
    };
  }

  // ===== Chart.js =====
  let chart;
  function renderChart(parts){
    const ctx = document.getElementById('breakdownChart').getContext('2d');
    const labels = Object.keys(parts);
    const data = Object.values(parts);
    if(chart) chart.destroy();
    chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{ data }]
      },
      options: {
        responsive:true,
        plugins:{ legend:{ position:'bottom' } }
      }
    });
  }

  function render(result){
    const timeframe = getTimeframe();
    const scaled = scaleResult(result.total, { ...result.parts }, timeframe);
    renderChart(scaled.parts);

    // Risk banding based on weekly-equivalent
    const weekly = result.total;
    let band, note;
    if(weekly > WEEKLY_TARGET_MAX){
      band = 'High';
      note = `Your weekly-equivalent is above the recommended range (${WEEKLY_TARGET_MIN}–${WEEKLY_TARGET_MAX} kg CO₂).`;
      resultEl.classList.add('warning');
    } else if(weekly >= WEEKLY_TARGET_MIN){
      band = 'Moderate';
      note = `Your weekly-equivalent is within the recommended range.`;
      resultEl.classList.remove('warning');
    } else {
      band = 'Low';
      note = `Great! Your weekly-equivalent is below the recommended range.`;
      resultEl.classList.remove('warning');
    }

    const items = Object.entries(scaled.parts)
      .map(([k,v]) => `<li><strong>${k}:</strong> ${fmt(v)} kg CO₂ (${timeframe})</li>`)
      .join('');

    const sorted = Object.entries(result.parts).sort((a,b)=> b[1]-a[1]);
    const [topCat] = sorted[0];
    const tips = [
      `Focus first on <strong>${topCat}</strong> — it contributes the most.`,
      `Set a goal near <strong>${fmt(WEEKLY_TARGET_MIN)}</strong> kg CO₂ per week and track History.`
    ];

    resultEl.innerHTML = `
      <div><strong>Total (${timeframe}):</strong> ${fmt(scaled.total)} kg CO₂ <em>(${band})</em></div>
      <div class="breakdown">
        <strong>Breakdown</strong>
        <ul>${items}</ul>
      </div>
      <div class="breakdown">
        <strong>Tips</strong>
        <ul><li>${tips.join('</li><li>')}</li></ul>
      </div>
    `;

    // store last calc for PDF/AI use
    resultEl.dataset.payload = JSON.stringify({ timeframe, scaled, weekly, parts: result.parts });
  }

  function getValues(){
    const v = (id) => parseFloat(document.getElementById(id).value);
    const transportation = v('transportation');
    const energyUsage = v('energyUsage');
    const foodConsumption = v('foodConsumption');
    const wasteProduction = v('wasteProduction');
    const purchasingHabits = v('purchasingHabits');

    const values = { transportation, energyUsage, foodConsumption, wasteProduction, purchasingHabits };
    const hasNaN = Object.values(values).some(x => Number.isNaN(x));
    if(hasNaN){ throw new Error('Please fill all fields with valid numbers.'); }
    return values;
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    try{
      const values = getValues();
      const result = calc(values);
      render(result);
      aiAdviceEl.textContent = ''; // clear old advice
    }catch(err){
      resultEl.textContent = err.message;
      resultEl.classList.add('warning');
    }
  });

  // History
  saveBtn.addEventListener('click', function(){
    try{
      const values = getValues();
      const result = calc(values);
      const item = {
        date: new Date().toISOString(),
        total_weekly: Number(result.total.toFixed(2)),
        parts_weekly: result.parts,
        values
      };
      const key = 'cf_history';
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      arr.unshift(item);
      localStorage.setItem(key, JSON.stringify(arr.slice(0, 12)));
      renderHistory();
    }catch(err){
      resultEl.textContent = err.message;
      resultEl.classList.add('warning');
    }
  });

  function renderHistory(){
    const arr = JSON.parse(localStorage.getItem('cf_history') || '[]');
    historyList.innerHTML = arr.map((it, idx)=>{
      const date = new Date(it.date).toLocaleString();
      return `<li>#${arr.length - idx} — ${date}: <strong>${fmt(it.total_weekly)}</strong> kg CO₂ (weekly)</li>`;
    }).join('');
    historyEl.hidden = arr.length === 0;
  }

  clearHistoryBtn.addEventListener('click', function(){
    localStorage.removeItem('cf_history');
    renderHistory();
  });

  // ===== PDF =====
  pdfBtn.addEventListener('click', function(){
    const payload = resultEl.dataset.payload ? JSON.parse(resultEl.dataset.payload) : null;
    if(!payload){ alert('Please calculate first.'); return; }
    const { timeframe, scaled, weekly } = payload;
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.setFontSize(16);
    pdf.text('Carbon Footprint Report', 14, 18);
    pdf.setFontSize(11);
    pdf.text('Date: ' + new Date().toLocaleString(), 14, 26);
    pdf.text(`Timeframe: ${timeframe}`, 14, 32);
    pdf.text(`Total (${timeframe}): ${fmt(scaled.total)} kg CO₂`, 14, 38);
    pdf.text(`Weekly-equivalent: ${fmt(weekly)} kg CO₂`, 14, 44);

    // Breakdown
    let y = 54;
    pdf.setFont(undefined, 'bold');
    pdf.text('Breakdown', 14, y);
    pdf.setFont(undefined, 'normal');
    y += 6;
    Object.entries(scaled.parts).forEach(([k,v])=>{
      pdf.text(`• ${k}: ${fmt(v)} kg CO₂ (${timeframe})`, 16, y);
      y += 6;
    });

    // Tips
    pdf.setFont(undefined, 'bold');
    pdf.text('Tips', 14, y + 4);
    pdf.setFont(undefined, 'normal');
    y += 10;
    pdf.text('• Focus on the largest category first.', 16, y); y += 6;
    pdf.text('• Set a weekly goal near 38.5 kg CO₂ and track progress.', 16, y); y += 6;

    // Chart image
    const canvas = document.getElementById('breakdownChart');
    const img = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(img, 'PNG', 110, 18, 88, 66);

    // AI Advice (if present)
    if(aiAdviceEl.textContent.trim()){
      pdf.setFont(undefined, 'bold');
      pdf.text('AI Advice', 14, y + 6);
      pdf.setFont(undefined, 'normal');
      const split = pdf.splitTextToSize(aiAdviceEl.textContent.replace(/^🤖\s*/, ''), 180);
      pdf.text(split, 16, y + 12);
    }

    pdf.save('carbon_report.pdf');
  });

  // ===== AI Advice (LLM via backend) =====
  aiAdviceBtn.addEventListener('click', async function(){
    const payload = resultEl.dataset.payload ? JSON.parse(resultEl.dataset.payload) : null;
    if(!payload){ alert('Please calculate first.'); return; }

    aiAdviceEl.textContent = '🤖 Generating advice...';
    try{
      const res = await fetch('/advice', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          total: payload.weekly,          // send weekly-equivalent for consistency
          breakdown: payload.parts        // weekly parts
        })
      });
      const data = await res.json();
      aiAdviceEl.textContent = '🤖 ' + (data.advice || 'No advice returned.');
    }catch(err){
      aiAdviceEl.textContent = '🤖 Error getting advice: ' + err.message;
    }
  });

  // initial
  renderHistory();
})();
