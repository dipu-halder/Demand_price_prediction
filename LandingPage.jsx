import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import styles from './LandingPage.module.css'

/* ─── Floating stat cards data ─── */
const STATS = [
  { label: 'Model Accuracy', value: '94.2%', color: '#6366f1' },
  { label: 'Products Tracked', value: '10K+', color: '#f97316' },
  { label: 'Predictions Made', value: '1M+', color: '#06b6d4' },
]

/* ─── Feature cards data ─── */
const FEATURES = [
  {
    icon: '⚡',
    title: 'Instant Demand Forecast',
    desc: 'Random Forest model trained on 1000+ data points — predicts sales volume in milliseconds.',
    tag: 'ML Powered',
    tagColor: 'blue',
  },
  {
    icon: '📈',
    title: 'Future Price Projection',
    desc: 'Linear regression models inflation + demand growth to forecast prices years ahead.',
    tag: 'Time Series',
    tagColor: 'orange',
  },
  {
    icon: '🧠',
    title: 'Feature Influence Analysis',
    desc: 'Understand which factors — visits, promotions, seasonality — drive your sales most.',
    tag: 'Explainable AI',
    tagColor: 'green',
  },
  {
    icon: '🌊',
    title: 'Sensitivity Charts',
    desc: 'Price-vs-demand curves and monthly patterns to sharpen your pricing strategy.',
    tag: 'Analytics',
    tagColor: 'blue',
  },
]

export default function LandingPage() {
  const canvasRef = useRef(null)
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState(false)

  /* ─── Three.js Scene ─── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 30

    /* ── Particle field ── */
    const particleCount = 2000
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    const palette = [
      new THREE.Color('#6366f1'),
      new THREE.Color('#8b5cf6'),
      new THREE.Color('#06b6d4'),
      new THREE.Color('#f97316'),
    ]

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60
      const c = palette[Math.floor(Math.random() * palette.length)]
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
      sizes[i] = Math.random() * 2 + 0.5
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const mat = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true,
    })

    const particles = new THREE.Points(geo, mat)
    scene.add(particles)

    /* ── Wireframe torus knot ── */
    const torusGeo = new THREE.TorusKnotGeometry(8, 1.8, 160, 20)
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    })
    const torus = new THREE.Mesh(torusGeo, torusMat)
    scene.add(torus)

    /* ── Floating ring ── */
    const ringGeo = new THREE.TorusGeometry(14, 0.08, 8, 120)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.18,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = Math.PI / 3
    scene.add(ring)

    /* ── Second ring ── */
    const ring2Geo = new THREE.TorusGeometry(20, 0.06, 8, 120)
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.12,
    })
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat)
    ring2.rotation.x = Math.PI / 5
    ring2.rotation.y = Math.PI / 6
    scene.add(ring2)

    /* ── Mouse parallax ── */
    let mouseX = 0, mouseY = 0
    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    /* ── Resize ── */
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    /* ── Animate ── */
    let frameId
    const clock = new THREE.Clock()
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      particles.rotation.y = t * 0.04
      particles.rotation.x = t * 0.02

      torus.rotation.x = t * 0.08
      torus.rotation.y = t * 0.12
      torus.rotation.z = t * 0.05

      ring.rotation.z = t * 0.06
      ring2.rotation.z = -t * 0.04

      camera.position.x += (mouseX * 4 - camera.position.x) * 0.05
      camera.position.y += (-mouseY * 3 - camera.position.y) * 0.05
      camera.lookAt(scene.position)

      renderer.render(scene, camera)
    }
    animate()

    setTimeout(() => setLoaded(true), 300)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
    }
  }, [])

  return (
    <div className={styles.wrapper}>
      {/* 3D Canvas */}
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* Gradient overlays */}
      <div className={styles.gradientTop} />
      <div className={styles.gradientBottom} />
      <div className={styles.gradientLeft} />

      {/* Scan line effect */}
      <div className={styles.scanLine} />

      {/* ── NAV ── */}
      <nav className={`${styles.nav} ${loaded ? styles.navVisible : ''}`}>
        <div className={styles.navLogo}>
          <span className={styles.logoIcon}>◈</span>
          <span className={styles.logoText}>DEMAND<span>AI</span></span>
        </div>
        <div className={styles.navLinks}>
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <button className={styles.navCta} onClick={() => navigate('/predict')}>
            Launch App →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={`${styles.hero} ${loaded ? styles.heroVisible : ''}`}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            AI-Powered · Random Forest + Linear Regression
          </div>

          <h1 className={styles.heroTitle}>
            Predict
            <br />
            <span className={styles.heroTitleAccent}>Demand.</span>
            <br />
            <span className={styles.heroTitleSub}>Foresee Price.</span>
          </h1>

          <p className={styles.heroDesc}>
            Enterprise-grade demand forecasting & price prediction powered by
            machine learning. Input your product details — get instant insights
            on sales volume and future pricing trends.
          </p>

          <div className={styles.heroActions}>
            <button className={styles.btnPrimary} onClick={() => navigate('/predict')}>
              <span>⚡</span> Start Predicting
            </button>
            <a href="#features" className={styles.btnGhost}>
              Explore Features ↓
            </a>
          </div>

          {/* Stat pills */}
          <div className={styles.statsRow}>
            {STATS.map((s) => (
              <div key={s.label} className={styles.statPill} style={{ '--accent': s.color }}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual card */}
        <div className={styles.heroVisual}>
          <div className={styles.heroCard}>
            <div className={styles.heroCardHeader}>
              <span className={`${styles.tag} ${styles.tagBlue}`}>LIVE PREDICTION</span>
              <span className={styles.heroDot} />
            </div>
            <div className={styles.heroCardMetric}>964</div>
            <div className={styles.heroCardLabel}>Predicted Units</div>
            <div className={styles.heroCardBar}>
              <div className={styles.heroCardBarFill} style={{ width: '78%' }} />
            </div>
            <div className={styles.heroCardRow}>
              <span>₹260 → <strong style={{ color: '#f97316' }}>₹339.81</strong></span>
              <span style={{ color: '#10b981' }}>+30.7%</span>
            </div>
            {/* Mini sparkline */}
            <svg className={styles.heroSparkline} viewBox="0 0 200 50">
              <polyline
                points="0,40 30,35 60,28 90,20 120,22 150,14 180,8 200,5"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <polyline
                points="0,40 30,35 60,28 90,20 120,22 150,14 180,8 200,5"
                fill="url(#sparkGrad)"
                strokeWidth="0"
              />
              <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionLabel}>
          <span className={`${styles.tag} ${styles.tagOrange}`}>CAPABILITIES</span>
        </div>
        <h2 className={styles.sectionTitle}>Everything You Need to<br />Predict Smarter</h2>

        <div className={styles.featuresGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <span className={`${styles.tag} ${styles[`tag${f.tagColor.charAt(0).toUpperCase() + f.tagColor.slice(1)}`]}`}>
                {f.tag}
              </span>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
              <div className={styles.featureGlow} />
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section id="about" className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaOrb} />
          <span className={`${styles.tag} ${styles.tagBlue}`}>GET STARTED</span>
          <h2 className={styles.ctaTitle}>Ready to Forecast?</h2>
          <p className={styles.ctaDesc}>
            Enter your product, store, pricing details and let the AI do the rest.
            Built with Python · scikit-learn · React.
          </p>
          <button className={styles.btnPrimary} onClick={() => navigate('/predict')}>
            <span>⚡</span> Open Prediction Dashboard
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <span className={styles.logoText} style={{ fontSize: '14px' }}>
          DEMAND<span>AI</span>
        </span>
        <span className={styles.footerText}>
          Powered by Random Forest · Linear Regression · React
        </span>
      </footer>
    </div>
  )
}
