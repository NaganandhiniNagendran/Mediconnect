import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import { db } from '../../backend/firebase'
import { getAuth } from 'firebase/auth'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Select } from '../../components/ui/select'

export default function PatientDoctorList() {
  const [doctors, setDoctors] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [specialization, setSpecialization] = useState('all')
  const [hospitalId, setHospitalId] = useState('all')
  const [availability, setAvailability] = useState('all')
  const navigate = useNavigate()

  // Fetch doctors and hospitals from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // First, get the current user's hospital ID if they're a doctor
        const auth = getAuth()
        const user = auth.currentUser
        
        if (!user) {
          throw new Error('User not authenticated')
        }
        
        // Get the user's document to check their role and hospital
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (!userDoc.exists()) {
          throw new Error('User data not found')
        }
        
        const userData = userDoc.data()
        
        // If user is a doctor, only fetch their hospital's doctors
        let doctorsQuery = collection(db, 'hospitalDoctors')
        if (userData.role === 'doctor') {
          doctorsQuery = query(doctorsQuery, where('hospitalId', '==', userData.hospitalId))
        }
        
        // Fetch doctors
        const doctorsSnapshot = await getDocs(doctorsQuery)
        const doctorsData = []
        
        // Process each doctor and fetch their hospital details
        for (const doc of doctorsSnapshot.docs) {
          const doctorData = { id: doc.id, ...doc.data() }
          
          // Get hospital details for each doctor
          if (doctorData.hospitalId) {
            const hospitalDoc = await getDoc(doc(db, 'hospitals', doctorData.hospitalId))
            if (hospitalDoc.exists()) {
              doctorData.hospital = { id: hospitalDoc.id, ...hospitalDoc.data() }
            }
          }
          
          doctorsData.push(doctorData)
        }
        
        setDoctors(doctorsData)
        
        // Fetch all hospitals for the filter
        const hospitalsSnapshot = await getDocs(collection(db, 'hospitals'))
        const hospitalsData = hospitalsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setHospitals(hospitalsData)
        
        setError(null)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load doctors. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const specializations = useMemo(() => {
    const specs = new Set()
    doctors.forEach(doctor => {
      if (doctor.specialization) {
        specs.add(doctor.specialization)
      }
    })
    return Array.from(specs)
  }, [doctors])

  const filtered = useMemo(() => {
    if (!doctors.length) return []
    
    return doctors.filter((doctor) => {
      // Check if doctor has the required properties before accessing them
      const doctorSpecialization = doctor.specialization || ''
      const doctorHospitalId = doctor.hospitalId || ''
      const doctorAvailability = doctor.availability || ''
      
      const matchesSpec = specialization === 'all' || 
                         doctorSpecialization.toLowerCase().includes(specialization.toLowerCase())
      const matchesHosp = hospitalId === 'all' || 
                         doctorHospitalId === hospitalId
      const matchesAvail = availability === 'all' || 
                          doctorAvailability.toLowerCase().includes(availability.toLowerCase())
      
      return matchesSpec && matchesHosp && matchesAvail
    })
  }, [doctors, specialization, hospitalId, availability])

  function reset() {
    setSpecialization('all')
    setHospitalId('all')
    setAvailability('all')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-600">Loading doctors...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600 bg-red-100 rounded-lg">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Doctors</h1>
          <p className="text-slate-600">Find specialists and book appointments.</p>
        </div>
        <div className="text-sm text-slate-500">
          {filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-center gap-3">
          <CardTitle>Search & Filters</CardTitle>
          <div className="ml-auto flex flex-wrap items-center gap-3">
            <Select 
              value={hospitalId} 
              onChange={(e) => setHospitalId(e.target.value)} 
              className="w-48"
            >
              <option value="all">All Hospitals</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </Select>
            <Select 
              value={specialization} 
              onChange={(e) => setSpecialization(e.target.value)} 
              className="w-44"
            >
              <option value="all">All specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </Select>
            <Select value={availability} onChange={(e) => setAvailability(e.target.value)} className="w-48">
              <option value="all">Any availability</option>
              <option value="Available this week">Available this week</option>
              <option value="Accepting new patients">Accepting new patients</option>
              <option value="Limited slots">Limited slots</option>
            </Select>
            <Button variant="outline" onClick={reset}>
              Reset
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length > 0 ? (
          filtered.map((doc) => {
            const hospital = hospitals.find((h) => h.id === doc.hospitalId)
            return (
              <Card key={doc.id} className="flex flex-col gap-3 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{doc.name || 'Doctor Name'}</CardTitle>
                    {doc.qualifications && (
                      <p className="text-sm text-slate-600">{doc.qualifications}</p>
                    )}
                  </div>
                  {doc.rating && (
                    <Badge variant="success" className="whitespace-nowrap">
                      {typeof doc.rating === 'number' ? doc.rating.toFixed(1) : doc.rating} ★
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  {doc.specialization && <p className="font-medium">{doc.specialization}</p>}
                  <p>
                    {doc.experience && <span>{doc.experience} • </span>}
                    {hospital?.name || 'Hospital not specified'}
                  </p>
                  {doc.consultationTimings && (
                    <p>Timings: {doc.consultationTimings}</p>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/patient/doctors/${doc.id}`)}
                  >
                    View Profile
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => navigate('/patient/book', { 
                      state: { 
                        hospitalId: doc.hospitalId, 
                        doctorId: doc.id,
                        doctorName: doc.name
                      } 
                    })}
                  >
                    Book Now
                  </Button>
                </div>
              </Card>
            )
          })
        ) : (
          <div className="col-span-full py-8 text-center">
            <p className="text-slate-500">No doctors found matching your criteria.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => {
                setSpecialization('all')
                setHospitalId('all')
                setAvailability('all')
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

