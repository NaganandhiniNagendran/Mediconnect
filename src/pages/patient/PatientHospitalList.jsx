import { useEffect, useMemo, useState } from 'react'add
import { useNavigate } from 'react-router-dom'
import { db } from '../../backend/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'

export default function PatientHospitalList() {
  const [hospitals, setHospitals] = useState([])
  const [selectedHospital, setSelectedHospital] = useState('all')
  const [location, setLocation] = useState('all')
  const [service, setService] = useState('all')
  const [rating, setRating] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function loadHospitals() {
      try {
        const snapshot = await getDocs(collection(db, 'adminHospitals'))
        const items = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data() || {}
          return {
            id: docSnapshot.id,
            name: data.name || 'Unnamed Hospital',
            location: data.location || 'Not specified',
            services: Array.isArray(data.services)
              ? data.services
              : typeof data.services === 'string'
                ? data.services
                    .split(',')
                    .map((service) => service.trim())
                    .filter(Boolean)
                : [],
            rating: data.rating ?? 4.5,
            description: data.description || '',
          }
        })
        setHospitals(items)
        setError('')
      } catch (err) {
        console.error('Failed to load hospitals', err)
        setError('Unable to load hospitals right now. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadHospitals()
  }, [])

  const locations = Array.from(new Set(hospitals.map((h) => h.location))).filter(Boolean)
  const hospitalNames = Array.from(new Set(hospitals.map((h) => h.name))).filter(Boolean).sort()
  const services = Array.from(
    new Set(
      hospitals.flatMap((h) => (Array.isArray(h.services) ? h.services : [])).filter(Boolean)
    )
  )

  const filtered = useMemo(() => {
    return hospitals.filter((h) => {
      const matchesHospital = selectedHospital === 'all' || h.name === selectedHospital
      const matchesLocation = location === 'all' || h.location === location
      const matchesService = service === 'all' || h.services.includes(service)
      const matchesRating = rating === 'all' || h.rating >= Number(rating)
      return matchesHospital && matchesLocation && matchesService && matchesRating
    })
  }, [selectedHospital, location, service, rating, hospitals])

  function reset() {
    setSelectedHospital('all')
    setLocation('all')
    setService('all')
    setRating('all')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Hospitals</h1>
          <p className="text-slate-600">Search and filter hospitals to book your next visit.</p>
        </div>
        <div className="ml-auto space-y-1 text-right">
          {loading && <p className="text-sm text-slate-500">Loading hospitals…</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-center gap-3">
          <CardTitle>Search & Filters</CardTitle>
          <div className="ml-auto flex flex-wrap items-center gap-3">
            <Select 
              value={selectedHospital} 
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="w-48"
            >
              <option value="all">All hospitals</option>
              {hospitalNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
            <Select value={location} onChange={(e) => setLocation(e.target.value)} className="w-40">
              <option value="all">All locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </Select>
            <Select value={service} onChange={(e) => setService(e.target.value)} className="w-44">
              <option value="all">All services</option>
              {services.map((svc) => (
                <option key={svc} value={svc}>
                  {svc}
                </option>
              ))}
            </Select>
            <Select value={rating} onChange={(e) => setRating(e.target.value)} className="w-36">
              <option value="all">Any rating</option>
              <option value="4">4.0+</option>
              <option value="4.5">4.5+</option>
            </Select>
            <Button variant="outline" onClick={reset}>
              Reset
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((hosp) => (
          <Card key={hosp.id} className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{hosp.name}</CardTitle>
                  <p className="text-sm text-slate-600">{hosp.location}</p>
                </div>
                <Badge variant="success">{(hosp.rating ?? 4.5).toFixed(1)} ★</Badge>
              </div>
              {hosp.description ? (
                <p className="text-sm text-slate-600">{hosp.description}</p>
              ) : null}
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {Array.isArray(hosp.services)
                  ? hosp.services.map((svc) => (
                      <Badge key={svc}>{svc}</Badge>
                    ))
                  : null}
              </div>
              <Button onClick={() => navigate(`/patient/hospitals/${hosp.id}`)}>View Details</Button>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 ? <p className="text-sm text-slate-500">No hospitals match your filters.</p> : null}
      </div>
    </div>
  )
}

