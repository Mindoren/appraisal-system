document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.getElementById('workplanTableBody');
  const showFormBtn = document.getElementById('showCreateFormBtn');
  const formCard = document.getElementById('createWorkplanForm');
  const cancelBtn = document.getElementById('cancelWorkplanBtn');
  const submitBtn = document.getElementById('submitWorkplanBtn');
  const errorMessage = document.getElementById('workplanError');

  const inputs = {
    objective: document.getElementById('objectiveInput'),
    activity: document.getElementById('activityInput'),
    timeline: document.getElementById('timelineInput'),
    status: document.getElementById('statusInput')
  };

  const API_BASE = window.location.origin === 'null' ? 'http://localhost:3000' : '';

  const renderWorkplans = (workplans) => {
    if (!workplans || workplans.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="4" class="empty-row">No work plans found. Create one to get started.</td></tr>';
      return;
    }

    tableBody.innerHTML = workplans.map((workplan) => `
      <tr>
        <td class="font-semibold">${escapeHtml(workplan.objective)}</td>
        <td>${escapeHtml(workplan.activity)}</td>
        <td><span class="timeline-tag">${escapeHtml(workplan.timeline)}</span></td>
        <td><span class="status-badge ${statusClass(workplan.status)}">${escapeHtml(workplan.status)}</span></td>
      </tr>
    `).join('');
  };

  const statusClass = (status) => {
    const normalized = (status || '').toLowerCase();
    if (normalized.includes('progress')) return 'in-progress';
    if (normalized.includes('complete')) return 'completed';
    return 'planned';
  };

  const escapeHtml = (value) => {
    return String(value || '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  };

  const showForm = () => {
    formCard.classList.remove('hidden');
    formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const hideForm = () => {
    formCard.classList.add('hidden');
    clearError();
  };

  const clearError = () => {
    errorMessage.textContent = '';
    errorMessage.classList.remove('visible');
  };

  const showError = (message) => {
    errorMessage.textContent = message;
    errorMessage.classList.add('visible');
  };

  const resetForm = () => {
    inputs.objective.value = '';
    inputs.activity.value = '';
    inputs.timeline.value = '';
    inputs.status.value = 'Planned';
  };

  const loadWorkplans = async () => {
    try {
      const response = await fetch(API_BASE + '/api/workplans');
      if (!response.ok) {
        throw new Error('Unable to load work plans.');
      }
      const workplans = await response.json();
      renderWorkplans(workplans);
    } catch (error) {
      console.error(error);
      showError('Could not load work plans. Check your server connection.');
    }
  };

  const submitWorkplan = async () => {
    clearError();
    const workplan = {
      objective: inputs.objective.value.trim(),
      activity: inputs.activity.value.trim(),
      timeline: inputs.timeline.value.trim(),
      status: inputs.status.value.trim()
    };

    if (!workplan.objective || !workplan.activity || !workplan.timeline || !workplan.status) {
      showError('All fields are required to create a work plan.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
      const response = await fetch(API_BASE + '/api/workplans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workplan)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create workplan.');
      }

      resetForm();
      hideForm();
      await loadWorkplans();
      alert('Workplan created successfully!');
    } catch (error) {
      console.error(error);
      showError(error.message || 'Unable to create workplan.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Work Plan';
    }
  };

  showFormBtn.addEventListener('click', showForm);
  cancelBtn.addEventListener('click', hideForm);
  submitBtn.addEventListener('click', submitWorkplan);

  loadWorkplans();
});
