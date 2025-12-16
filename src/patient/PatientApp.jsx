import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../backend/firebase';
import './patient.css';

const iconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const ICONS = {
  profile: (
    <svg {...iconProps}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  ),
  hospitals: (
    <svg {...iconProps}>
      <path d="M4 21V7l8-4 8 4v14" />
      <path d="M9 21v-5h6v5" />
      <path d="M12 8v4" />
      <path d="M10 10h4" />
    </svg>
  ),
  doctors: (
    <svg {...iconProps}>
      <path d="M8 3v7a4 4 0 0 0 8 0V3" />
      <path d="M5 21h14" />
      <path d="M12 14v7" />
      <path d="M9 18h6" />
    </svg>
  ),
  booking: (
    <svg {...iconProps}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 11h18" />
      <path d="M8 15h2" />
      <path d="M12 15h2" />
    </svg>
  ),
  history: (
    <svg {...iconProps}>
      <path d="M7 3h10l1 4H6z" />
      <path d="M6 7h12v11a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" />
      <path d="M10 12h4" />
      <path d="M10 16h3" />
    </svg>
  ),
  notifications: (
    <svg {...iconProps}>
      <path d="M18 8a6 6 0 0 0-12 0c0 6-3 8-3 8h18s-3-2-3-8" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  chat: (
    <svg {...iconProps}>
      <path d="M4 4h16v10a4 4 0 0 1-4 4H9l-5 5z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </svg>
  ),
  location: (
    <svg {...iconProps}>
      <path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  rating: (
    <svg {...iconProps}>
      <path d="M12 4l2.35 4.76 5.27.77-3.81 3.7.9 5.25L12 16.9 7.29 18.5l.9-5.25-3.81-3.7 5.27-.77z" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { id: 'profile', label: 'Profile', icon: 'profile' },
  { id: 'hospitals', label: 'Hospitals', icon: 'hospitals' },
  { id: 'doctors', label: 'Doctors', icon: 'doctors' },
  { id: 'booking', label: 'Book Appointment', icon: 'booking' },
  { id: 'history', label: 'History & Notifications', icon: 'history' },
];

const PATIENT = {
  name: 'Ananya Singh',
  age: 32,
  gender: 'Female',
  address: 'HSR Layout, Bengaluru',
  email: 'ananya.singh@email.com',
  phone: '+91 99452 23145',
};

const FALLBACK_HOSPITALS = [
  { id: 'h-1', name: 'Lotus Care Hospital', location: 'Chennai', services: ['Cardiology', 'Tele-ICU'], rating: 4.7, contact: '+91 90234 12345', hours: 'Open · Closes 11 PM' },
  { id: 'h-2', name: 'Sunrise Multispeciality', location: 'Bengaluru', services: ['Neurology', 'Pediatrics', 'Diagnostics'], rating: 4.8, contact: '+91 99887 56231', hours: 'Open · Closes 10 PM' },
  { id: 'h-3', name: 'Riverfront Health', location: 'Pune', services: ['Oncology', 'Tele-OPD'], rating: 4.6, contact: '+91 90000 45236', hours: 'Open · Closes 9 PM' },
];

const APPOINTMENTS = [
  { id: 'ap-1', doctor: 'Dr. Kavya Narayanan', hospital: 'Lotus Care Hospital', date: '15 Dec 2025', time: '09:00 AM', status: 'booked' },
  { id: 'ap-2', doctor: 'Dr. Shankar Iyer', hospital: 'Sunrise Multispeciality', date: '11 Dec 2025', time: '01:00 PM', status: 'completed' },
  { id: 'ap-3', doctor: 'Dr. Meera Rahul', hospital: 'Lotus Care Hospital', date: '02 Dec 2025', time: '10:30 AM', status: 'cancelled' },
];

const NOTIFICATIONS = [
  { id: 'n-1', title: 'Upcoming appointment', detail: 'Consult Dr. Kavya on 15 Dec 2025 · 09:00 AM', time: '2 hours ago' },
  { id: 'n-2', title: 'Report uploaded', detail: 'Sunrise Lab shared your MRI reports', time: 'Yesterday' },
  { id: 'n-3', title: 'Feedback reminder', detail: 'Rate your experience with Dr. Meera Rahul', time: '3 days ago' },
];

export default function PatientApp({ role = 'patient' }) {
  const [activeNav, setActiveNav] = useState('profile');
  const [profileForm, setProfileForm] = useState(PATIENT);
  const [hospitals, setHospitals] = useState(FALLBACK_HOSPITALS);
  const [hospitalStatus, setHospitalStatus] = useState({ loading: true, error: '' });
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [doctorsStatus, setDoctorsStatus] = useState({ loading: true, error: '' });
  const [doctorHospitalFilter, setDoctorHospitalFilter] = useState('all');
  const [doctorSpecFilter, setDoctorSpecFilter] = useState('all');
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingData, setBookingData] = useState({ hospital: '', doctor: '', date: '', slot: '' });

  useEffect(() => {
    async function loadHospitals() {
      try {
        const snapshot = await getDocs(collection(db, 'adminHospitals'));
        if (snapshot.empty) {
          setHospitals(FALLBACK_HOSPITALS);
          setHospitalStatus({
            loading: false,
            error: 'No hospitals found yet. Showing sample hospitals.',
          });
          return;
        }

        const items = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data() || {};
          const services =
            Array.isArray(data.services) && data.services.length > 0
              ? data.services
              : typeof data.services === 'string'
                ? data.services
                    .split(',')
                    .map((svc) => svc.trim())
                    .filter(Boolean)
                : [];

          return {
            id: docSnapshot.id,
            name: data.name || 'Unnamed Hospital',
            location: data.location || 'Not specified',
            services,
            rating: data.rating ?? 4.5,
            contact: data.phone || data.contact || '',
            hours: data.timings || 'Timings will be updated soon.',
          };
        });

        setHospitals(items);
        setHospitalStatus({ loading: false, error: '' });
      } catch (error) {
        console.error('Failed to load hospitals for patient dashboard', error);
        setHospitals(FALLBACK_HOSPITALS);
        setHospitalStatus({
          loading: false,
          error: 'Unable to load hospitals from server. Showing sample hospitals.',
        });
      }
    }

    loadHospitals();
  }, []);

  const filteredHospitals = useMemo(
    () =>
      hospitals.filter(
        (hospital) =>
          hospital.name.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
          hospital.location.toLowerCase().includes(hospitalSearch.toLowerCase())
      ),
    [hospitals, hospitalSearch]
  );

  useEffect(() => {
    async function loadDoctors() {
      try {
        setDoctorsStatus({ loading: true, error: '' });

        const snapshot = await getDocs(collection(db, 'hospitalDoctors'));
        const items = [];

        for (const docSnapshot of snapshot.docs) {
          const data = docSnapshot.data() || {};

          let hospitalName = data.hospitalName || data.hospital || '';

          if (!hospitalName && data.hospitalId) {
            try {
              const hospitalDoc = await getDoc(doc(db, 'hospitals', data.hospitalId));
              if (hospitalDoc.exists()) {
                const hData = hospitalDoc.data() || {};
                hospitalName = hData.name || hospitalName;
              }
            } catch (error) {
              console.error('Failed to load hospital for doctor', error);
            }
          }

          items.push({
            id: docSnapshot.id,
            ...data,
            hospitalName,
          });
        }

        setDoctors(items);
        setDoctorsStatus({ loading: false, error: '' });
      } catch (error) {
        console.error('Failed to load doctors for patient dashboard', error);
        setDoctorsStatus({ loading: false, error: 'Unable to load doctors. Please try again later.' });
      }
    }

    loadDoctors();
  }, []);

  const doctorSpecializations = useMemo(() => {
    const specs = new Set();
    doctors.forEach((doctor) => {
      if (doctor.specialization) {
        specs.add(doctor.specialization);
      }
    });
    return Array.from(specs);
  }, [doctors]);

  const doctorHospitals = useMemo(() => {
    // Build unique hospital list for doctors, preferring names coming from the hospitals collection
    const namesById = new Map();

    doctors.forEach((doctor) => {
      if (doctor.hospitalId) {
        const fromHospitals = hospitals.find((h) => h.id === doctor.hospitalId);
        const name =
          fromHospitals?.name ||
          doctor.hospitalName ||
          doctor.hospital ||
          '';
        namesById.set(doctor.hospitalId, name);
      }
    });

    return Array.from(namesById.entries()).map(([id, name]) => ({ id, name }));
  }, [doctors, hospitals]);

  const filteredDoctors = useMemo(
    () =>
      doctors.filter((doctor) => {
        const matchesHospital =
          doctorHospitalFilter === 'all' ||
          doctor.hospitalId === doctorHospitalFilter;

        const matchesSpec =
          doctorSpecFilter === 'all' ||
          (doctor.specialization || '').toLowerCase() === doctorSpecFilter.toLowerCase();

        return matchesHospital && matchesSpec;
      }),
    [doctors, doctorHospitalFilter, doctorSpecFilter]
  );

  if (role !== 'patient') {
    return (
      <div className="patient-shell">
        <div className="access-block">
          <h3>Access Restricted</h3>
          <p>This workspace is meant for patients to manage their appointments. Please log in with a patient account or return to the home page.</p>
        </div>
      </div>
    );
  }

  const renderProfile = () => (
    <div className="patient-grid cols-2">
      <div className="patient-card">
        <h3>Profile</h3>
        <div className="profile-bio">
          <div className="profile-bio-item">
            <span>Name</span>
            <strong>{PATIENT.name}</strong>
          </div>
          <div className="profile-bio-item">
            <span>Age</span>
            <strong>{PATIENT.age}</strong>
          </div>
          <div className="profile-bio-item">
            <span>Gender</span>
            <strong>{PATIENT.gender}</strong>
          </div>
          <div className="profile-bio-item">
            <span>Address</span>
            <strong>{PATIENT.address}</strong>
          </div>
        </div>
        <h4>Appointment Timeline</h4>
        <ul className="timeline">
          <li>15 Dec · Cardiologist follow-up · Lotus Care Hospital</li>
          <li>11 Dec · Neurology tele-consult · Sunrise Multispeciality</li>
          <li>02 Dec · OB-GYN visit · Lotus Care Hospital</li>
        </ul>
      </div>
      <div className="patient-card">
        <h3>Update Information</h3>
        <div className="patient-grid">
          <div>
            <label className="form-label">Full name</label>
            <input className="patient-input" value={profileForm.name} onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))} />
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input className="patient-input" value={profileForm.phone} onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))} />
          </div>
          <div>
            <label className="form-label">Address</label>
            <textarea className="patient-textarea" value={profileForm.address} onChange={(event) => setProfileForm((prev) => ({ ...prev, address: event.target.value }))} />
          </div>
          <div className="form-actions">
            <button className="btn-patient-outline" type="button">
              Cancel
            </button>
            <button className="btn-patient-primary" type="button" onClick={() => alert('Profile saved (mock)')}>
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHospitals = () => (
    <div className="patient-card">
      <h3>Discover Hospitals</h3>
      {hospitalStatus.loading && (
        <p style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--patient-muted)' }}>
          Loading hospitals...
        </p>
      )}
      {hospitalStatus.error && !hospitalStatus.loading && (
        <p style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: 'tomato' }}>
          {hospitalStatus.error}
        </p>
      )}
      <input className="patient-input" placeholder="Search by name or city" value={hospitalSearch} onChange={(event) => setHospitalSearch(event.target.value)} />
      <div className="patient-grid cols-2" style={{ marginTop: '1rem' }}>
        {filteredHospitals.map((hospital) => (
          <div key={hospital.id} className="hospital-card">
            <strong>{hospital.name}</strong>
            <span className="tag">
              <span className="tag-icon">{ICONS.location}</span>
              {hospital.location}
            </span>
            <span className="tag">
              <span className="tag-icon">{ICONS.rating}</span>
              {hospital.rating}
            </span>
            <p style={{ margin: '0.5rem 0' }}>
              {Array.isArray(hospital.services) && hospital.services.length > 0
                ? hospital.services.join(' • ')
                : 'Services will be updated soon.'}
            </p>
            <small>{hospital.hours}</small>
            <div className="form-actions" style={{ justifyContent: 'flex-start', marginTop: '0.75rem' }}>
              <button className="btn-patient-outline" onClick={() => alert(`Viewing details for ${hospital.name}`)}>
                View details
              </button>
              <button className="btn-patient-primary" onClick={() => setBookingData((prev) => ({ ...prev, hospital: hospital.name }))}>
                Book here
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDoctors = () => (
    <div className="patient-card">
      <h3>Doctors</h3>

      {doctorsStatus.loading && (
        <p style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--patient-muted)' }}>
          Loading doctors...
        </p>
      )}
      {doctorsStatus.error && !doctorsStatus.loading && (
        <p style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: 'tomato' }}>
          {doctorsStatus.error}
        </p>
      )}

      <div className="patient-grid" style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <label className="form-label">Filter by hospital</label>
          <select
            className="patient-select"
            value={doctorHospitalFilter}
            onChange={(event) => setDoctorHospitalFilter(event.target.value)}
          >
            <option value="all">All hospitals</option>
            {doctorHospitals.map((hospital) => (
              <option key={hospital.id} value={hospital.id}>
                {hospital.name || 'Unnamed hospital'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Filter by specialization</label>
          <select
            className="patient-select"
            value={doctorSpecFilter}
            onChange={(event) => setDoctorSpecFilter(event.target.value)}
          >
            <option value="all">All specializations</option>
            {doctorSpecializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="doctor-list" style={{ marginTop: '0.5rem' }}>
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="doctor-card">
            <strong>{doctor.name || 'Doctor name'}</strong>
            <div className="doctor-meta">
              {(doctor.specialization || 'Specialization not set')}
              {doctor.experience ? ` · ${doctor.experience}` : ''}
            </div>
            <div className="doctor-meta">
              {doctor.hospitalName || doctor.hospital || 'Hospital not specified'}
            </div>
            {doctor.availability && (
              <div className="doctor-meta">Availability: {doctor.availability}</div>
            )}
            {doctor.consultationTimings && (
              <div className="doctor-meta">Timings: {doctor.consultationTimings}</div>
            )}
            <div className="form-actions" style={{ justifyContent: 'flex-start', marginTop: '0.75rem' }}>
              <button
                className="btn-patient-primary"
                type="button"
                onClick={() => {
                  setBookingData((prev) => ({
                    ...prev,
                    hospital: doctor.hospitalName || doctor.hospital || prev.hospital,
                    doctor: doctor.name || prev.doctor,
                  }));
                  setActiveNav('booking');
                  setBookingStep(2);
                }}
              >
                Book appointment
              </button>
            </div>
          </div>
        ))}
        {!doctorsStatus.loading && filteredDoctors.length === 0 && (
          <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--patient-muted)' }}>
            No doctors match the selected filters.
          </p>
        )}
      </div>
    </div>
  );

  const bookingSteps = [
    { label: 'Select hospital', key: 'hospital' },
    { label: 'Select doctor', key: 'doctor' },
    { label: 'Select date & slot', key: 'slot' },
    { label: 'Review & confirm', key: 'review' },
  ];

  const renderBooking = () => (
    <div className="patient-grid cols-2">
      <div className="patient-card">
        <h3>Book Appointment</h3>
        <div className="booking-steps">
          {bookingSteps.map((step, index) => (
            <div key={step.key} className={`booking-step ${bookingStep === index + 1 ? 'active' : ''}`}>
              <span>{index + 1}</span>
              {step.label}
            </div>
          ))}
        </div>
        {bookingStep === 1 && (
          <div className="patient-grid">
            <label className="form-label">Hospital</label>
            <select
              className="patient-select"
              value={bookingData.hospital}
              onChange={(event) => setBookingData((prev) => ({ ...prev, hospital: event.target.value }))}
            >
              <option value="">Select</option>
              {hospitals.map((hospital) => (
                <option key={hospital.id} value={hospital.name}>
                  {hospital.name}
                </option>
              ))}
            </select>
            <div className="form-actions">
              <button className="btn-patient-primary" type="button" disabled={!bookingData.hospital} onClick={() => setBookingStep(2)}>
                Continue
              </button>
            </div>
          </div>
        )}
        {bookingStep === 2 && (
          <div className="patient-grid">
            <label className="form-label">Doctor</label>
            <select className="patient-select" value={bookingData.doctor} onChange={(event) => setBookingData((prev) => ({ ...prev, doctor: event.target.value }))}>
              <option value="">Select</option>
              {DOCTORS.filter((doctor) => !bookingData.hospital || doctor.hospital === bookingData.hospital).map((doctor) => (
                <option key={doctor.id} value={doctor.name}>
                  {doctor.name}
                </option>
              ))}
            </select>
            <div className="form-actions">
              <button className="btn-patient-outline" type="button" onClick={() => setBookingStep(1)}>
                Back
              </button>
              <button className="btn-patient-primary" type="button" disabled={!bookingData.doctor} onClick={() => setBookingStep(3)}>
                Continue
              </button>
            </div>
          </div>
        )}
        {bookingStep === 3 && (
          <div className="patient-grid">
            <label className="form-label">Date</label>
            <input className="patient-input" type="date" value={bookingData.date} onChange={(event) => setBookingData((prev) => ({ ...prev, date: event.target.value }))} />
            <label className="form-label">Slots</label>
            <div className="slot-grid">
              {['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM'].map((slot) => (
                <button key={slot} className={`slot-button ${bookingData.slot === slot ? 'selected' : ''}`} onClick={() => setBookingData((prev) => ({ ...prev, slot }))}>
                  {slot}
                </button>
              ))}
            </div>
            <div className="form-actions">
              <button className="btn-patient-outline" type="button" onClick={() => setBookingStep(2)}>
                Back
              </button>
              <button className="btn-patient-primary" type="button" disabled={!bookingData.date || !bookingData.slot} onClick={() => setBookingStep(4)}>
                Continue
              </button>
            </div>
          </div>
        )}
        {bookingStep === 4 && (
          <div className="patient-grid">
            <div className="profile-bio">
              <div className="profile-bio-item">
                <span>Hospital</span>
                <strong>{bookingData.hospital || '—'}</strong>
              </div>
              <div className="profile-bio-item">
                <span>Doctor</span>
                <strong>{bookingData.doctor || '—'}</strong>
              </div>
              <div className="profile-bio-item">
                <span>Date</span>
                <strong>{bookingData.date || '—'}</strong>
              </div>
              <div className="profile-bio-item">
                <span>Time slot</span>
                <strong>{bookingData.slot || '—'}</strong>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-patient-outline" type="button" onClick={() => setBookingStep(3)}>
                Back
              </button>
              <button
                className="btn-patient-primary"
                type="button"
                onClick={() => {
                  alert('Appointment booked (mock)!');
                  setBookingStep(1);
                  setBookingData({ hospital: '', doctor: '', date: '', slot: '' });
                }}
              >
                Confirm booking
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="patient-card">
        <h3>Booking Tips</h3>
        <ul className="timeline">
          <li>Select your preferred hospital before choosing a doctor.</li>
          <li>Look for slots highlighted in blue for instant confirmation.</li>
          <li>You’ll receive reminders 24 hours and 1 hour before the visit.</li>
        </ul>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="patient-grid cols-2">
      <div className="patient-card">
        <h3>Appointment History</h3>
        <table className="history-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Hospital</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {APPOINTMENTS.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.doctor}</td>
                <td>{appointment.hospital}</td>
                <td>{appointment.date}</td>
                <td>
                  <span className={`status-pill ${appointment.status}`}>{appointment.status}</span>
                </td>
                <td>
                  {appointment.status === 'booked' && (
                    <div className="form-actions" style={{ marginTop: 0 }}>
                      <button className="btn-patient-outline" onClick={() => alert('Reschedule flow')}>
                        Reschedule
                      </button>
                      <button className="btn-patient-outline" onClick={() => alert('Cancel flow')}>
                        Cancel
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="patient-card">
        <h3>Notifications</h3>
        <div className="notification-feed">
          {NOTIFICATIONS.map((notification) => (
            <div key={notification.id} className="notification-item">
              <strong>{notification.title}</strong>
              <p style={{ margin: '0.35rem 0' }}>{notification.detail}</p>
              <small>{notification.time}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderer = {
    profile: renderProfile,
    hospitals: renderHospitals,
    doctors: renderDoctors,
    booking: renderBooking,
    history: renderHistory,
  };

  return (
    <div className="patient-shell">
      <aside className="patient-sidebar">
        <div className="patient-logo">
          <div className="patient-logo-mark">PT</div>
          <div>
            <strong>Patient Desk</strong>
            <p style={{ margin: 0, color: 'var(--patient-muted)' }}>Personalized care hub</p>
          </div>
        </div>
        <nav className="patient-nav">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} className={activeNav === item.id ? 'active' : ''} onClick={() => setActiveNav(item.id)}>
              <span className="patient-nav-icon">{ICONS[item.icon]}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="patient-sidebar-footer">
          <p style={{ margin: 0, color: 'var(--patient-muted)' }}>Assistance</p>
          <strong>Live concierge · 24x7</strong>
        </div>
      </aside>
      <main className="patient-main">
        <div className="patient-topbar">
          <h2>{NAV_ITEMS.find((item) => item.id === activeNav)?.label}</h2>
          <input className="patient-search" placeholder="Search doctors, hospitals, services..." />
          <div className="patient-actions">
            <button className="patient-icon" title="Notifications">
              {ICONS.notifications}
            </button>
            <button className="patient-icon" title="Messages">
              {ICONS.chat}
            </button>
            <button className="btn-patient-outline" onClick={() => (window.location.href = '/')}>
              Home
            </button>
          </div>
        </div>
        <div className="patient-content">{renderer[activeNav]()}</div>
      </main>
    </div>
  );
}
