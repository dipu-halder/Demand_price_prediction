import React, { useEffect, useRef, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, ScatterChart, Scatter, CartesianGrid, Legend
} from 'recharts'
import styles from './Dashboard.module.css'

/* ── Feature importance weights ── */
const FEATURE_IMPORTANCE = [
  { name: 'Cust. Visits', value: 520, color: '#6366f1' },
  { name: 'Past Sales',   value: 320, color: '#8b5cf6' },
  { name: 'Inventory',    value: 240, color: '#10b981' },
  { name: 'Promotion',    value: 90,  color: '#f97316' },
  { name: 'Month',        value: 70,  color: '#eab308' },
  { name: 'Price Effect', value: 45,  color: '#a855f7' },
  { name: 'Holiday',      value: 20,  color: '#475569' },
]

/* ── Monthly pattern ── */
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const MONTH_NAMES_LC = ['january','february','march','april','may','june','july','august','september','october','november','december']

function buildMonthlyData(month) {
  return MONTHS_SHORT.map((m, i) => ({
    month: m,
    demand: 800 + Math.round(Math.sin((i + 2) * 0.6) * 80) + Math.round(Math.random() * 30),
    highlight: MONTHS_SHORT[month - 1] === m,
  }))
}

/* ── Price sensitivity ── */
function buildPriceSensitivity(basePrice, baseDemand) {
  return [50, 90, 130, 170, 210, 250, 290, 330, 370, 410, 450].map((p) => ({
    price: `+${p}`,
    demand: Math.max(20, Math.round(baseDemand - (p / basePrice) * baseDemand * 0.4)),
    yourPrice: p === Math.round(basePrice) ? baseDemand : null,
  }))
}

export default function Dashboard({ result, formData }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [result])

  const monthIndex = formData?.month || 7
  const monthlyData = buildMonthlyData(monthIndex)
  const priceData = buildPriceSensitivity(
    parseFloat(formData?.price) || 260,
    result.predicted_demand
  )
  const monthName = MONTHS_SHORT[monthIndex - 1] || 'Jul'

  // Determine promotion and holiday labels
  const promoLabel = formData?.promotion ? 'On' : 'Off'
  const holidayLabel = formData?.holiday ? 'Yes' : 'No'

  return (
    <div className={`${styles.wrapper} ${visible ? styles.wrapperVisible : ''}`} ref={ref}>

      {/* ── Summary KPI row ── */}
      <div className={styles.kpiRow}>
        <KPICard
          label="Predicted Demand"
          value={result.predicted_demand.toLocaleString()}
          sub="Units"
          color="#6366f1"
          icon="📦"
        />
        <KPICard
          label="Current Price"
          value={`₹ ${result.current_price}`}
          sub="Per unit"
          color="#94a3b8"
          icon="💰"
        />
        <KPICard
          label="Promotion"
          value={promoLabel}
          sub="Status"
          color={formData?.promotion ? '#10b981' : '#475569'}
          icon="🎯"
        />
        <KPICard
          label="Holiday"
          value={holidayLabel}
          sub="Status"
          color={formData?.holiday ? '#f97316' : '#475569'}
          icon="📅"
        />
        <KPICard
          label="Month"
          value={monthName}
          sub="Selected"
          color="#06b6d4"
          icon="📆"
        />
        <KPICard
          label="Model Source"
          value="Local"
          sub="Engine"
          color="#6366f1"
          icon="🧠"
        />
      </div>

      {/* ── Charts row ── */}
      <div className={styles.chartsRow}>
        {/* Feature Influence */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={`${styles.tag} ${styles.tagBlue}`}>ANALYSIS</span>
            <span className={styles.chartTitle}>Feature Influence</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={FEATURE_IMPORTANCE} layout="vertical" margin={{ left: 20, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'JetBrains Mono' }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  background: '#0d0d22',
                  border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: '8px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: 12,
                  color: '#f1f5f9',
                }}
                cursor={{ fill: 'rgba(99,102,241,0.05)' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {FEATURE_IMPORTANCE.map((entry, i) => (
                  <rect key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Custom bars since Recharts needs Cell */}
          <div className={styles.customBars}>
            {FEATURE_IMPORTANCE.map((f) => (
              <div key={f.name} className={styles.customBarRow}>
                <span className={styles.customBarLabel}>{f.name}</span>
                <div className={styles.customBarTrack}>
                  <div
                    className={styles.customBarFill}
                    style={{ width: `${(f.value / 520) * 100}%`, background: f.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price vs Demand */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={`${styles.tag} ${styles.tagOrange}`}>SENSITIVITY</span>
            <span className={styles.chartTitle}>Price vs Demand</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={priceData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="price"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
              <Tooltip
                contentStyle={{
                  background: '#0d0d22',
                  border: '1px solid rgba(249,115,22,0.3)',
                  borderRadius: '8px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: 12,
                  color: '#f1f5f9',
                }}
              />
              <Legend
                wrapperStyle={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: 11,
                  color: '#94a3b8',
                }}
              />
              <Line
                type="monotone"
                dataKey="demand"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 3, fill: '#6366f1' }}
                name="Demand"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Monthly demand pattern ── */}
      <div className={styles.fullCard}>
        <div className={styles.chartHeader}>
          <span className={`${styles.tag} ${styles.tagGreen}`}>SEASONAL</span>
          <span className={styles.chartTitle}>Monthly Demand Pattern</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'JetBrains Mono' }}
            />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }} domain={[0, 1100]} />
            <Tooltip
              contentStyle={{
                background: '#0d0d22',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '8px',
                fontFamily: 'JetBrains Mono',
                fontSize: 12,
                color: '#f1f5f9',
              }}
            />
            {monthlyData.map((d, i) => (
              <Bar
                key={i}
                dataKey="demand"
                fill={d.highlight ? '#f97316' : '#3b3b7a'}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
        {/* Recharts doesn't support per-bar color easily in one Bar component, so we render custom */}
        <MonthlyBarCustom data={monthlyData} />
      </div>

    </div>
  )
}

/* ── KPI Card ── */
function KPICard({ label, value, sub, color, icon }) {
  return (
    <div className={styles.kpiCard} style={{ '--kpi-color': color }}>
      <div className={styles.kpiIcon}>{icon}</div>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiValue}>{value}</div>
      <div className={styles.kpiSub}>{sub}</div>
    </div>
  )
}

/* ── Custom monthly bars with highlight ── */
function MonthlyBarCustom({ data }) {
  const max = Math.max(...data.map((d) => d.demand))
  return (
    <div className={styles.monthlyCustom}>
      {data.map((d) => (
        <div key={d.month} className={styles.monthlyBar}>
          <div
            className={styles.monthlyBarFill}
            style={{
              height: `${(d.demand / max) * 100}%`,
              background: d.highlight ? '#f97316' : '#2d2d6b',
              boxShadow: d.highlight ? '0 0 12px rgba(249,115,22,0.5)' : 'none',
            }}
          />
          <span className={styles.monthlyBarLabel}>{d.month}</span>
        </div>
      ))}
    </div>
  )
}
