import React, { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import styles from './FuturePrediction.module.css'

const INFLATION = 0.055  // 5.5% per year
const DEMAND_GROWTH = 0.04  // 4% per year

export default function FuturePrediction({ currentPrice, predictedDemand }) {
  const [years, setYears] = useState('')
  const [result, setResult] = useState(null)

  const handleForecast = () => {
    const y = parseInt(years)
    if (!y || y < 1 || y > 50) return

    const futurePrice = currentPrice * Math.pow(1 + INFLATION, y)
    const futureDemand = predictedDemand * Math.pow(1 + DEMAND_GROWTH, y)
    const increase = futurePrice - currentPrice
    const percent = (increase / currentPrice) * 100

    // Build chart data
    const chartData = []
    for (let i = 0; i <= y; i++) {
      chartData.push({
        year: `Y${i}`,
        price: parseFloat((currentPrice * Math.pow(1 + INFLATION, i)).toFixed(2)),
        demand: parseFloat((predictedDemand * Math.pow(1 + DEMAND_GROWTH, i)).toFixed(1)),
      })
    }

    setResult({
      futurePrice: parseFloat(futurePrice.toFixed(2)),
      futureDemand: parseFloat(futureDemand.toFixed(2)),
      increase: parseFloat(increase.toFixed(2)),
      percent: parseFloat(percent.toFixed(1)),
      chartData,
      years: y,
    })
  }

  return (
    <div className={styles.wrapper}>
      {/* Header + Input */}
      <div className={styles.headerCard}>
        <div className={styles.headerRow}>
          <span className={`${styles.tag} ${styles.tagOrange}`}>FORECAST</span>
          <span className={styles.title}>Future Prediction</span>
          <span className={styles.hint}>Inflation ~5.5%/yr · Demand growth ~4%/yr</span>
        </div>

        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>YEARS IN FUTURE</label>
            <input
              className={styles.input}
              type="number"
              placeholder="e.g. 7"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              min="1"
              max="50"
            />
          </div>
          <button className={styles.forecastBtn} onClick={handleForecast}>
            🔮 Forecast
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className={styles.resultsWrapper}>
          {/* KPI row */}
          <div className={styles.kpiRow}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>Price in {result.years} Years</div>
              <div className={styles.kpiValue} style={{ color: '#f97316' }}>
                ₹ {result.futurePrice.toLocaleString()}
              </div>
              <div className={styles.kpiSub}>Inflation 5.5%/yr</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>Future Demand</div>
              <div className={styles.kpiValue} style={{ color: '#6366f1' }}>
                {result.futureDemand.toLocaleString()}
              </div>
              <div className={styles.kpiSub}>Units predicted</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>Price Increase</div>
              <div className={styles.kpiValue} style={{ color: '#10b981' }}>
                ₹ {result.increase.toLocaleString()}
              </div>
              <div className={styles.kpiSub}>From current price</div>
            </div>
          </div>

          {/* Probability indicator */}
          <div className={styles.probCard}>
            <div className={styles.probHeader}>
              <span className={styles.probIcon}>📊</span>
              <span className={styles.probLabel}>PRICE INCREASE PROBABILITY INDICATOR</span>
            </div>
            <div className={styles.probValue}>{result.percent}%</div>
            <div className={styles.probBar}>
              <div
                className={styles.probBarFill}
                style={{ width: `${Math.min(result.percent, 100)}%` }}
              />
            </div>
          </div>

          {/* Chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <span className={`${styles.tag} ${styles.tagBlue}`}>PROJECTION</span>
              <span className={styles.chartTitle}>Price & Demand Over Time</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={result.chartData} margin={{ top: 10, right: 40, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="year"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  tickFormatter={(v) => `₹${v}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  tickFormatter={(v) => `${v}u`}
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
                  formatter={(value, name) =>
                    name === 'Price (₹)' ? `₹${value}` : `${value} units`
                  }
                />
                <Legend
                  wrapperStyle={{
                    fontFamily: 'JetBrains Mono',
                    fontSize: 11,
                    color: '#94a3b8',
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="price"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#f97316' }}
                  name="Price (₹)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="demand"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#6366f1' }}
                  name="Demand (units)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
