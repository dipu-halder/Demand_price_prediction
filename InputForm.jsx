import React, { useState } from 'react'
import styles from './InputForm.module.css'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

const MONTH_MAP = {
  january:1, february:2, march:3, april:4, may:5, june:6,
  july:7, august:8, september:9, october:10, november:11, december:12
}

export default function InputForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    product_name: '',
    store_name: '',
    price: '',
    month: 'July',
    stock: '',
    past_sales: '',
    visits: '',
    promotion: false,
    holiday: false,
  })

  const [errors, setErrors] = useState({})

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }))
    if (errors[key]) setErrors((p) => ({ ...p, [key]: null }))
  }

  const validate = () => {
    const e = {}
    if (!form.product_name.trim()) e.product_name = 'Required'
    if (!form.store_name.trim()) e.store_name = 'Required'
    if (!form.price || isNaN(form.price) || parseFloat(form.price) <= 0) e.price = 'Enter valid price'
    if (!form.stock || isNaN(form.stock) || parseInt(form.stock) < 0) e.stock = 'Enter valid stock'
    if (!form.past_sales || isNaN(form.past_sales)) e.past_sales = 'Required'
    if (!form.visits || isNaN(form.visits)) e.visits = 'Required'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    const payload = {
      product_name: form.product_name.trim().toLowerCase(),
      store_name: form.store_name.trim().toLowerCase(),
      price: parseFloat(form.price),
      month: MONTH_MAP[form.month.toLowerCase()] || 7,
      stock: parseInt(form.stock),
      past_sales: parseInt(form.past_sales),
      visits: parseInt(form.visits),
      promotion: form.promotion,
      holiday: form.holiday,
    }
    onSubmit(payload)
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.tag}>INPUT</span>
        <span className={styles.cardTitle}>Product & Store Details</span>
        <span className={styles.cardHint}>Fill all fields · required for prediction</span>
      </div>

      <div className={styles.grid}>
        {/* Row 1 */}
        <Field label="Product Name" error={errors.product_name}>
          <input
            className={`${styles.input} ${errors.product_name ? styles.inputError : ''}`}
            placeholder="e.g. milk"
            value={form.product_name}
            onChange={(e) => set('product_name', e.target.value)}
          />
        </Field>

        <Field label="Store / City" error={errors.store_name}>
          <input
            className={`${styles.input} ${errors.store_name ? styles.inputError : ''}`}
            placeholder="e.g. kolkata"
            value={form.store_name}
            onChange={(e) => set('store_name', e.target.value)}
          />
        </Field>

        <Field label="Price (₹)" error={errors.price}>
          <input
            className={`${styles.input} ${errors.price ? styles.inputError : ''}`}
            type="number"
            placeholder="260"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
          />
        </Field>

        <Field label="Month">
          <select
            className={styles.input}
            value={form.month}
            onChange={(e) => set('month', e.target.value)}
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </Field>

        {/* Row 2 */}
        <Field label="Stock Available" error={errors.stock}>
          <input
            className={`${styles.input} ${errors.stock ? styles.inputError : ''}`}
            type="number"
            placeholder="10000"
            value={form.stock}
            onChange={(e) => set('stock', e.target.value)}
          />
        </Field>

        <Field label="Past Sales" error={errors.past_sales}>
          <input
            className={`${styles.input} ${errors.past_sales ? styles.inputError : ''}`}
            type="number"
            placeholder="1000"
            value={form.past_sales}
            onChange={(e) => set('past_sales', e.target.value)}
          />
        </Field>

        <Field label="Customer Visits" error={errors.visits}>
          <input
            className={`${styles.input} ${errors.visits ? styles.inputError : ''}`}
            type="number"
            placeholder="5000"
            value={form.visits}
            onChange={(e) => set('visits', e.target.value)}
          />
        </Field>

        <Field label="Promotion?">
          <div className={styles.toggle}>
            <button
              className={`${styles.toggleBtn} ${!form.promotion ? styles.toggleActive : ''}`}
              onClick={() => set('promotion', false)}
            >No</button>
            <button
              className={`${styles.toggleBtn} ${form.promotion ? styles.toggleActiveGreen : ''}`}
              onClick={() => set('promotion', true)}
            >Yes</button>
          </div>
        </Field>

        {/* Holiday row */}
        <Field label="Holiday?">
          <div className={styles.toggle}>
            <button
              className={`${styles.toggleBtn} ${!form.holiday ? styles.toggleActive : ''}`}
              onClick={() => set('holiday', false)}
            >No</button>
            <button
              className={`${styles.toggleBtn} ${form.holiday ? styles.toggleActiveGreen : ''}`}
              onClick={() => set('holiday', true)}
            >Yes</button>
          </div>
        </Field>
      </div>

      <button
        className={styles.submitBtn}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className={styles.spinner} />
            Calculating...
          </>
        ) : (
          <>⚡ Predict Demand</>
        )}
      </button>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  )
}
