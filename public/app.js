const form = document.getElementById('enquiry-form');
const statusEl = document.getElementById('status');
const submitBtn = document.getElementById('submit-btn');

const setStatus = (message, state) => {
  statusEl.textContent = message;
  statusEl.className = state ? state : '';
};

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('Sending…', '');
  submitBtn.disabled = true;

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json();
      if (data?.errors) {
        throw new Error(data.errors.join(', '));
      }
      throw new Error(data?.error || 'Unable to send enquiry');
    }

    form.reset();
    setStatus('Message sent! We will get back to you soon.', 'success');
  } catch (error) {
    setStatus(error.message || 'Something went wrong.', 'error');
  } finally {
    submitBtn.disabled = false;
  }
});

