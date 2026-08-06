import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SettingsPopup from './SettingsPopup'
import { useLanguage } from '../i18n/LanguageContext'
import './Header.css'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { t } = useLanguage()

  const NAV_LINKS = [
    { to: '/', label: t('nav_home') },
    { to: '/services', label: t('nav_services') },
    { to: '/a-propos', label: t('nav_about') },
    { to: '/realisations', label: t('nav_realizations') },
    { to: '/contact', label: t('nav_contact') },
  ]

  useEffect(() => {
    setOpen(false)
  }, [location])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__inner container--wide">
        <Link to="/" className="header__brand" aria-label="SupraMax Energy — Accueil">
          <img src="/logo.png" alt="SupraMax Energy" className="header__logo-img" />
          <span className="header__logo-text">
            <span className="header__company-name">SupraMax Energy</span>
            <span className="header__tagline">{t('tagline')}</span>
          </span>
        </Link>

        <nav className="header__nav" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`header__nav-link ${location.pathname === link.to ? 'header__nav-link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link to="/contact" className="btn btn--secondary header__cta">
          {t('cta_quote')}
        </Link>

        <SettingsPopup />

        <button
          className="header__burger"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
        >
          <span className="material-symbols-outlined">
            {open ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      <div className={`mobile-nav ${open ? 'mobile-nav--open' : ''}`} aria-hidden={!open}>
        <nav className="mobile-nav__inner" aria-label="Navigation mobile">
          <Link to="/" className="mobile-nav__brand" aria-label="SupraMax Energy — Accueil">
            <img src="/logo.png" alt="SupraMax Energy" className="mobile-nav__logo-img" />
            <span className="mobile-nav__brand-text">
              <span className="mobile-nav__company-name">SupraMax Energy</span>
              <span className="mobile-nav__tagline">{t('tagline')}</span>
            </span>
          </Link>

          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`mobile-nav__link ${location.pathname === link.to ? 'mobile-nav__link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/contact" className="btn btn--secondary mobile-nav__cta">
            {t('cta_quote')}
          </Link>
          <div className="mobile-nav__theme">
            <SettingsPopup />
          </div>
        </nav>
      </div>
    </header>
  )
}
