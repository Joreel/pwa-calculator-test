/* Calculation code */
function calculate() {
  const value = parseFloat(document.getElementById('catalogValue').value);
  const co2 = parseFloat(document.getElementById('co2').value);
  const engine = document.getElementById('engineType').value;

  // Guard against incomplete input
  if (isNaN(value) || isNaN(co2) || !engine) return;

  const result = (value * 0.01) + co2 * 0.3;

  const translatedResult = i18next.t('result_text', { amount: result.toFixed(2) });
  document.getElementById('result').textContent = translatedResult;
}

/* Calculate the result when the form gets submitted */
document.getElementById('fiscForm').addEventListener('submit', function (e) {
  e.preventDefault();
  calculate();
});

/* Recalculate result when the language is updated */
window.addEventListener('language-updated', () => {
  calculate(); // will re-translate result
});

/* PWA code */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log("Service Worker registered"));
}