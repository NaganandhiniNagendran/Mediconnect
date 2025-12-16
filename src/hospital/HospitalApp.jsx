import { useEffect, useMemo, useState } from 'react';
import { collection, doc, getDoc, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../backend/firebase';
import './hospital.css';
import HospitalProfileSection from './sections/HospitalProfileSection';
import HospitalDoctorsSection from './sections/HospitalDoctorsSection';
import HospitalAppointmentsSection from './sections/HospitalAppointmentsSection';

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
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
      <path d="M4 20a8 8 0 0 1 16 0" />
      <path d="M7 4.5C9 2.5 15 2.5 17 4.5" />
    </svg>
  ),
  doctors: (
    <svg {...iconProps}>
      <path d="M7 4v6a4 4 0 0 0 8 0V4" />
      <path d="M5 20h14" />
      <path d="M12 12v8" />
      <path d="M9 16h6" />
    </svg>
  ),
  appointments: (
    <svg {...iconProps}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 11h18" />
      <path d="M8 15h2" />
      <path d="M12 15h2" />
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
      <path d="M4 4h16v9a4 4 0 0 1-4 4H9l-5 5z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </svg>
  ),
};

const NAV = [
  { id: 'profile', label: 'Profile', icon: 'profile' },
  { id: 'doctors', label: 'Doctors', icon: 'doctors' },
  { id: 'appointments', label: 'Appointments', icon: 'appointments' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications' },
];

const DEFAULT_HOSPITAL_PROFILE = {
  name: 'Lotus Care Hospital',
  location: 'Chennai, Tamil Nadu',
  contact: '+91 98450 12345',
  email: 'ops@lotuscare.in',
  services: ['Cardiology', 'OB-GYN', 'Tele-ICU', 'Diagnostics'],
  timings: 'Mon-Sat · 7:00 AM - 11:00 PM',
  ratings: 4.6,
};

const DEFAULT_DOCTORS = [
  {
    id: 'd-1',
    name: 'Dr. Kavya Narayanan',
    specialization: 'Cardiology',
    experience: 12,
    qualification: 'MD, DM',
    workingHours: '09:00 - 17:00',
    appointmentsToday: 8,
  },
  {
    id: 'd-2',
    name: 'Dr. Shankar Iyer',
    specialization: 'Neurology',
    experience: 10,
    qualification: 'MD, DM',
    workingHours: '11:00 - 19:00',
    appointmentsToday: 5,
  },
  {
    id: 'd-3',
    name: 'Dr. Meera Rahul',
    specialization: 'OB-GYN',
    experience: 8,
    qualification: 'MS',
    workingHours: '08:00 - 14:00',
    appointmentsToday: 9,
  },
];

const APPOINTMENTS = [
  {
    id: 'a-1',
    patient: 'Vishal Menon',
    doctor: 'Dr. Kavya Narayanan',
    date: '13 Dec 2025',
    time: '09:00 AM',
    status: 'booked',
  },
  {
    id: 'a-2',
    patient: 'Sahana Rao',
    doctor: 'Dr. Meera Rahul',
    date: '13 Dec 2025',
    time: '10:30 AM',
    status: 'completed',
  },
  {
    id: 'a-3',
    patient: 'Farhan Sheikh',
    doctor: 'Dr. Shankar Iyer',
    date: '13 Dec 2025',
    time: '11:15 AM',
    status: 'booked',
  },
  {
    id: 'a-4',
    patient: 'Anjali Gupta',
    doctor: 'Dr. Kavya Narayanan',
    date: '13 Dec 2025',
    time: '14:00 PM',
    status: 'cancelled',
  },
];

const ALERTS = [
  { id: 'n-1', title: 'New Tele-consult booking', description: 'Patient Kavin booked Dr. Meera for 2 PM slot', timestamp: '2m ago' },
  { id: 'n-2', title: 'Lab update', description: 'Radiology uploaded MRI scans for patient Farhan', timestamp: '20m ago' },
  { id: 'n-3', title: 'Surgery prep reminder', description: 'Team meeting for Dr. Kavya at 5 PM', timestamp: '45m ago' },
];

export default function HospitalApp({ role = 'hospital', hospitalName = 'Lotus Care Hospital' }) {
  const [sessionInfo, setSessionInfo] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.sessionStorage.getItem('hospitalSession');
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error('Failed to read hospital session', error);
      return null;
    }
  });
  const [activeNav, setActiveNav] = useState('profile');
  const [hospitalId, setHospitalId] = useState(null);
  const [doctors, setDoctors] = useState(DEFAULT_DOCTORS);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [appointmentFilter, setAppointmentFilter] = useState({ doctor: 'all', date: '2025-12-13' });
  const [announcements, setAnnouncements] = useState(ALERTS);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', schedule: '', target: 'Doctors', message: '' });
  const [hospitalProfile, setHospitalProfile] = useState(DEFAULT_HOSPITAL_PROFILE);
  const [hospitalStatus, setHospitalStatus] = useState({ loading: true, error: '' });
  const [resolvedHospitalName, setResolvedHospitalName] = useState(hospitalName);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    specialization: '',
    qualification: '',
    experience: '',
    workingHours: '',
  });
  const [doctorStatus, setDoctorStatus] = useState({ saving: false, error: '' });

  const filteredDoctors = useMemo(
    () =>
      (doctors || []).filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
          doctor.specialization.toLowerCase().includes(doctorSearch.toLowerCase())
      ),
    [doctorSearch, doctors]
  );

  const filteredAppointments = useMemo(
    () =>
      APPOINTMENTS.filter(
        (appointment) =>
          (appointmentFilter.doctor === 'all' || appointment.doctor === appointmentFilter.doctor) &&
          (appointmentFilter.date === '' || appointment.date === formatDate(appointmentFilter.date))
      ),
    [appointmentFilter]
  );

  const handleAnnouncementSubmit = (event) => {
    event.preventDefault();
    if (!announcementForm.title.trim()) return;
    setAnnouncements((prev) => [
      { id: crypto.randomUUID(), title: announcementForm.title, description: announcementForm.message || 'Scheduled update', timestamp: announcementForm.schedule ? `Scheduled · ${announcementForm.schedule}` : 'Just now' },
      ...prev,
    ]);
    setAnnouncementForm({ title: '', schedule: '', target: 'Doctors', message: '' });
  };

  useEffect(() => {
    const fetchHospital = async () => {
      if (!sessionInfo) {
        setHospitalStatus({ loading: false, error: 'No hospital workspace found. Please sign in again.' });
        return;
      }

      setHospitalStatus({ loading: true, error: '' });

      try {
        let hospitalDocSnapshot = null;

        if (sessionInfo.hospitalId) {
          const targetDoc = await getDoc(doc(db, 'adminHospitals', sessionInfo.hospitalId));
          if (targetDoc.exists()) {
            hospitalDocSnapshot = targetDoc;
          }
        }

        if (!hospitalDocSnapshot) {
          const hospitalsRef = collection(db, 'adminHospitals');
          const hospitalQuery = query(hospitalsRef, where('email', '==', sessionInfo.email));
          const fallbackSnapshot = await getDocs(hospitalQuery);
          if (!fallbackSnapshot.empty) {
            hospitalDocSnapshot = fallbackSnapshot.docs[0];
          }
        }

        if (!hospitalDocSnapshot || !hospitalDocSnapshot.exists()) {
          setHospitalStatus({ loading: false, error: 'Hospital workspace not found for this account.' });
          return;
        }

        const data = hospitalDocSnapshot.data() || {};
        const formattedServices = Array.isArray(data.services)
          ? data.services
          : typeof data.services === 'string'
            ? data.services.split(',').map((service) => service.trim()).filter(Boolean)
            : DEFAULT_HOSPITAL_PROFILE.services;

        const mergedProfile = {
          ...DEFAULT_HOSPITAL_PROFILE,
          ...data,
          services: formattedServices,
          email: data.email || sessionInfo.email || DEFAULT_HOSPITAL_PROFILE.email,
        };

        setHospitalProfile(mergedProfile);
        setHospitalId(hospitalDocSnapshot.id);
        setResolvedHospitalName(mergedProfile.name || DEFAULT_HOSPITAL_PROFILE.name);
        setHospitalStatus({ loading: false, error: '' });
      } catch (error) {
        console.error('Failed to load hospital workspace', error);
        setHospitalStatus({ loading: false, error: 'Unable to load hospital workspace. Please refresh.' });
      }
    };

    fetchHospital();
  }, [sessionInfo]);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!hospitalId) return;

      try {
        const doctorsRef = collection(db, 'hospitalDoctors');
        const doctorsQuery = query(doctorsRef, where('hospitalId', '==', hospitalId));
        const snapshot = await getDocs(doctorsQuery);

        const fetchedDoctors = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data() || {};
          return {
            id: docSnapshot.id,
            name: data.name || '',
            specialization: data.specialization || '',
            qualification: data.qualification || '',
            experience: typeof data.experience === 'number' ? data.experience : parseInt(data.experience || '0', 10) || 0,
            workingHours: data.workingHours || '',
            appointmentsToday: typeof data.appointmentsToday === 'number' ? data.appointmentsToday : 0,
          };
        });

        setDoctors(fetchedDoctors.length ? fetchedDoctors : []);
      } catch (error) {
        console.error('Failed to load doctors for hospital', error);
      }
    };

    fetchDoctors();
  }, [hospitalId]);

  const handleDoctorFormChange = (field, value) => {
    setDoctorForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDoctorReset = () => {
    setDoctorForm({
      name: '',
      specialization: '',
      qualification: '',
      experience: '',
      workingHours: '',
    });
    setDoctorStatus({ saving: false, error: '' });
  };

  const handleDoctorSubmit = async (event) => {
    event.preventDefault();

    if (!hospitalId) {
      setDoctorStatus({ saving: false, error: 'Hospital not loaded. Please try again in a moment.' });
      return;
    }

    if (!doctorForm.name.trim() || !doctorForm.specialization.trim()) {
      setDoctorStatus({ saving: false, error: 'Full name and specialization are required.' });
      return;
    }

    try {
      setDoctorStatus({ saving: true, error: '' });

      const experienceYears = parseInt(doctorForm.experience || '0', 10) || 0;

      const docRef = await addDoc(collection(db, 'hospitalDoctors'), {
        hospitalId,
        name: doctorForm.name.trim(),
        specialization: doctorForm.specialization.trim(),
        qualification: doctorForm.qualification.trim(),
        experience: experienceYears,
        workingHours: doctorForm.workingHours.trim(),
        appointmentsToday: 0,
        createdAt: serverTimestamp(),
      });

      const newDoctor = {
        id: docRef.id,
        name: doctorForm.name.trim(),
        specialization: doctorForm.specialization.trim(),
        qualification: doctorForm.qualification.trim(),
        experience: experienceYears,
        workingHours: doctorForm.workingHours.trim(),
        appointmentsToday: 0,
      };

      setDoctors((prev) => [newDoctor, ...(prev || [])]);
      handleDoctorReset();
      setDoctorStatus({ saving: false, error: '' });
    } catch (error) {
      console.error('Failed to add doctor', error);
      const message =
        (error && (error.message || error.code)) || 'Failed to add doctor. Please try again.';
      setDoctorStatus({ saving: false, error: message });
    }
  };

  if (role !== 'hospital') {
    return (
      <div className="hospital-shell">
        <div className="access-warning">
          <h3>Restricted Module</h3>
          <p>This dashboard is reserved for hospital operations teams. Contact your platform admin to enable the hospital workspace.</p>
        </div>
      </div>
    );
  }

  const navRenderer = {
    profile: () => (
      <div className="hospital-grid cols-2">
        <div className="hospital-card">
          <h3>Hospital Profile</h3>
          <div className="profile-details">
            <div className="profile-detail">
              <span>Name</span>
              <strong>{hospitalProfile.name}</strong>
            </div>
            <div className="profile-detail">
              <span>Location</span>
              <strong>{hospitalProfile.location}</strong>
            </div>
            <div className="profile-detail">
              <span>Contact</span>
              <strong>{hospitalProfile.contact}</strong>
            </div>
            <div className="profile-detail">
              <span>Email</span>
              <strong>{hospitalProfile.email}</strong>
            </div>
            <div className="profile-detail">
              <span>Services</span>
              <strong>{(hospitalProfile.services || []).join(', ')}</strong>
            </div>
            <div className="profile-detail">
              <span>Timings</span>
              <strong>{hospitalProfile.timings}</strong>
            </div>
          </div>
        </div>
        <div className="hospital-card">
          <h3>Update Profile</h3>
          <form className="hospital-grid">
            <div>
              <label className="form-label">Hospital Name</label>
              <input className="hospital-input" defaultValue={hospitalProfile.name} />
            </div>
            <div>
              <label className="form-label">Contact Number</label>
              <input className="hospital-input" defaultValue={hospitalProfile.contact} />
            </div>
            <div>
              <label className="form-label">Services</label>
              <textarea className="hospital-textarea" defaultValue={(hospitalProfile.services || []).join(', ')} />
            </div>
            <div>
              <label className="form-label">Upload Logo</label>
              <input className="hospital-input" type="file" />
            </div>
            <div className="hospital-form-actions">
              <button type="button" className="btn-hospital-outline">
                Cancel
              </button>
              <button type="button" className="btn-hospital-primary">
                Save changes
              </button>
            </div>
          </form>
        </div>
      </div>
    ),
    doctors: () => (
      <div className="hospital-grid">
        <div className="hospital-card">
          <h3>Doctors</h3>
          <input className="hospital-input" placeholder="Search name or specialization" value={doctorSearch} onChange={(event) => setDoctorSearch(event.target.value)} />
          <div className="hospital-grid cols-2" style={{ marginTop: '1rem' }}>
            {filteredDoctors.map((doctor) => (
              <div className="doctor-card" key={doctor.id}>
                <strong>{doctor.name}</strong>
                <span className="doctor-meta">
                  {doctor.specialization} · {doctor.experience} yrs
                </span>
                <span className="doctor-meta">{doctor.qualification}</span>
                <div className="schedule-chip">Hours · {doctor.workingHours}</div>
                <div className="doctor-meta">Today · {doctor.appointmentsToday} appointments</div>
                <div className="doctor-actions">
                  <button>Edit</button>
                  <button>Schedule</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hospital-card">
          <h3>Register Doctor</h3>
          <form className="hospital-grid cols-2" onSubmit={handleDoctorSubmit}>
            <div>
              <label className="form-label">Full name</label>
              <input
                className="hospital-input"
                placeholder="Dr. Ananya Varma"
                value={doctorForm.name}
                onChange={(event) => handleDoctorFormChange('name', event.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Specialization</label>
              <input
                className="hospital-input"
                placeholder="Dermatology"
                value={doctorForm.specialization}
                onChange={(event) => handleDoctorFormChange('specialization', event.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Qualification</label>
              <input
                className="hospital-input"
                placeholder="MD"
                value={doctorForm.qualification}
                onChange={(event) => handleDoctorFormChange('qualification', event.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Experience</label>
              <input
                className="hospital-input"
                placeholder="10 years"
                value={doctorForm.experience}
                onChange={(event) => handleDoctorFormChange('experience', event.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Working hours</label>
              <input
                className="hospital-input"
                placeholder="08:00 - 15:00"
                value={doctorForm.workingHours}
                onChange={(event) => handleDoctorFormChange('workingHours', event.target.value)}
              />
            </div>
            <div className="hospital-form-actions">
              <button type="button" className="btn-hospital-outline" onClick={handleDoctorReset}>
                Reset
              </button>
              <button type="submit" className="btn-hospital-primary" disabled={doctorStatus.saving}>
                {doctorStatus.saving ? 'Adding…' : 'Add doctor'}
              </button>
            </div>
            {doctorStatus.error && <p style={{ color: 'var(--hospital-danger)', gridColumn: '1 / -1' }}>{doctorStatus.error}</p>}
          </form>
        </div>
      </div>
    ),
    appointments: () => (
      <div className="hospital-card">
        <h3>Appointments</h3>
        <div className="filters">
          <select className="hospital-select" value={appointmentFilter.doctor} onChange={(event) => setAppointmentFilter((prev) => ({ ...prev, doctor: event.target.value }))}>
            <option value="all">All doctors</option>
            {(doctors || []).map((doctor) => (
              <option key={doctor.id} value={doctor.name}>
                {doctor.name}
              </option>
            ))}
          </select>
          <input className="hospital-input" type="date" value={appointmentFilter.date} onChange={(event) => setAppointmentFilter((prev) => ({ ...prev, date: event.target.value }))} />
          <button className="btn-hospital-outline" onClick={() => alert('Exporting appointment report...')}>
            Export CSV
          </button>
        </div>
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.patient}</td>
                <td>{appointment.doctor}</td>
                <td>{appointment.date}</td>
                <td>{appointment.time}</td>
                <td>
                  <span className={`badge ${appointment.status}`}>{appointment.status}</span>
                </td>
                <td>
                  <button className="btn-hospital-outline" onClick={() => alert(`Updating status for ${appointment.patient}`)}>
                    Update status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
    notifications: () => (
      <div className="hospital-grid cols-2">
        <div className="hospital-card">
          <h3>Announcements</h3>
          <form onSubmit={handleAnnouncementSubmit}>
            <div className="hospital-grid cols-2">
              <div>
                <label className="form-label">Title</label>
                <input className="hospital-input" value={announcementForm.title} onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Radiology update" />
              </div>
              <div>
                <label className="form-label">Audience</label>
                <select className="hospital-select" value={announcementForm.target} onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, target: event.target.value }))}>
                  <option>Doctors</option>
                  <option>Staff</option>
                  <option>All</option>
                </select>
              </div>
              <div>
                <label className="form-label">Schedule</label>
                <input type="datetime-local" className="hospital-input" value={announcementForm.schedule} onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, schedule: event.target.value }))} />
              </div>
              <div>
                <label className="form-label">Message</label>
                <textarea className="hospital-textarea" value={announcementForm.message} onChange={(event) => setAnnouncementForm((prev) => ({ ...prev, message: event.target.value }))} placeholder="Add reminder or SOP details..." />
              </div>
            </div>
            <div className="hospital-form-actions" style={{ marginTop: '1rem' }}>
              <button type="button" className="btn-hospital-outline">
                Save draft
              </button>
              <button type="submit" className="btn-hospital-primary">
                Publish / Schedule
              </button>
            </div>
          </form>
        </div>
        <div className="hospital-card">
          <h3>Alerts</h3>
          <div className="alert-feed">
            {announcements.map((alert) => (
              <div key={alert.id} className="alert-item">
                <strong>{alert.title}</strong>
                <span>{alert.description}</span>
                <small style={{ color: 'var(--hospital-muted)' }}>{alert.timestamp}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div className="hospital-shell">
      <aside className="hospital-sidebar">
        <div className="hospital-logo">
          <div className="hospital-logo-mark">HC</div>
          <div>
            <strong>Hospital Desk</strong>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--hospital-muted)' }}>{resolvedHospitalName}</p>
          </div>
        </div>
        <nav className="hospital-nav">
          {NAV.map((item) => (
            <button key={item.id} className={activeNav === item.id ? 'active' : ''} onClick={() => setActiveNav(item.id)}>
              <span className="hospital-nav-icon">{ICONS[item.icon]}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="hospital-sidebar-footer">
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--hospital-muted)' }}>Role</p>
          <strong>Hospital Operations</strong>
        </div>
      </aside>
      <main className="hospital-main">
        <div className="hospital-topbar">
          <h2>{NAV.find((navItem) => navItem.id === activeNav)?.label}</h2>
          <input className="hospital-search" placeholder="Search doctors, patients, appointments..." />
          <div className="hospital-actions">
            <button className="hospital-icon-btn" title="Notifications">
              {ICONS.notifications}
            </button>
            <button className="hospital-icon-btn" title="Messages">
              {ICONS.chat}
            </button>
            <button className="btn-hospital-outline" onClick={() => (window.location.href = '/')}>
              Go to Home
            </button>
          </div>
        </div>
        <div className="hospital-content">
          {hospitalStatus.loading ? (
            <div className="access-warning">
              <h3>Loading hospital workspace…</h3>
              <p>Please wait while we fetch your hospital data.</p>
            </div>
          ) : hospitalStatus.error ? (
            <div className="access-warning">
              <h3>Unable to load hospital</h3>
              <p>{hospitalStatus.error}</p>
              <button className="btn-hospital-primary" onClick={() => window.location.assign('/login')}>
                Return to login
              </button>
            </div>
          ) : (
            navRenderer[activeNav]()
          )}
        </div>
      </main>
    </div>
  );
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
