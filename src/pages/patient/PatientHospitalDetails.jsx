import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../../backend/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

export default function PatientHospitalDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [hospital, setHospital] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadHospital() {
      try {
        const ref = doc(db, 'adminHospitals', id)
        const snapshot = await getDoc(ref)
        if (!snapshot.exists()) {
          setError('Hospital not found.')
          setHospital(null)
        } else {
          const data = snapshot.data() || {}
          setHospital({
            id: snapshot.id,
            name: data.name || 'Unnamed Hospital',
            location: data.location || 'Not specified',
            services: Array.isArray(data.services)
              ? data.services
              : typeof data.services === 'string'
                ? data.services
                    .split(',')
                    .map((svc) => svc.trim())
                    .filter(Boolean)
                : [],
            rating: data.rating ?? 4.5,
            address: data.address || '',
            mapLink: data.mapLink || '',
            phone: data.phone || '',
            email: data.email || '',
          })
          setError('')
        }
      } catch (err) {
        console.error('Failed to load hospital details', err)
        setError('Unable to load hospital details right now. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadHospital()
  }, [id])

  if (loading) {
    return (
      <div className="space-y-4">
        <p className="text-slate-600">Loading hospital details…</p>
        <Button variant="outline" onClick={() => navigate('/patient/hospitals')}>
          Back to hospitals
        </Button>
      </div>
    )
  }

  if (error || !hospital) {
    return (
      <div className="space-y-4">
        <p className="text-slate-600">{error || 'Hospital not found.'}</p>
        <Button variant="outline" onClick={() => navigate('/patient/hospitals')}>
          Back to hospitals
        </Button>
      </div>
    )
  }

  function book() {
    navigate('/patient/book', { state: { hospitalId: hospital.id } })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <p className="text-sm text-slate-500">Hospital</p>
          <h1 className="text-2xl font-semibold text-slate-900">{hospital.name}</h1>
          <p className="text-slate-600">{hospital.location}</p>
        </div>
        <Badge variant="success">{(hospital.rating ?? 4.5).toFixed(1)} ★</Badge>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => navigate('/patient/hospitals')}>
            Back
          </Button>
          <Button onClick={book}>Book at this hospital</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {hospital.address ? (
            <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-100 p-6 text-sm text-slate-600">
              Map placeholder for {hospital.address}
            </div>
          ) : (
            <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-100 p-6 text-sm text-slate-600">
              Location details will be updated soon.
            </div>
          )}
          <div className="space-y-3">
            {hospital.address && <p className="text-sm text-slate-600">{hospital.address}</p>}
            {hospital.mapLink && (
              <a className="text-sm font-semibold text-sky-600" href={hospital.mapLink}>
                Open in Maps
              </a>
            )}
            <div>
              <p className="text-sm font-medium text-slate-700">Contact</p>
              {hospital.phone && <p className="text-sm text-slate-600">{hospital.phone}</p>}
              {hospital.email && <p className="text-sm text-slate-600">{hospital.email}</p>}
              {!hospital.phone && !hospital.email && (
                <p className="text-sm text-slate-600">Contact details will be updated soon.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {Array.isArray(hospital.services) && hospital.services.length > 0 ? (
            hospital.services.map((svc) => (
              <Badge key={svc}>{svc}</Badge>
            ))
          ) : (
            <p className="text-sm text-slate-500">Services will be updated soon.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

