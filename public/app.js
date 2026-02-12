// API Configuration
const API_BASE = '/api';

// State
let authToken = localStorage.getItem('authToken');
let currentDoctor = JSON.parse(localStorage.getItem('doctor') || 'null');
let selectedMedicine = null;
let customTimes = [];
let debounceTimer = null;

// Utility Functions
function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.style.display = 'block';
    }
}

function hideError(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.style.display = 'none';
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.style.display = 'flex';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function apiRequest(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
}

// Check Auth & Redirect
function checkAuthAndRedirect() {
    const isLoginPage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');

    if (authToken && currentDoctor) {
        if (isLoginPage) {
            window.location.href = '/dashboard.html';
        }
    } else {
        if (!isLoginPage) {
            window.location.href = '/';
        }
    }
}

// Login Page Functions
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterLink = document.getElementById('showRegister');
    const closeRegisterBtn = document.getElementById('closeRegister');
    const registerModal = document.getElementById('registerModal');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError('loginError');

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const data = await apiRequest('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });

                authToken = data.token;
                currentDoctor = data.doctor;
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('doctor', JSON.stringify(currentDoctor));

                window.location.href = '/dashboard.html';
            } catch (error) {
                showError('loginError', error.message);
            }
        });
    }

    if (showRegisterLink && registerModal) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerModal.style.display = 'flex';
        });
    }

    if (closeRegisterBtn && registerModal) {
        closeRegisterBtn.addEventListener('click', () => {
            registerModal.style.display = 'none';
        });

        registerModal.addEventListener('click', (e) => {
            if (e.target === registerModal) {
                registerModal.style.display = 'none';
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError('registerError');

            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;

            try {
                const data = await apiRequest('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password })
                });

                authToken = data.token;
                currentDoctor = data.doctor;
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('doctor', JSON.stringify(currentDoctor));

                window.location.href = '/dashboard.html';
            } catch (error) {
                showError('registerError', error.message);
            }
        });
    }
}

// Dashboard Page Functions
function initDashboardPage() {
    // Set doctor name
    const doctorNameEl = document.getElementById('doctorName');
    if (doctorNameEl && currentDoctor) {
        doctorNameEl.textContent = currentDoctor.name;
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('doctor');
            window.location.href = '/';
        });
    }

    // Medicine Search with Debouncing
    const medicineSearch = document.getElementById('medicineSearch');
    const medicineDropdown = document.getElementById('medicineDropdown');

    if (medicineSearch && medicineDropdown) {
        medicineSearch.addEventListener('input', (e) => {
            const query = e.target.value.trim();

            // Clear previous timer
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }

            if (query.length < 1) {
                medicineDropdown.style.display = 'none';
                return;
            }

            // Debounce - wait 300ms after user stops typing
            debounceTimer = setTimeout(async () => {
                try {
                    const medicines = await apiRequest(`/medicines/search?query=${encodeURIComponent(query)}`);
                    renderMedicineDropdown(medicines);
                } catch (error) {
                    console.error('Medicine search error:', error);
                }
            }, 300);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!medicineSearch.contains(e.target) && !medicineDropdown.contains(e.target)) {
                medicineDropdown.style.display = 'none';
            }
        });
    }

    // Remove selected medicine
    const selectedMedicineEl = document.getElementById('selectedMedicine');
    if (selectedMedicineEl) {
        selectedMedicineEl.querySelector('.remove-medicine')?.addEventListener('click', () => {
            selectedMedicine = null;
            document.getElementById('selectedMedicineId').value = '';
            selectedMedicineEl.style.display = 'none';
            document.getElementById('medicineSearch').value = '';
        });
    }

    // Add Custom Time
    const addCustomTimeBtn = document.getElementById('addCustomTime');
    if (addCustomTimeBtn) {
        addCustomTimeBtn.addEventListener('click', () => {
            addCustomTimeInput();
        });
    }

    // Prescription Form Submit
    const prescriptionForm = document.getElementById('prescriptionForm');
    if (prescriptionForm) {
        prescriptionForm.addEventListener('submit', handlePrescriptionSubmit);
    }

    // Refresh Prescriptions
    const refreshBtn = document.getElementById('refreshPrescriptions');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadPrescriptions);
    }

    // Load prescriptions on page load
    loadPrescriptions();
}

function renderMedicineDropdown(medicines) {
    const dropdown = document.getElementById('medicineDropdown');

    if (medicines.length === 0) {
        dropdown.innerHTML = '<div class="dropdown-item"><span class="medicine-info">No medicines found</span></div>';
        dropdown.style.display = 'block';
        return;
    }

    dropdown.innerHTML = medicines.map(med => `
    <div class="dropdown-item" data-id="${med.id}" data-name="${med.name}" data-dosage="${med.dosage}" data-type="${med.type}">
      <span class="medicine-name">${med.name}</span>
      <span class="medicine-info">${med.dosage} - ${med.type}${med.manufacturer ? ` • ${med.manufacturer}` : ''}</span>
    </div>
  `).join('');

    dropdown.style.display = 'block';

    // Add click handlers
    dropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            selectMedicine({
                id: item.dataset.id,
                name: item.dataset.name,
                dosage: item.dataset.dosage,
                type: item.dataset.type
            });
        });
    });
}

function selectMedicine(medicine) {
    selectedMedicine = medicine;
    document.getElementById('selectedMedicineId').value = medicine.id;
    document.getElementById('medicineSearch').value = '';
    document.getElementById('medicineDropdown').style.display = 'none';

    const selectedEl = document.getElementById('selectedMedicine');
    selectedEl.querySelector('.medicine-name').textContent = medicine.name;
    selectedEl.querySelector('.medicine-dosage').textContent = `${medicine.dosage} - ${medicine.type}`;
    selectedEl.style.display = 'flex';
}

function addCustomTimeInput(value = '') {
    const list = document.getElementById('customTimesList');
    const id = Date.now();

    const item = document.createElement('div');
    item.className = 'custom-time-item';
    item.dataset.id = id;
    item.innerHTML = `
    <input type="time" value="${value}" required>
    <button type="button" aria-label="Remove time">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="4" y1="4" x2="12" y2="12"/>
        <line x1="12" y1="4" x2="4" y2="12"/>
      </svg>
    </button>
  `;

    item.querySelector('button').addEventListener('click', () => {
        item.remove();
        customTimes = customTimes.filter(t => t.id !== id);
    });

    item.querySelector('input').addEventListener('change', (e) => {
        const existing = customTimes.find(t => t.id === id);
        if (existing) {
            existing.time = e.target.value;
        } else {
            customTimes.push({ id, time: e.target.value });
        }
    });

    list.appendChild(item);

    if (value) {
        customTimes.push({ id, time: value });
    }
}

async function handlePrescriptionSubmit(e) {
    e.preventDefault();
    hideError('formError');

    const patientId = document.getElementById('patientId').value.trim();
    const patientName = document.getElementById('patientName').value.trim();
    const medicineId = document.getElementById('selectedMedicineId').value;
    const notes = document.getElementById('notes').value.trim();

    // Get selected timings
    const timingCheckboxes = document.querySelectorAll('input[name="timing"]:checked');
    const selectedTimings = Array.from(timingCheckboxes).map(cb => cb.value);

    // Get custom times
    const customTimeInputs = document.querySelectorAll('#customTimesList input[type="time"]');
    const customTimeValues = Array.from(customTimeInputs)
        .map(input => input.value)
        .filter(val => val);

    // Validation
    if (!patientId || !patientName) {
        showError('formError', 'Please enter patient ID and name');
        return;
    }

    if (!medicineId) {
        showError('formError', 'Please select a medicine');
        return;
    }

    if (selectedTimings.length === 0 && customTimeValues.length === 0) {
        showError('formError', 'Please select at least one timing');
        return;
    }

    // Build timings array
    const timings = [
        ...selectedTimings.map(t => ({ timingType: t })),
        ...customTimeValues.map(t => ({ timingType: 'CUSTOM', customTime: t }))
    ];

    try {
        await apiRequest('/prescriptions', {
            method: 'POST',
            body: JSON.stringify({
                patientId,
                patientName,
                medicineId,
                timings,
                notes: notes || undefined
            })
        });

        showToast('Prescription created successfully!');

        // Reset form
        document.getElementById('prescriptionForm').reset();
        selectedMedicine = null;
        customTimes = [];
        document.getElementById('selectedMedicine').style.display = 'none';
        document.getElementById('customTimesList').innerHTML = '';

        // Reload prescriptions
        loadPrescriptions();
    } catch (error) {
        showError('formError', error.message);
    }
}

async function loadPrescriptions() {
    const list = document.getElementById('prescriptionsList');

    try {
        const prescriptions = await apiRequest('/prescriptions');

        if (prescriptions.length === 0) {
            list.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="6" y="6" width="36" height="36" rx="4"/>
            <line x1="6" y1="18" x2="42" y2="18"/>
            <line x1="18" y1="6" x2="18" y2="18"/>
          </svg>
          <p>No prescriptions yet</p>
          <span>Create your first prescription using the form</span>
        </div>
      `;
            return;
        }

        list.innerHTML = prescriptions.map(p => `
      <div class="prescription-item">
        <div class="prescription-header">
          <div>
            <div class="prescription-patient">${p.patient.name}</div>
            <div class="prescription-patient-id">ID: ${p.patient.patientId}</div>
          </div>
          <div class="prescription-date">${formatDate(p.createdAt)}</div>
        </div>
        <div class="prescription-medicine">
          <span class="prescription-medicine-name">${p.medicine.name}</span>
          <span class="prescription-medicine-dosage">${p.medicine.dosage} • ${p.medicine.type}</span>
        </div>
        <div class="prescription-timings">
          ${p.timings.map(t => `
            <span class="timing-tag ${t.timingType === 'CUSTOM' ? 'custom' : ''}">
              ${t.timingType === 'CUSTOM' ? t.customTime : t.timingType.toLowerCase()}
            </span>
          `).join('')}
        </div>
      </div>
    `).join('');
    } catch (error) {
        console.error('Load prescriptions error:', error);
        list.innerHTML = '<div class="empty-state"><p>Failed to load prescriptions</p></div>';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndRedirect();

    const isLoginPage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');

    if (isLoginPage) {
        initLoginPage();
    } else {
        initDashboardPage();
    }
});
