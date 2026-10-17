import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { VerifiedBadge } from '../../components/ui/VerifiedBadge';
import { CompanyLogo } from '../../components/vacancies/CompanyLogo';
import { MatchSlot } from '../../components/vacancies/MatchSlot';
import { ApiError } from '../../services/api';
import { vacanciesService } from '../../services/vacancies';
import type { VacancyDetail } from '../../types/vacancy';
import {
  formatResponseTime,
  formatSalary,
  MODALITY_LABEL,
  RESPONSE_LABEL,
  responseSpeed,
  timeAgo,
} from '../../utils/format';

interface Result {
  id: string;
  data?: VacancyDetail;
  error?: { status: number; message: string };
}

/** DetalleOferta (docs/prototype/DetalleOferta.dc.html). */
export default function JobDetail() {
  const { id = '' } = useParams();
  const returnTo = (useLocation().state as { returnTo?: string } | null)?.returnTo ?? '/empleado/buscar';
  const [reload, setReload] = useState(0);
  const [result, setResult] = useState<Result>({ id: '' });
  const key = `${id}#${reload}`;

  useEffect(() => {
    let cancelled = false;
    const k = `${id}#${reload}`;
    vacanciesService
      .get(Number(id))
      .then((data) => !cancelled && setResult({ id: k, data }))
      .catch((e) => {
        if (cancelled) return;
        setResult({
          id: k,
          error: e instanceof ApiError ? { status: e.status, message: e.message } : { status: 0, message: 'Error inesperado' },
        });
      });
    return () => {
      cancelled = true;
    };
  }, [id, reload]);

  const backLink = (
    <Link to={returnTo} className="back-link">
      <Icon name="chevronLeft" size={14} strokeWidth={2.5} /> Volver a la búsqueda
    </Link>
  );

  if (result.id !== key) {
    return (
      <div className="page">
        <header className="page__header page__header--bordered">{backLink}</header>
        <p className="route-loading route-loading--inline" role="status">
          Cargando la oferta…
        </p>
      </div>
    );
  }

  if (result.error || !result.data) {
    const notFound = result.error?.status === 404 || result.error?.status === 400;
    return (
      <div className="page">
        <header className="page__header page__header--bordered">{backLink}</header>
        <div className="page__scroll">
          <div className="state-box" role="alert">
            <p className="state-box__title">
              {notFound ? 'Esta oferta ya no está disponible' : 'No pudimos cargar la oferta'}
            </p>
            <p className="state-box__text">
              {notFound
                ? 'Puede que la empresa la haya pausado o cerrado. Hay muchas otras esperándote.'
                : result.error?.message}
            </p>
            {notFound ? (
              <Link to="/empleado/buscar" className="btn btn--primary">
                Ver otras búsquedas
              </Link>
            ) : (
              <button type="button" className="btn btn--primary" onClick={() => setReload((n) => n + 1)}>
                Reintentar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const v = result.data;
  const salary = formatSalary(v.salary);
  const speed = responseSpeed(v.company.avgResponseHours);

  return (
    <div className="page">
      <header className="page__header page__header--bordered">
        {backLink}
        <div className="detail-head">
          <div className="detail-head__identity">
            <CompanyLogo company={v.company} size={52} />
            <div>
              <h1 className="detail-head__title">{v.title}</h1>
              <div className="detail-head__company">
                {v.company.name}
                {v.company.verified && (
                  <>
                    <VerifiedBadge size={14} />
                    <span className="detail-head__verified">· Empresa verificada</span>
                  </>
                )}
                {v.featured && <span className="chip chip--featured">★ Empresa Transparente</span>}
              </div>
            </div>
          </div>
          <MatchSlot size="lg" />
        </div>
      </header>

      <div className="page__scroll">
        <div className="detail-grid">
          <div className="detail-main">
            <section>
              <h2 className="section-title">Descripción del puesto</h2>
              <p className="detail-text">{v.description}</p>
            </section>
            <section>
              <h2 className="section-title">Skills buscadas</h2>
              {v.skills.length ? (
                <ul className="chips chips--lg">
                  {v.skills.map((s) => (
                    <li key={s.id} className="chip chip--neutral">
                      {s.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="detail-text detail-text--muted">La empresa no detalló skills.</p>
              )}
              <p className="detail-note">
                Cuando cargues tu CV vas a ver acá qué skills coinciden con tu perfil. Es solo orientativo: la decisión
                siempre la toma una persona.
              </p>
            </section>
          </div>

          <aside className="detail-side">
            <dl className="facts">
              <div className="facts__row">
                <dt>Modalidad</dt>
                <dd>{MODALITY_LABEL[v.modality]}</dd>
              </div>
              <div className="facts__row">
                <dt>Ubicación</dt>
                <dd>{v.location}</dd>
              </div>
              <div className="facts__row">
                <dt>Rango salarial</dt>
                <dd>{salary ?? 'No informado'}</dd>
              </div>
              <div className="facts__row">
                <dt>Publicada</dt>
                <dd>{timeAgo(v.createdAt)}</dd>
              </div>
            </dl>

            <div className={`response-card response-card--${speed}`}>
              <Icon name="clock" size={18} />
              <div>
                <div className="response-card__title">{RESPONSE_LABEL[speed]}</div>
                <div className="response-card__text">
                  {v.company.avgResponseHours !== null
                    ? `Tiempo promedio de respuesta: ${formatResponseTime(v.company.avgResponseHours)}`
                    : 'Todavía no hay datos de cuánto tarda esta empresa en responder.'}
                </div>
              </div>
            </div>

            <button type="button" className="btn btn--primary btn--block" disabled aria-describedby="apply-soon">
              Postularme
            </button>
            <button type="button" className="btn btn--outline btn--block" disabled aria-describedby="apply-soon">
              <Icon name="users" size={16} /> Seguir a esta empresa
            </button>
            <p id="apply-soon" className="detail-note">
              Las postulaciones se habilitan muy pronto.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
