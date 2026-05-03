import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import InputForm from '../components/InputForm.jsx'
import Dashboard from '../components/Dashboard.jsx'
import FuturePrediction from '../components/FuturePrediction.jsx'
import styles from './PredictPage.module.css'

export default function PredictPage() {
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState(null)
  const [backendStatus, setBackendStatus] = useState('checking') // 'checking' | 'online' | 'offline'

  // Check if Flask backend is running
  useEffect(() => {
    fetch('/api/health')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(() => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'))
  }, [])

  const handlePredict = async (data) => {
    setLoading(true)
    setError(null)
    setFormData(data)
    setResult(null)

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Server error')
      }

      setResult(json)
      setBackendStatus('online')

    } catch (err) {
      if (err.message.includes('fetch') || err.message.includes('Failed')) {
        // Network error — backend not running
        setBackendStatus('offline')
        setError('Flask backend nahi chal raha. Pehle "python app.py" run karo, phir dobara try karo.')
      } else {
        setError(`Error: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          ← Back
        </button>
        <div className={styles.headerLogo}>
          <span className={styles.logoIcon}>◈</span>
          <span className={styles.logoText}>DEMAND<span>AI</span></span>
        </div>
        <div className={`${styles.headerStatus} ${backendStatus === 'online' ? styles.statusOnline : backendStatus === 'offline' ? styles.statusOffline : ''}`}>
          <span className={styles.statusDot} />
          <span>
            {backendStatus === 'checking' && 'Connecting...'}
            {backendStatus === 'online'   && 'Flask Connected'}
            {backendStatus === 'offline'  && 'Backend Offline'}
          </span>
        </div>
      </header>

      {/* Backend offline warning */}
      {backendStatus === 'offline' && (
        <div className={styles.warningBox}>
          ⚠ Flask backend nahi chal raha hai!
          <br />
          <code>cd your-folder &amp;&amp; python app.py</code> run karo phir page refresh karo.
        </div>
      )}

      {/* Page title */}
      <div className={styles.pageTitle}>
        <span className={styles.tag}>INPUT</span>
        <h1>Demand & Price Prediction</h1>
        <p>Fill all fields to generate your AI-powered forecast</p>
      </div>

      {/* Input Form */}
      <InputForm onSubmit={handlePredict} loading={loading} />

      {/* Error */}
      {error && (
        <div className={styles.errorBox}>
          ⚠ {error}
        </div>
      )}

      {/* Dashboard Results */}
      {result && !loading && (
        <Dashboard result={result} formData={formData} />
      )}

      {/* Future Prediction */}
      {result && !loading && (
        <FuturePrediction
          currentPrice={parseFloat(formData.price)}
          predictedDemand={result.predicted_demand}
        />
      )}
    </div>
  )
}
