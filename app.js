const DATA_KEYS = {
    vitals: 'pots_vitals',
    symptoms: 'pots_symptoms',
    medications: 'pots_medications',
    medLog: 'pots_med_log',
    emergency: 'pots_emergency'
};

function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getToday() {
    return new Date().toISOString().split('T')[0];
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function triggerEmergency() {
    const contacts = getData(DATA_KEYS.emergency);
    if (contacts.length === 0) {
        alert('⚠ EMERGENCY MODE ACTIVATED\n\nPlease set up emergency contacts in the Reports page.');
        return;
    }
    
    const contact = contacts[0];
    const message = `EMERGENCY ALERT\n\nPrimary Contact: ${contact.contactName}\nPhone: ${contact.contactPhone}\n\nPhysician: ${contact.physicianName}\nPhone: ${contact.physicianPhone}\n\nCall emergency services if needed: 911`;
    
    if (confirm(message + '\n\nCall primary contact now?')) {
        window.location.href = `tel:${contact.contactPhone}`;
    }
}

function updateDashboard() {
    const vitals = getData(DATA_KEYS.vitals);
    const today = getToday();
    const todayVitals = vitals.filter(v => v.date === today);
    
    if (todayVitals.length > 0) {
        const latest = todayVitals[todayVitals.length - 1];
        document.getElementById('currentHR').textContent = latest.heartRate || '--';
        document.getElementById('currentBP').textContent = `${latest.systolic}/${latest.diastolic}`;
        
        const totalSodium = todayVitals.reduce((sum, v) => sum + (parseInt(v.sodium) || 0), 0);
        const totalFluid = todayVitals.reduce((sum, v) => sum + (parseInt(v.fluid) || 0), 0);
        
        document.getElementById('sodiumIntake').textContent = totalSodium;
        document.getElementById('fluidIntake').textContent = totalFluid;
        
        const sodiumPercent = Math.min((totalSodium / 8000) * 100, 100);
        const fluidPercent = Math.min((totalFluid / 2500) * 100, 100);
        
        document.getElementById('sodiumProgress').style.width = sodiumPercent + '%';
        document.getElementById('fluidProgress').style.width = fluidPercent + '%';
    }
}

function loadRecentActivity() {
    const vitals = getData(DATA_KEYS.vitals);
    const symptoms = getData(DATA_KEYS.symptoms);
    const medLog = getData(DATA_KEYS.medLog);
    
    let activities = [];
    
    vitals.slice(-5).forEach(v => {
        activities.push({
            time: new Date(v.timestamp),
            text: `Vitals logged: HR ${v.heartRate}, BP ${v.systolic}/${v.diastolic}`
        });
    });
    
    symptoms.slice(-5).forEach(s => {
        activities.push({
            time: new Date(s.timestamp),
            text: `Symptoms logged`
        });
    });
    
    medLog.slice(-5).forEach(m => {
        activities.push({
            time: new Date(m.timestamp),
            text: `Took ${m.name}`
        });
    });
    
    activities.sort((a, b) => b.time - a.time);
    activities = activities.slice(0, 5);
    
    const listEl = document.getElementById('activityList');
    if (activities.length === 0) {
        listEl.innerHTML = '<div class="activity-item">No recent activity</div>';
        return;
    }
    
    listEl.innerHTML = activities.map(a => `
        <div class="activity-item">
            <div class="activity-time">${formatTime(a.time)}</div>
            <div class="activity-text">${a.text}</div>
        </div>
    `).join('');
}

function quickLog(type) {
    if (type === 'vitals') {
        window.location.href = 'vitals.html';
    } else if (type === 'symptom') {
        window.location.href = 'symptoms.html';
    } else if (type === 'medication') {
        window.location.href = 'medications.html';
    } else if (type === 'water') {
        const vitals = getData(DATA_KEYS.vitals);
        vitals.push({
            timestamp: new Date().toISOString(),
            date: getToday(),
            position: 'sitting',
            heartRate: 0,
            systolic: 0,
            diastolic: 0,
            sodium: 0,
            fluid: 250
        });
        setData(DATA_KEYS.vitals, vitals);
        alert('Added 250ml of water!');
        updateDashboard();
        loadRecentActivity();
    }
}

function saveVitals() {
    const vitals = getData(DATA_KEYS.vitals);
    
    const entry = {
        timestamp: new Date().toISOString(),
        date: getToday(),
        position: document.getElementById('position').value,
        heartRate: parseInt(document.getElementById('heartRate').value),
        systolic: parseInt(document.getElementById('systolic').value),
        diastolic: parseInt(document.getElementById('diastolic').value),
        sodium: parseInt(document.getElementById('sodium').value) || 0,
        fluid: parseInt(document.getElementById('fluid').value) || 0
    };
    
    vitals.push(entry);
    setData(DATA_KEYS.vitals, vitals);
    
    document.getElementById('vitalsForm').reset();
    alert('Vitals saved successfully!');
    loadVitalsHistory();
}

function loadVitalsHistory() {
    const vitals = getData(DATA_KEYS.vitals);
    const today = getToday();
    const todayVitals = vitals.filter(v => v.date === today);
    
    const historyEl = document.getElementById('vitalsHistory');
    if (todayVitals.length === 0) {
        historyEl.innerHTML = '<div class="no-data">No vitals logged today</div>';
        return;
    }
    
    historyEl.innerHTML = todayVitals.reverse().map(v => `
        <div class="history-item">
            <div class="history-time">${formatTime(v.timestamp)}</div>
            <div class="history-data">
                <div class="data-point">
                    <span class="data-label">Position</span>
                    <span class="data-value">${v.position}</span>
                </div>
                <div class="data-point">
                    <span class="data-label">HR</span>
                    <span class="data-value">${v.heartRate} BPM</span>
                </div>
                <div class="data-point">
                    <span class="data-label">BP</span>
                    <span class="data-value">${v.systolic}/${v.diastolic}</span>
                </div>
                ${v.sodium > 0 ? `
                <div class="data-point">
                    <span class="data-label">Sodium</span>
                    <span class="data-value">${v.sodium}mg</span>
                </div>` : ''}
                ${v.fluid > 0 ? `
                <div class="data-point">
                    <span class="data-label">Fluid</span>
                    <span class="data-value">${v.fluid}ml</span>
                </div>` : ''}
            </div>
        </div>
    `).join('');
}

let orthoTestStep = 0;
let orthoData = {};

function startOrthoTest() {
    orthoTestStep = 1;
    showOrthoStep();
}

function showOrthoStep() {
    const testEl = document.getElementById('orthoTest');
    
    if (orthoTestStep === 1) {
        testEl.innerHTML = `
            <div class="test-step">
                <div class="step-number">1</div>
                <div class="step-content">
                    <h3>LYING DOWN - ENTER HEART RATE</h3>
                    <input type="number" id="lyingHR" class="form-input" placeholder="Heart Rate">
                    <button class="btn-secondary" onclick="saveOrthoLying()" style="margin-top: 1rem;">NEXT</button>
                </div>
            </div>
        `;
    } else if (orthoTestStep === 2) {
        testEl.innerHTML = `
            <div class="test-step">
                <div class="step-number">2</div>
                <div class="step-content">
                    <h3>STAND UP - WAIT 1 MINUTE</h3>
                    <p>Stand up and wait for 1 minute, then enter your heart rate</p>
                    <input type="number" id="standingHR" class="form-input" placeholder="Heart Rate">
                    <button class="btn-secondary" onclick="saveOrthoStanding()" style="margin-top: 1rem;">COMPLETE TEST</button>
                </div>
            </div>
        `;
    } else if (orthoTestStep === 3) {
        const increase = orthoData.standing - orthoData.lying;
        const isPOTS = increase >= 30;
        
        testEl.innerHTML = `
            <div class="test-step">
                <div class="step-number">✓</div>
                <div class="step-content">
                    <h3>TEST COMPLETE</h3>
                    <p>Lying HR: ${orthoData.lying} BPM</p>
                    <p>Standing HR: ${orthoData.standing} BPM</p>
                    <p><strong>Increase: ${increase} BPM</strong></p>
                    <p style="color: ${isPOTS ? '#CC0000' : '#4CAF50'}; font-weight: bold;">
                        ${isPOTS ? 'Meets POTS criteria (≥30 BPM increase)' : 'Normal response'}
                    </p>
                    <button class="btn-secondary" onclick="startOrthoTest()" style="margin-top: 1rem;">NEW TEST</button>
                </div>
            </div>
        `;
        
        const vitals = getData(DATA_KEYS.vitals);
        vitals.push({
            timestamp: new Date().toISOString(),
            date: getToday(),
            position: 'lying',
            heartRate: orthoData.lying,
            systolic: 0,
            diastolic: 0,
            sodium: 0,
            fluid: 0
        });
        vitals.push({
            timestamp: new Date().toISOString(),
            date: getToday(),
            position: 'standing',
            heartRate: orthoData.standing,
            systolic: 0,
            diastolic: 0,
            sodium: 0,
            fluid: 0
        });
        setData(DATA_KEYS.vitals, vitals);
    }
}

function saveOrthoLying() {
    const hr = parseInt(document.getElementById('lyingHR').value);
    if (!hr) {
        alert('Please enter heart rate');
        return;
    }
    orthoData.lying = hr;
    orthoTestStep = 2;
    showOrthoStep();
}

function saveOrthoStanding() {
    const hr = parseInt(document.getElementById('standingHR').value);
    if (!hr) {
        alert('Please enter heart rate');
        return;
    }
    orthoData.standing = hr;
    orthoTestStep = 3;
    showOrthoStep();
}

const symptomValues = {};

function initSymptomButtons() {
    const buttons = document.querySelectorAll('.severity-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.symptom-card');
            const symptom = card.dataset.symptom;
            const value = parseInt(this.dataset.value);
            
            card.querySelectorAll('.severity-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            symptomValues[symptom] = value;
        });
    });
}

function saveSymptoms() {
    const symptoms = getData(DATA_KEYS.symptoms);
    
    const entry = {
        timestamp: new Date().toISOString(),
        date: getToday(),
        symptoms: { ...symptomValues },
        notes: document.getElementById('symptomNotes').value
    };
    
    symptoms.push(entry);
    setData(DATA_KEYS.symptoms, symptoms);
    
    document.querySelectorAll('.severity-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('symptomNotes').value = '';
    Object.keys(symptomValues).forEach(key => delete symptomValues[key]);
    
    alert('Symptoms saved successfully!');
    loadSymptomHistory();
}

function loadSymptomHistory() {
    const symptoms = getData(DATA_KEYS.symptoms);
    const today = getToday();
    const todaySymptoms = symptoms.filter(s => s.date === today);
    
    const historyEl = document.getElementById('symptomHistory');
    if (todaySymptoms.length === 0) {
        historyEl.innerHTML = '<div class="no-data">No symptoms logged today</div>';
        return;
    }
    
    historyEl.innerHTML = todaySymptoms.reverse().map(s => {
        const symptomList = Object.entries(s.symptoms)
            .filter(([, value]) => value > 0)
            .map(([name, value]) => `${name}: ${value}/5`)
            .join(', ');
        
        return `
            <div class="history-item">
                <div class="history-time">${formatTime(s.timestamp)}</div>
                <div class="history-data">
                    <div class="data-point">
                        <span class="data-label">Symptoms</span>
                        <span class="data-value">${symptomList || 'None'}</span>
                    </div>
                    ${s.notes ? `
                    <div class="data-point">
                        <span class="data-label">Notes</span>
                        <span class="data-value">${s.notes}</span>
                    </div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function addMedication() {
    const medications = getData(DATA_KEYS.medications);
    
    const med = {
        id: Date.now(),
        name: document.getElementById('medName').value,
        dosage: document.getElementById('medDosage').value,
        frequency: document.getElementById('medFrequency').value,
        times: document.getElementById('medTimes').value
    };
    
    medications.push(med);
    setData(DATA_KEYS.medications, medications);
    
    document.getElementById('medicationForm').reset();
    alert('Medication added successfully!');
    loadMedications();
}

function loadMedications() {
    const medications = getData(DATA_KEYS.medications);
    
    const todayEl = document.getElementById('todayMeds');
    const allEl = document.getElementById('allMeds');
    
    if (medications.length === 0) {
        todayEl.innerHTML = '<div class="no-data">No medications scheduled for today</div>';
        allEl.innerHTML = '<div class="no-data">No medications added yet</div>';
        return;
    }
    
    const medHTML = medications.map(m => `
        <div class="medication-item">
            <div class="med-info">
                <h3>${m.name}</h3>
                <div class="med-details">${m.dosage} - ${m.frequency}</div>
                <div class="med-details">${m.times}</div>
            </div>
            <div class="med-actions">
                <button class="btn-small btn-take" onclick="takeMedication(${m.id}, '${m.name}')">TAKE</button>
                <button class="btn-small btn-delete" onclick="deleteMedication(${m.id})">DELETE</button>
            </div>
        </div>
    `).join('');
    
    todayEl.innerHTML = medHTML;
    allEl.innerHTML = medHTML;
}

function takeMedication(id, name) {
    const medLog = getData(DATA_KEYS.medLog);
    
    medLog.push({
        id: id,
        name: name,
        timestamp: new Date().toISOString(),
        date: getToday()
    });
    
    setData(DATA_KEYS.medLog, medLog);
    alert(`Logged: ${name} taken`);
    loadMedicationLog();
}

function deleteMedication(id) {
    if (!confirm('Delete this medication?')) return;
    
    const medications = getData(DATA_KEYS.medications);
    const filtered = medications.filter(m => m.id !== id);
    setData(DATA_KEYS.medications, filtered);
    loadMedications();
}

function loadMedicationLog() {
    const medLog = getData(DATA_KEYS.medLog);
    const today = getToday();
    const todayLog = medLog.filter(m => m.date === today);
    
    const logEl = document.getElementById('medLog');
    if (todayLog.length === 0) {
        logEl.innerHTML = '<div class="no-data">No medications taken today</div>';
        return;
    }
    
    logEl.innerHTML = todayLog.reverse().map(m => `
        <div class="history-item">
            <div class="history-time">${formatTime(m.timestamp)}</div>
            <div class="history-data">
                <div class="data-point">
                    <span class="data-label">Medication</span>
                    <span class="data-value">${m.name}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function loadWeeklySummary() {
    const vitals = getData(DATA_KEYS.vitals);
    const symptoms = getData(DATA_KEYS.symptoms);
    const medLog = getData(DATA_KEYS.medLog);
    const medications = getData(DATA_KEYS.medications);
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekVitals = vitals.filter(v => new Date(v.timestamp) >= weekAgo);
    
    if (weekVitals.length > 0) {
        const avgHR = Math.round(weekVitals.reduce((sum, v) => sum + v.heartRate, 0) / weekVitals.length);
        const avgSys = Math.round(weekVitals.reduce((sum, v) => sum + v.systolic, 0) / weekVitals.length);
        const avgDia = Math.round(weekVitals.reduce((sum, v) => sum + v.diastolic, 0) / weekVitals.length);
        
        document.getElementById('avgHR').textContent = avgHR;
        document.getElementById('avgBP').textContent = `${avgSys}/${avgDia}`;
    }
    
    const weekSymptoms = symptoms.filter(s => new Date(s.timestamp) >= weekAgo);
    const symptomDays = new Set(weekSymptoms.map(s => s.date)).size;
    document.getElementById('symptomDays').textContent = symptomDays;
    
    if (medications.length > 0) {
        const weekLog = medLog.filter(m => new Date(m.timestamp) >= weekAgo);
        const expectedDoses = medications.length * 7;
        const actualDoses = weekLog.length;
        const adherence = Math.round((actualDoses / expectedDoses) * 100);
        document.getElementById('medAdherence').textContent = adherence + '%';
    }
}

function setDefaultDates() {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    document.getElementById('endDate').value = today.toISOString().split('T')[0];
    document.getElementById('startDate').value = weekAgo.toISOString().split('T')[0];
}

function generateReport() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        alert('Please select start and end dates');
        return;
    }
    
    const vitals = getData(DATA_KEYS.vitals);
    const symptoms = getData(DATA_KEYS.symptoms);
    const medLog = getData(DATA_KEYS.medLog);
    
    const filtered = {
        vitals: vitals.filter(v => v.date >= startDate && v.date <= endDate),
        symptoms: symptoms.filter(s => s.date >= startDate && s.date <= endDate),
        medLog: medLog.filter(m => m.date >= startDate && m.date <= endDate)
    };
    
    let report = `POTS HEALTH REPORT\n`;
    report += `Period: ${formatDate(startDate)} to ${formatDate(endDate)}\n`;
    report += `Generated: ${formatDate(new Date())}\n\n`;
    
    report += `VITAL SIGNS SUMMARY\n`;
    report += `Total Readings: ${filtered.vitals.length}\n`;
    if (filtered.vitals.length > 0) {
        const avgHR = Math.round(filtered.vitals.reduce((sum, v) => sum + v.heartRate, 0) / filtered.vitals.length);
        const avgSys = Math.round(filtered.vitals.reduce((sum, v) => sum + v.systolic, 0) / filtered.vitals.length);
        const avgDia = Math.round(filtered.vitals.reduce((sum, v) => sum + v.diastolic, 0) / filtered.vitals.length);
        report += `Average HR: ${avgHR} BPM\n`;
        report += `Average BP: ${avgSys}/${avgDia} mmHg\n`;
    }
    
    report += `\nSYMPTOMS\n`;
    report += `Total Symptom Logs: ${filtered.symptoms.length}\n`;
    
    report += `\nMEDICATIONS\n`;
    report += `Doses Taken: ${filtered.medLog.length}\n`;
    
    alert(report);
}

function exportToCSV() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        alert('Please select start and end dates');
        return;
    }
    
    const vitals = getData(DATA_KEYS.vitals);
    const filtered = vitals.filter(v => v.date >= startDate && v.date <= endDate);
    
    if (filtered.length === 0) {
        alert('No data to export for selected period');
        return;
    }
    
    let csv = 'Date,Time,Position,Heart Rate,Systolic,Diastolic,Sodium,Fluid\n';
    
    filtered.forEach(v => {
        csv += `${v.date},${formatTime(v.timestamp)},${v.position},${v.heartRate},${v.systolic},${v.diastolic},${v.sodium},${v.fluid}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pots_data_${startDate}_to_${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function saveEmergencyContacts() {
    const contacts = [{
        contactName: document.getElementById('contactName').value,
        contactPhone: document.getElementById('contactPhone').value,
        physicianName: document.getElementById('physicianName').value,
        physicianPhone: document.getElementById('physicianPhone').value
    }];
    
    setData(DATA_KEYS.emergency, contacts);
    alert('Emergency contacts saved!');
}

function loadEmergencyContacts() {
    const contacts = getData(DATA_KEYS.emergency);
    if (contacts.length > 0) {
        const contact = contacts[0];
        document.getElementById('contactName').value = contact.contactName || '';
        document.getElementById('contactPhone').value = contact.contactPhone || '';
        document.getElementById('physicianName').value = contact.physicianName || '';
        document.getElementById('physicianPhone').value = contact.physicianPhone || '';
    }
}

function backupData() {
    const allData = {
        vitals: getData(DATA_KEYS.vitals),
        symptoms: getData(DATA_KEYS.symptoms),
        medications: getData(DATA_KEYS.medications),
        medLog: getData(DATA_KEYS.medLog),
        emergency: getData(DATA_KEYS.emergency),
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pots_backup_${getToday()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function restoreData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm('This will replace all current data. Continue?')) {
                setData(DATA_KEYS.vitals, data.vitals || []);
                setData(DATA_KEYS.symptoms, data.symptoms || []);
                setData(DATA_KEYS.medications, data.medications || []);
                setData(DATA_KEYS.medLog, data.medLog || []);
                setData(DATA_KEYS.emergency, data.emergency || []);
                
                alert('Data restored successfully!');
                window.location.reload();
            }
        } catch (error) {
            alert('Error restoring data. Please check the file.');
        }
    };
    reader.readAsText(file);
}

function clearAllData() {
    if (!confirm('This will delete ALL data permanently. Are you sure?')) return;
    if (!confirm('Really delete everything? This cannot be undone!')) return;
    
    Object.values(DATA_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
    
    alert('All data cleared');
    window.location.reload();
}