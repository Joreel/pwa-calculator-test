function calculate() {
  const income = parseFloat(document.getElementById('income').value);
  if (isNaN(income)) {
    document.getElementById('result').innerText = 'Please enter a valid number.';
    return;
  }

  const result = income * 0.21 + 47.5; // Example formula
  document.getElementById('result').innerText = `Your calculated value is: ${result.toFixed(2)}`;
}