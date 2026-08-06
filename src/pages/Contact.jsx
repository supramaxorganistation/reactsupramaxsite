import { useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import MapPicker from '../components/MapPicker'
import ReCAPTCHA from 'react-google-recaptcha'
import './Contact.css'

const WHATSAPP_NUMBER = '21692660716'
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''
const WEB3FORMS_SUBMIT_URL = 'https://api.web3forms.com/submit'
const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY
const VERIFY_RECAPTCHA_URL = '/api/verify-recaptcha'

export default function Contact() {
  const { t } = useLanguage()

  const SERVICE_OPTIONS = [
    { value: 'audit', label: t('opt_audit') },
    { value: 'install', label: t('opt_install') },
    { value: 'storage', label: t('opt_storage') },
    { value: 'monitoring', label: t('opt_monitoring') },
  ]

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    building: '',
    city: '',
    reference: '',
    service: '',
    message: '',
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [location, setLocation] = useState(null)
  const [captchaToken, setCaptchaToken] = useState('')
  const captchaRef = useRef(null)

  const googleMapsUrl = location
    ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
    : ''

  const mailtoUrl = useMemo(() => {
    const subj = encodeURIComponent('Demande de contact - SupraMax Energy')
    const body = encodeURIComponent(
      `Bonjour,\n\n${location?.address ? `Adresse sélectionnée : ${location.address}\n` : ''}${googleMapsUrl ? `Google Maps : ${googleMapsUrl}\n` : ''}\n`
    )
    return `mailto:contact@supramax.energy?subject=${subj}&body=${body}`
  }, [location])

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = t('err_name')
    if (!form.email.trim()) errs.email = t('err_email')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = t('err_email_invalid')
    if (!form.phone.trim()) errs.phone = t('err_phone')
    if (!form.service) errs.service = t('err_service')
    if (form.reference.trim() && !/^\d{9}$/.test(form.reference.trim())) errs.reference = 'La référence doit contenir exactement 9 chiffres'
    return errs
  }

  const whatsappUrl = useMemo(() => {
    if (!submitted) return '#'
    const svc = SERVICE_OPTIONS.find(s => s.value === form.service)?.label || form.service
    const locationLine = location
      ? `\nLocalisation: ${googleMapsUrl}`
      : ''
    const text = encodeURIComponent(
      `Nouvelle demande de contact\n\nNom: ${form.name}\nTél: ${form.phone}\nEmail: ${form.email}\nVille: ${form.city || '-'}\nService: ${svc}${locationLine}\n\nMessage:\n${form.message}`
    )
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
  }, [submitted, form, location, googleMapsUrl])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    if (!captchaToken) {
      setSendError('Veuillez confirmer que vous n\'êtes pas un robot.')
      return
    }

    try {
      setSending(true)

      const verifyResp = await fetch(VERIFY_RECAPTCHA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captchaToken }),
      })

      const verifyText = await verifyResp.text()
      let verifyData = {}

      try {
        verifyData = verifyText ? JSON.parse(verifyText) : {}
      } catch {
        verifyData = { error: 'Réponse inattendue du serveur.' }
      }

      if (!verifyResp.ok || verifyData.success === false) {
        setSendError(verifyData.error || verifyData.message || 'reCAPTCHA verification failed')
        return
      }

      const payload = {
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `Nouvelle demande - ${form.name}`,
        name: form.name,
        phone: form.phone,
        email: form.email,
        building: form.building || '-',
        city: form.city,
        reference: form.reference || '-',
        latitude: location?.latitude || '',
        longitude: location?.longitude || '',
        google_maps_url: googleMapsUrl,
        service: SERVICE_OPTIONS.find(s => s.value === form.service)?.label || form.service,
        message: form.message,
      }

      const resp = await fetch(WEB3FORMS_SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const responseText = await resp.text()
      let data = {}

      try {
        data = responseText ? JSON.parse(responseText) : {}
      } catch {
        data = { error: 'Réponse inattendue du serveur.' }
      }

      if (!resp.ok) {
        setSendError(data.error || data.message || 'Erreur lors de l\'envoi. Réessayez plus tard.')
        setSending(false)
        return
      }

      if (data.success === false) {
        setSendError(data.error || data.message || 'Erreur lors de l\'envoi. Réessayez plus tard.')
        setSending(false)
        return
      }

      setSubmitted(true)
      window.scrollTo(0, 0)
      captchaRef.current?.reset()
      setCaptchaToken('')
    } catch (err) {
      setSendError('Erreur réseau. Réessayez plus tard.')
    } finally {
      setSending(false)
    }
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (field === 'city') setLocation(null)
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
    setSendError('')
  }

  if (submitted) {
    return (
      <section className="section contact-success">
        <div className="container">
          <div className="contact-success__inner">
            <span className="material-symbols-outlined contact-success__icon">check_circle</span>
            <h2>{t('contact_success_title')}</h2>
            <p>{t('contact_success_desc')}</p>
            <div className="contact-success__actions">
              <Link to="/" className="btn btn--primary">
                {t('contact_success_btn')}
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--whatsapp"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="page-hero">
        <div className="page-hero__bg" />
        <div className="page-hero__content container" data-reveal>
          <span className="eyebrow">{t('contact_eyebrow')}</span>
          <h1 className="page-hero__title">
            {t('contact_hero_title')}
          </h1>
          <p className="page-hero__subtitle">
            {t('contact_hero_subtitle')}
          </p>
          <div className="page-hero__strengths" data-stagger>
            <div className="page-hero__strength">
              <span className="material-symbols-outlined">schedule</span>
              <span>{t('contact_strength1')}</span>
            </div>
            <div className="page-hero__strength">
              <span className="material-symbols-outlined">forum</span>
              <span>{t('contact_strength2')}</span>
            </div>
            <div className="page-hero__strength">
              <span className="material-symbols-outlined">lock</span>
              <span>{t('contact_strength3')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Form + Info ──────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Form */}
            <div className="contact-form-wrap" data-reveal>
              <h2>{t('contact_form_title')}</h2>
              <p className="contact-form-wrap__desc">
                {t('contact_form_desc')}
              </p>

              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">{t('contact_name')}</label>
                    <input
                      id="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange('name')}
                      placeholder={t('contact_name_placeholder')}
                      className={errors.name ? 'input--error' : ''}
                    />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">{t('contact_phone')}</label>
                    <input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange('phone')}
                      placeholder={t('contact_phone_placeholder')}
                      className={errors.phone ? 'input--error' : ''}
                    />
                    {errors.phone && <span className="form-error">{errors.phone}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">{t('contact_email')}</label>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange('email')}
                      placeholder={t('contact_email_placeholder')}
                      className={errors.email ? 'input--error' : ''}
                    />
                    {errors.email && <span className="form-error">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="building">{t('contact_building')}</label>
                    <select
                      id="building"
                      value={form.building}
                      onChange={handleChange('building')}
                    >
                      <option value="">{t('contact_building_select')}</option>
                      <option value="home">{t('opt_home')}</option>
                      <option value="office">{t('opt_office')}</option>
                      <option value="company">{t('opt_company')}</option>
                      <option value="factory">{t('opt_factory')}</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="city">{t('contact_city')}</label>
                  <div className="city-input-row">
                    <input
                      id="city"
                      type="text"
                      value={form.city}
                      onChange={handleChange('city')}
                      placeholder={t('contact_city_placeholder')}
                    />
                    <button
                      type="button"
                      className="city-map-btn"
                      onClick={() => setShowMap(true)}
                      title="Choisir sur la carte"
                    >
                      <span className="material-symbols-outlined">map</span>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reference">
                    Référence (optionnel)
                    <a
                      href="/guide-reference.pdf"
                      download
                      className="ref-help-btn"
                      title="Télécharger le guide"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="material-symbols-outlined">help_outline</span>
                    </a>
                  </label>
                  <input
                    id="reference"
                    type="text"
                    inputMode="numeric"
                    maxLength={9}
                    value={form.reference}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 9)
                      setForm(prev => ({ ...prev, reference: val }))
                      if (errors.reference) {
                        setErrors(prev => { const n = { ...prev }; delete n.reference; return n })
                      }
                    }}
                    placeholder="9 chiffres"
                    className={errors.reference ? 'input--error' : ''}
                  />
                  {errors.reference && <span className="form-error">{errors.reference}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="service">{t('contact_service')}</label>
                  <select
                    id="service"
                    value={form.service}
                    onChange={handleChange('service')}
                    className={errors.service ? 'input--error' : ''}
                  >
                    <option value="">{t('contact_service_select')}</option>
                    {SERVICE_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  {errors.service && <span className="form-error">{errors.service}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="message">
                    {t('contact_message')}
                    <span className="label-optional">(optionnel)</span>
                  </label>
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={handleChange('message')}
                    placeholder={t('contact_message_placeholder')}
                    rows={5}
                  />
                </div>

                {sendError && <span className="form-error" style={{ fontSize: 'var(--text-small)' }}>{sendError}</span>}

                <div className="form-group contact-captcha">
                  <ReCAPTCHA
                    ref={captchaRef}
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={(val) => setCaptchaToken(val || '')}
                    hl="fr"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn--primary btn--lg contact-form__submit"
                  disabled={sending}
                >
                  {sending ? 'Envoi en cours...' : t('contact_submit')}
                  <span className="material-symbols-outlined">{sending ? 'hourglass_top' : 'send'}</span>
                </button>
              </form>
            </div>

            {/* Sidebar */}
            <div className="contact-sidebar" data-reveal="right">
              <div className="contact-info-cards">
                <div className="contact-info-card">
                  <span className="material-symbols-outlined">location_on</span>
                  <div>
                    <h4>{t('contact_address')}</h4>
                    <p>{t('contact_address_value')}</p>
                  </div>
                </div>
                <div className="contact-info-card">
                  <span className="material-symbols-outlined">call</span>
                  <div>
                    <h4>{t('contact_phone_label')}</h4>
                    <p>+216 71 000 000</p>
                  </div>
                </div>
                <div className="contact-info-card">
                  <span className="material-symbols-outlined">mail</span>
                  <div>
                    <h4>{t('contact_email_label')}</h4>
                    <a href={mailtoUrl} className="contact-info-link">contact@supramax.energy</a>
                  </div>
                </div>
              </div>

              <div className="faq-cards">
                <div className="faq-card">
                  <h4>
                    <span className="material-symbols-outlined">help</span>
                    {t('contact_faq1_title')}
                  </h4>
                  <ul>
                    <li>{t('contact_faq1_1')}</li>
                    <li>{t('contact_faq1_2')}</li>
                    <li>{t('contact_faq1_3')}</li>
                    <li>{t('contact_faq1_4')}</li>
                  </ul>
                </div>
                <div className="faq-card">
                  <h4>
                    <span className="material-symbols-outlined"> Assignment</span>
                    {t('contact_faq2_title')}
                  </h4>
                  <ul>
                    <li>{t('contact_faq2_1')}</li>
                    <li>{t('contact_faq2_2')}</li>
                    <li>{t('contact_faq2_3')}</li>
                    <li>{t('contact_faq2_4')}</li>
                  </ul>
                </div>
              </div>

              <a href={location ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Bonjour,\n\n${location.address}\n${googleMapsUrl}`)}` : `https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="btn btn--whatsapp contact-sidebar__cta">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {t('contact_call_btn')}
              </a>
              <Link to="/services" className="btn btn--ghost contact-sidebar__link">
                {t('contact_services_link')}
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {showMap && (
        <div className="map-modal" onClick={() => setShowMap(false)}>
          <div className="map-modal__content" onClick={(e) => e.stopPropagation()}>
            <div className="map-modal__header">
              <h3>
                <span className="material-symbols-outlined">map</span>
                Choisir l'adresse
              </h3>
              <button className="map-modal__close" onClick={() => setShowMap(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <MapPicker
              initial={location}
              onSelect={(loc) => {
                setForm(prev => ({ ...prev, city: loc.address }))
                setLocation(loc)
                setShowMap(false)
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
