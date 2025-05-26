/* Calculation code */
function calculate() {
  const value = parseFloat(document.getElementById('catalogValue').value);
  const co2 = parseFloat(document.getElementById('co2').value);
  const engine = document.getElementById('engineType').value;

  // Guard against incomplete input
  if (isNaN(value) || isNaN(co2) || !engine) return;

  const result = (value * 0.01) + co2 * 0.3;

  const translatedResult = i18next.t('result_text', { amount: result.toFixed(2) });
  document.getElementById('result-text').textContent = translatedResult;
  document.getElementById("result").hidden = false;
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

document.getElementById("btn_share_result").addEventListener("click", () => {
  const result = document.getElementById("result-text").textContent;

  if (navigator.share) {
    navigator
      .share({
        title: "Fisc36 Result",
        text: result,
        url: window.location.href,
      })
      .catch((err) => console.log("Share cancelled or failed:", err));
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(result).then(() =>
      alert("Copied to clipboard!")
    );
  } else {
    const subject = "Fisc36 Result";
    const body = result;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
});
