import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import './Footer.css'

export default function Footer() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__inner container--wide">
        <div className="footer__top">
          <div className="footer__brand">
            <div className="footer__logo">
              <img src="/logo.png" alt="SupraMax Energy" className="footer__logo-img" />
              <div>
                <span className="footer__company-name">SupraMax Energy</span>
                <span className="footer__tagline">{t('tagline')}</span>
              </div>
            </div>
            <p className="footer__desc">
              {t('footer_desc')}
            </p>
          </div>

          <div className="footer__links-group">
            <h4 className="footer__heading">{t('footer_nav')}</h4>
            <nav aria-label="Footer navigation">
              <Link to="/" className="footer__link">{t('nav_home')}</Link>
              <Link to="/services" className="footer__link">{t('nav_services')}</Link>
              <Link to="/a-propos" className="footer__link">{t('nav_about')}</Link>
              <Link to="/realisations" className="footer__link">{t('nav_realizations')}</Link>
              <Link to="/contact" className="footer__link">{t('nav_contact')}</Link>
            </nav>
          </div>

          <div className="footer__links-group">
            <h4 className="footer__heading">{t('footer_services')}</h4>
            <nav>
              <Link to="/services" className="footer__link">{t('footer_service_audit')}</Link>
              <Link to="/services" className="footer__link">{t('footer_service_install')}</Link>
              <Link to="/services" className="footer__link">{t('footer_service_storage')}</Link>
              <Link to="/services" className="footer__link">{t('footer_service_monitoring')}</Link>
            </nav>
          </div>

          <div className="footer__links-group">
            <h4 className="footer__heading">{t('footer_contact')}</h4>
            <div className="footer__contact-items">
              <div className="footer__contact-item">
                <span className="material-symbols-outlined">location_on</span>
                <span>{t('contact_address_value')}</span>
              </div>
              <div className="footer__contact-item">
                <span className="material-symbols-outlined">call</span>
                <a href="tel:+21696453635" className="footer__contact-link">+216 96 453 635</a>
              </div>
              <div className="footer__contact-item">
                <span className="material-symbols-outlined">mail</span>
                <a href="mailto:contact@supramaxenergy.tn" className="footer__contact-link">contact@supramaxenergy.tn</a>
              </div>
              <div className="footer__contact-item">
                <span className="material-symbols-outlined">public</span>
                <div className="footer__socials">
                  <a href="https://www.facebook.com/profile.php?id=100064150808045" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.971h-1.513c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="https://www.instagram.com/supramaxenergy" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            &copy; {year} SupraMax Energy. {t('footer_rights')}
          </p>
          <div className="footer__bottom-links">
            <a href="#" className="footer__link--sm">{t('footer_legal')}</a>
            <a href="#" className="footer__link--sm">{t('footer_privacy')}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
