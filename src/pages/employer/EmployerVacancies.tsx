import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WelcomeBanner } from '../../components/layout/WelcomeBanner';
import { FormAlert } from '../../components/auth/FormAlert';
import { Icon } from '../../components/ui/Icon';
import { ApiError } from '../../services/api';
import { vacanciesService } from '../../services/vacancies';
import type { EmployerVacancies as EmployerVacanciesData, EmployerVacancy } from '../../types/vacancy';
import { MODALITY_LABEL, timeAgo } from '../../utils/format';

interface Result {
  key: number;
  data?: EmployerVacanciesData;
  error?: string;
}

/** VacantesEmpleador (docs/prototype/VacantesEmpleador.dc.html). */
export default function EmployerVacancies() {
  const flash = (useLocation().state as { flash?: string } | null)?.flash;
  const [reload, setReload] = useState(0);
  const [result, setResult] = useState<Result>({ key: -1 });
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    vacanciesService
      .listMine()
      .then((data) => !cancelled && setResult({ key: reload, data }))
      .catch((e) => {
        if (!cancelled) setResult({ key: reload, error: e instanceof ApiError ? e.message : 'Error inesperado' });
      });
    return () => {
      cancelled = true;
    };
  }, [reload]);

  async function toggleStatus(v: EmployerVacancy) {
    setBusyId(v.id);
    setActionError(null);
    try {
      const updated = await vacanciesService.setStatus(v.id, v.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE');
      setResult((r) =>
        r.data
          ? {
              ...r,
              data: {
                ...r.data,
                items: r.data.items.map((i) => (i.id === v.id ? { ...i, status: updated.status } : i)),
                stats: {
                  ...r.data.stats,
                  activeVacancies: r.data.stats.activeVacancies + (updated.status === 'ACTIVE' ? 1 : -1),
                },
              },
            }
          : r,
      );
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'No pudimos cambiar el estado de la vacante.');
    } finally {
      setBusyId(null);
    }
  }

  const data = result.data;
  const canPublish = data?.company.canPublish ?? false;

  return (
    <div className="page">
      <header className="page__header">
        <WelcomeBanner message="¡Hola! Acá gestionás tus búsquedas. Cada candidato lo revisa una persona de tu equipo." />
        <div className="page__titles page__titles--row">
          <div>
            <h1 className="page__title">Mis vacantes</h1>
            <p className="page__subtitle">
              {data ? `${data.company.name} · ` : ''}cada candidato lo revisa una persona de tu equipo
            </p>
          </div>
          {canPublish ? (
            <Link to="/empleador/publicar" className="btn btn--primary">
              <Icon name="plus" size={16} /> Publicar vacante
            </Link>
          ) : (
            <button type="button" className="btn btn--primary" disabled title="Tu empresa todavía no fue verificada">
              <Icon name="plus" size={16} /> Publicar vacante
            </button>
          )}
        </div>

        {data && !canPublish && (
          <div className="notice notice--warning" role="status">
            <strong>Tu empresa está en verificación.</strong> Un administrador la va a revisar; cuando la apruebe vas a
            poder publicar y editar vacantes.
          </div>
        )}
        {flash && (
          <div className="notice notice--success" role="status">
            {flash}
          </div>
        )}

        {data && (
          <div className="stats">
            <div className="stat">
              <div className="stat__value">{data.stats.activeVacancies}</div>
              <div className="stat__label">Vacantes activas</div>
            </div>
            <div className="stat stat--review">
              <div className="stat__value">{data.stats.inReview}</div>
              <div className="stat__label">Candidatos en revisión</div>
            </div>
            <div className="stat stat--interview">
              <div className="stat__value">{data.stats.inInterview}</div>
              <div className="stat__label">En etapa de entrevista</div>
            </div>
            <div className="stat stat--response">
              <div className="stat__value">
                {data.stats.avgResponseHours !== null ? `${Math.round(data.stats.avgResponseHours / 24)}d` : '—'}
              </div>
              <div className="stat__label">Tiempo promedio de respuesta</div>
            </div>
          </div>
        )}
      </header>

      <div className="page__scroll">
        <FormAlert>{actionError}</FormAlert>
        {result.key !== reload ? (
          <div className="vacancy-list" aria-busy="true" aria-label="Cargando vacantes">
            {[0, 1, 2].map((i) => (
              <div key={i} className="vacancy-row vacancy-row--skeleton" />
            ))}
          </div>
        ) : result.error || !data ? (
          <div className="state-box" role="alert">
            <p className="state-box__title">No pudimos cargar tus vacantes</p>
            <p className="state-box__text">{result.error}</p>
            <button type="button" className="btn btn--primary" onClick={() => setReload((n) => n + 1)}>
              Reintentar
            </button>
          </div>
        ) : data.items.length === 0 ? (
          <div className="state-box">
            <p className="state-box__title">Todavía no publicaste vacantes</p>
            <p className="state-box__text">
              {canPublish
                ? 'Publicá la primera y empezá a recibir postulaciones.'
                : 'Vas a poder publicar cuando tu empresa esté verificada.'}
            </p>
            {canPublish && (
              <Link to="/empleador/publicar" className="btn btn--primary">
                Publicar vacante
              </Link>
            )}
          </div>
        ) : (
          <ul className="vacancy-list">
            {data.items.map((v) => (
              <li key={v.id} className="vacancy-row">
                <Link to={`/empleador/vacantes/${v.id}/editar`} className="vacancy-row__main">
                  <div className="vacancy-row__info">
                    <div className="vacancy-row__title">
                      {v.title}
                      {v.featured && <span className="chip chip--featured-employer">★ Destacada</span>}
                    </div>
                    <div className="vacancy-row__meta">
                      {MODALITY_LABEL[v.modality]} · {v.location} · publicada {timeAgo(v.createdAt)}
                    </div>
                  </div>
                  <div className="vacancy-row__counts">
                    <div>
                      <div className="vacancy-row__count">{v.applications.total}</div>
                      <div className="vacancy-row__count-label">postulantes</div>
                    </div>
                    <div>
                      <div className="vacancy-row__count vacancy-row__count--review">{v.applications.review}</div>
                      <div className="vacancy-row__count-label">en revisión</div>
                    </div>
                    <div>
                      <div className="vacancy-row__count vacancy-row__count--interview">{v.applications.interview}</div>
                      <div className="vacancy-row__count-label">entrevista</div>
                    </div>
                  </div>
                  <span className={`status-chip status-chip--${v.status === 'ACTIVE' ? 'open' : 'paused'}`}>
                    {v.status === 'ACTIVE' ? 'Abierta' : 'Pausada'}
                  </span>
                  <Icon name="pencil" size={16} className="vacancy-row__chevron" />
                </Link>
                {canPublish && (
                  <div className="vacancy-row__actions">
                    <button
                      type="button"
                      className="icon-action"
                      onClick={() => toggleStatus(v)}
                      disabled={busyId === v.id}
                      title={v.status === 'ACTIVE' ? 'Pausar vacante' : 'Reactivar vacante'}
                      aria-label={`${v.status === 'ACTIVE' ? 'Pausar' : 'Reactivar'} ${v.title}`}
                    >
                      <Icon name={v.status === 'ACTIVE' ? 'pause' : 'play'} size={15} />
                    </button>
                    <Link
                      to={`/empleador/publicar?desde=${v.id}`}
                      className="icon-action"
                      title="Duplicar vacante"
                      aria-label={`Duplicar ${v.title}`}
                    >
                      <Icon name="copy" size={15} />
                    </Link>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
