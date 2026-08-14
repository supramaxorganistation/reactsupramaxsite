import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { useEffect, useState } from 'react'
import './Realizations.css'
import ProjectCarousel from '../components/ProjectCarousel'
import ErrorBoundary from '../components/ErrorBoundary'

export default function Realizations() {
  const { t } = useLanguage()

  const PROJECTS = [
    {
      title: 'Système de Batteries — Dépannage',
      location: 'Tunis',
      capacity: '—',
      type: 'Stockage & Dépannage',
      kpi1: { label: 'Continuité', value: 'Assurée' },
      kpi2: { label: 'Interruptions', value: '0' },
      desc: 'Installation d\'un système de batteries pour l\'alimentation de secours et le dépannage énergétique. Une solution fiable qui garantit la continuité de l\'électricité en cas de coupure, avec une gestion intelligente de la charge et de la décharge.',
      img: '/realisations/realisations-4.jpg',
      imgAlt: 'Installation de batteries système de dépannage',
      portrait: true,
    },
    {
      title: 'Installation Photovoltaïque Maison',
      location: 'Tunis',
      capacity: '8 kWp',
      type: t('real_residential'),
      kpi1: { label: 'Économie', value: '70%' },
      kpi2: { label: 'Interruptions', value: '0' },
      desc: 'Installation photovoltaïque complète pour une maison : panneaux sur toiture, onduleur performant et câblage soigné. Une solution qui couvre les besoins quotidiens du foyer, réduit considérablement la facture d\'électricité et assure une indépendance énergétique durable.',
      img: [
        '/realisations/realisations-5.jpg',
        '/realisations/realisations-6.jpg',
        '/realisations/realisations-7.jpg',
        '/realisations/realisations-8.jpg',
      ],
      imgAlt: 'Installation photovoltaïque maison',
      portrait: true,
    },
    {
      title: 'Installation Photovoltaïque Résidentielle',
      location: 'Tunis',
      capacity: '10 kWp',
      type: t('real_residential'),
      kpi1: { label: 'Économie', value: '65%' },
      kpi2: { label: 'Production', value: '15 MWh/an' },
      desc: 'Installation photovoltaïque complète pour une résidence : panneaux haute performance sur toiture, onduleur de dernière génération et finitions soignées. Une solution conçue pour couvrir la consommation du foyer, réduire durablement la facture et valoriser le patrimoine.',
      img: [
        '/realisations/realisations-9.jpg',
        '/realisations/realisations-10.jpg',
        '/realisations/realisations-11.jpg',
        '/realisations/realisations-12.jpg',
      ],
      imgAlt: 'Installation photovoltaïque résidentielle',
      portrait: true,
    },
    {
      title: 'Installation Photovoltaïque Menzah',
      location: 'Menzah',
      capacity: '6 kWp',
      type: t('real_residential'),
      kpi1: { label: 'Économie', value: '75%' },
      kpi2: { label: 'Interruptions', value: '0' },
      desc: 'Installation photovoltaïque pour une résidence à Menzah : panneaux solaires sur toiture, onduleur performant et raccordement soigné. Une solution qui assure l\'autonomie du foyer, réduit fortement la facture et s\'intègre élégamment à la maison.',
      img: [
        '/realisations/realisations-13.jpg',
        '/realisations/realisations-14.jpg',
        '/realisations/realisations-15.jpg',
        '/realisations/realisations-16.jpg',
      ],
      imgAlt: 'Installation photovoltaïque Menzah',
      portrait: true,
    },
    {
      title: 'Nouvelle Installation Familiale',
      location: 'Tunis',
      capacity: '5 kWp',
      type: t('real_residential'),
      kpi1: { label: 'Économie', value: '70%' },
      kpi2: { label: 'Autonomie', value: 'Optimale' },
      desc: 'Une nouvelle installation, une nouvelle famille qui choisit l\'énergie solaire. Merci à nos clients pour leur confiance. Chez SupraMax Energy, nous transformons chaque projet en une solution durable, économique et tournée vers l\'avenir.',
      img: [
        '/realisations/realisations-17.jpg',
        '/realisations/realisations-18.jpg',
        '/realisations/realisations-19.jpg',
        '/realisations/realisations-20.jpg',
      ],
      imgAlt: 'Nouvelle installation familiale photovoltaïque',
      portrait: true,
    },
  ]

  const [externalProjects, setExternalProjects] = useState([])

  useEffect(() => {
    setExternalProjects([])
  }, [])

  return (
    <>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="page-hero">
        <div className="page-hero__bg" />
        <div className="page-hero__content container" data-reveal>
          <span className="eyebrow">{t('realizations_eyebrow')}</span>
          <h1 className="page-hero__title">{t('realizations_hero_title')}</h1>
          <p className="page-hero__subtitle">
            {t('realizations_hero_subtitle')}
          </p>
          <div className="page-hero__strengths" data-stagger>
            <div className="page-hero__strength">
              <span className="material-symbols-outlined">home</span>
              <span>{t('real_residential')}</span>
            </div>
            <div className="page-hero__strength">
              <span className="material-symbols-outlined">apartment</span>
              <span>{t('real_commercial')}</span>
            </div>
            <div className="page-hero__strength">
              <span className="material-symbols-outlined">factory</span>
              <span>{t('real_industrial')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Portfolio Grid ───────────────────────────── */}

      <section className="section section--lg">
        <div className="container">
          <ErrorBoundary>
          <div className="portfolio-grid" data-stagger>
            {[...PROJECTS, ...externalProjects].map((project, i) => (
              <div className={`project-card${project.portrait ? ' project-card--portrait' : ''}`} key={i}>
                <div className={`project-card__visual${project.portrait ? ' project-card__visual--portrait' : ''}`}>
                  {Array.isArray(project.img) ? (
                    <ProjectCarousel images={project.img} alt={project.imgAlt} className={`project-card__img${project.portrait ? ' project-card__img--portrait' : ''}`} />
                  ) : (
                    <img
                      src={project.img}
                      alt={project.imgAlt}
                      className={`project-card__img${project.portrait ? ' project-card__img--portrait' : ''}`}
                      loading="lazy"
                    />
                  )}
                  <div className="project-card__overlay" />
                  <span className="project-card__capacity">{project.capacity}</span>
                  <span className="project-card__type">{project.type}</span>
                </div>
                <div className="project-card__body">
                  <div className="project-card__header">
                    <h3>{project.title}</h3>
                    <span className="project-card__location">
                      <span className="material-symbols-outlined">location_on</span>
                      {project.location}
                    </span>
                  </div>
                  <p className="project-card__desc">{project.desc}</p>
                  <div className="project-card__kpis">
                    <div className="project-card__kpi">
                      <span className="project-card__kpi-value">{project.kpi1.value}</span>
                      <span className="project-card__kpi-label">{project.kpi1.label}</span>
                    </div>
                    <div className="project-card__kpi">
                      <span className="project-card__kpi-value">{project.kpi2.value}</span>
                      <span className="project-card__kpi-label">{project.kpi2.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </ErrorBoundary>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────── */}
      <section className="section stats-inline">
        <div className="container" data-reveal>
          <div className="stats-inline__inner">
            <div className="stats-inline__item">
              <span className="stats-inline__number">150+</span>
              <span className="stats-inline__label">{t('real_stat_projects')}</span>
            </div>
            <div className="stats-inline__divider" />
            <div className="stats-inline__item">
              <span className="stats-inline__number">100%</span>
              <span className="stats-inline__label">{t('real_stat_uptime')}</span>
            </div>
            <div className="stats-inline__divider" />
            <div className="stats-inline__item">
              <span className="stats-inline__number">3</span>
              <span className="stats-inline__label">{t('real_stat_segments')}</span>
            </div>
            <div className="stats-inline__divider" />
            <div className="stats-inline__item">
              <span className="stats-inline__number">1</span>
              <span className="stats-inline__label">{t('real_stat_standard')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── What Projects Show ───────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="what-changes__grid">
            <div className="what-changes__content" data-reveal>
              <span className="eyebrow">{t('real_what_eyebrow')}</span>
              <h2>
                {t('real_what_title')}
              </h2>
              <p>
                {t('real_what_desc')}
              </p>
            </div>

<div className="quote-card card--glass" data-reveal="right">
  <blockquote>
    {t('real_quote')}
  </blockquote>
  <cite>— SupraMax Energy</cite>
</div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container" data-reveal>
          <div className="cta-section__inner">
            <h2>{t('real_cta_title')}</h2>
            <p>
              {t('real_cta_desc')}
            </p>
            <Link to="/contact" className="btn btn--secondary btn--lg">
              {t('real_cta_btn')}
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
