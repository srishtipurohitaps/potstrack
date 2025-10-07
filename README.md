# POTSTrack - POTS Management Application

A comprehensive web-based health tracking application designed specifically for patients with Postural Orthostatic Tachycardia Syndrome (POTS). Built with vanilla HTML, CSS, and JavaScript. 

## Overview

POTSTrack helps POTS patients monitor vital signs, track symptoms, manage medications, and generate medical reports for healthcare providers. The application features a clean, professional medical interface with a red theme and accessibility-first design principles.

## Features

### Dashboard (index.html)
- Real-time vital signs overview (Heart Rate, Blood Pressure)
- Daily sodium and fluid intake tracking with progress bars
- Quick action buttons for rapid data entry
- Recent activity feed showing latest logs
- Emergency button for immediate access to contacts

### Vitals Tracking (vitals.html)
- Manual vital signs entry (HR, BP, sodium, fluid intake)
- Position tracking (lying, sitting, standing)
- Orthostatic test with automatic POTS detection (≥30 BPM increase)
- Today's vitals history with timestamp
- Real-time data validation

### Symptom Management (symptoms.html)
- Track 6 core POTS symptoms:
  - Dizziness
  - Brain Fog
  - Fatigue
  - Palpitations
  - Nausea
  - Weakness
- Severity rating scale (0-5)
- Optional notes for triggers and patterns
- Symptom history log

### Medication Management (medications.html)
- Add medications with dosage and frequency
- Quick "TAKE" buttons for medication logging
- Today's medication schedule display
- Medication adherence tracking
- Delete medications option
- Complete medication log

### Reports & Data (reports.html)
- Generate medical reports with date range selection
- Export data to CSV for doctor appointments
- Weekly health summary with averages
- Medication adherence percentage
- Emergency contact management
- Full data backup to JSON
- Data restore from backup
- Clear all data option

## Technical Specifications

### File Structure
```
POTSTrack/
├── index.html          # Main dashboard
├── vitals.html         # Vital signs tracking
├── symptoms.html       # Symptom logging
├── medications.html    # Medication management
├── reports.html        # Reports and data export
├── styles.css          # Shared stylesheet
└── app.js             # Shared JavaScript functions
```

### Technology Stack
- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Storage**: Browser localStorage API
- **No Dependencies**: No frameworks or libraries required
- **Offline-First**: Works without internet connection

### Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with localStorage support

## Usage Guide

### First Time Setup
1. Navigate to Reports page
2. Add emergency contact information
3. Add your medications in Medications page
4. Start logging vitals and symptoms

### Daily Workflow
1. Log morning vitals (lying and standing HR)
2. Track sodium and fluid intake throughout day
3. Log symptoms as they occur
4. Mark medications as taken
5. Review dashboard for daily summary

### Orthostatic Test
1. Go to Vitals page
2. Click "START TEST"
3. Lie down for 5 minutes, enter heart rate
4. Stand up, wait 1 minute, enter heart rate
5. View automatic POTS detection results

### Exporting Data for Doctors
1. Go to Reports page
2. Select date range
3. Click "EXPORT TO CSV"
4. Share file with healthcare provider

### Data Backup
1. Go to Reports page
2. Click "BACKUP DATA"
3. Save JSON file to safe location
4. Use "RESTORE DATA" to import if needed

## Data Storage

All data is stored locally in your browser using localStorage:
- `pots_vitals` - Vital signs records
- `pots_symptoms` - Symptom logs
- `pots_medications` - Medication list
- `pots_med_log` - Medication adherence log
- `pots_emergency` - Emergency contacts

**Important**: Data is device-specific. Use backup feature to transfer between devices.

## Privacy & Security

- All data stored locally on your device
- No data transmitted to external servers
- No tracking or analytics
- Export and delete data at any time

## Design Philosophy

### Color Scheme
- **Deep Red (#880000)**: Navigation and headers
- **Primary Red (#CC0000)**: Main actions and data values
- **Accent Red (#FF4444)**: Interactive elements
- **Emergency Red (#FF0000)**: Emergency button
- **White/Gray**: Backgrounds and text for clarity

### Layout Principles
- Card-based information organization
- Grid layouts for data density
- Large touch targets (44px minimum)
- Clear visual separation between sections
- Responsive design for mobile and desktop
- Brain fog-friendly interface
- Quick symptom logging during episodes
- Medical report generation
- Emergency preparedness

---

**Remember**: This tool complements but does not replace professional medical care. Always work with a healthcare provider for POTS management.
