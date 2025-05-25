document.getElementById('fiscForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const value = parseFloat(document.getElementById('catalogValue').value);
  const co2 = parseFloat(document.getElementById('co2').value);
  const engine = document.getElementById('engineType').value;

  // Dummy calculation for demonstration
  const result = (value * 0.01) + co2 * 0.3;

  document.getElementById('result').textContent = `Avantage de toute nature estimé: €${result.toFixed(2)}`;
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log("Service Worker registered"));
}
