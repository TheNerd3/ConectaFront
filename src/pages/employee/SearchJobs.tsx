import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { WelcomeBanner } from '../../components/layout/WelcomeBanner';
import { Mascot } from '../../components/mascot/Mascot';
import { Icon } from '../../components/ui/Icon';
import { Pagination } from '../../components/vacancies/Pagination';
import { SkillPicker } from '../../components/vacancies/SkillPicker';
import { VacancyCard } from '../../components/vacancies/VacancyCard';
import { useAuth } from '../../hooks/useAuth';
import { ApiError } from '../../services/api';
import { vacanciesService } from '../../services/vacancies';
import type { Modality, Skill, VacancyPage, VacancySearchParams, VacancySort } from '../../types/vacancy';

const MODALITY_FILTERS: { label: string; value?: Modality }[] = [
  { label: 'Todas' },
  { label: 'Remoto', value: 'REMOTE' },
  { label: 'Híbrido', value: 'HYBRID' },
  { label: 'Presencial', value: 'ONSITE' },
];

// Los filtros viven en la URL (se pueden compartir y el botón "atrás" funciona).
// skills=12:React,5:Node.js guarda id y nombre para poder mostrar las pastillas.
function parseSkills(raw: string | null): Skill[] {
  return (raw ?? '')
    .split(',')
    .map((pair) => {
      const sep = pair.indexOf(':');
      return { id: Number(pair.slice(0, sep)), name: decodeURIComponent(pair.slice(sep + 1)) };
    })
    .filter((s) => Number.isInteger(s.id) && s.id > 0 && s.name);
}

const toNumber = (raw: string | null) => (raw && /^\d+$/.test(raw) ? Number(raw) : undefined);

function readFilters(params: URLSearchParams) {
  const modality = params.get('modality');
  return {
    q: params.get('q') ?? '',
    modality: (['REMOTE', 'HYBRID', 'ONSITE'] as const).find((m) => m === modality),
    location: params.get('location') ?? '',
    skills: parseSkills(params.get('skills')),
    salaryMin: toNumber(params.get('salaryMin')),
    salaryMax: toNumber(params.get('salaryMax')),
    sort: (params.get('sort') === 'salary' ? 'salary' : 'recent') as VacancySort,
    page: toNumber(params.get('page')) ?? 1,
  };
}

type Filters = ReturnType<typeof readFilters>;

function toApiParams(f: Filters): VacancySearchParams {
  return {
    q: f.q || undefined,
    modality: f.modality,
    location: f.location || undefined,
    skillIds: f.skills.map((s) => s.id),
    salaryMin: f.salaryMin,
    salaryMax: f.salaryMax,
    sort: f.sort === 'salary' ? 'salary' : undefined,
    page: f.page > 1 ? f.page : undefined,
  };
}

interface Result {
  key: string;
  data?: VacancyPage;
  error?: string;
}

/** BuscarEmpleo (docs/prototype/BuscarEmpleo.dc.html). */
export default function SearchJobs() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const filters = readFilters(params);
  const [reload, setReload] = useState(0);
  const queryString = params.toString();
  const requestKey = `${queryString}#${reload}`;
  const [result, setResult] = useState<Result>({ key: '' });

  const [query, setQuery] = useState(filters.q);
  const [showMore, setShowMore] = useState(false);
  const [draft, setDraft] = useState(() => ({
    location: filters.location,
    skills: filters.skills,
    salaryMin: filters.salaryMin?.toString() ?? '',
    salaryMax: filters.salaryMax?.toString() ?? '',
    sort: filters.sort,
  }));

  useEffect(() => {
    const controller = new AbortController();
    const key = `${queryString}#${reload}`;
    vacanciesService
      .search(toApiParams(readFilters(new URLSearchParams(queryString))), controller.signal)
      .then((data) => setResult({ key, data }))
      .catch((e) => {
        if (controller.signal.aborted) return;
        setResult({ key, error: e instanceof ApiError ? e.message : 'No pudimos cargar las búsquedas.' });
      });
    return () => controller.abort();
  }, [queryString, reload]);

  const loading = result.key !== requestKey;

  /** Cambia filtros en la URL; cualquier cambio de filtro vuelve a la página 1. */
  function update(changes: Partial<Record<'q' | 'modality' | 'location' | 'skills' | 'salaryMin' | 'salaryMax' | 'sort' | 'page', string | undefined>>) {
    const next = new URLSearchParams(params);
    if (!('page' in changes)) next.delete('page');
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next);
  }

  function onSearch(e: FormEvent) {
    e.preventDefault();
    update({ q: query.trim() || undefined });
  }

  function applyMore(e: FormEvent) {
    e.preventDefault();
    update({
      location: draft.location.trim() || undefined,
      skills: draft.skills.map((s) => `${s.id}:${encodeURIComponent(s.name)}`).join(',') || undefined,
      salaryMin: draft.salaryMin.replace(/\D/g, '') || undefined,
      salaryMax: draft.salaryMax.replace(/\D/g, '') || undefined,
      sort: draft.sort === 'salary' ? 'salary' : undefined,
    });
    setShowMore(false);
  }

  function clearAll() {
    setQuery('');
    setDraft({ location: '', skills: [], salaryMin: '', salaryMax: '', sort: 'recent' });
    setParams(new URLSearchParams());
    setShowMore(false);
  }

  const moreCount =
    (filters.location ? 1 : 0) +
    (filters.skills.length ? 1 : 0) +
    (filters.salaryMin !== undefined || filters.salaryMax !== undefined ? 1 : 0) +
    (filters.sort === 'salary' ? 1 : 0);
  const hasFilters = Boolean(filters.q || filters.modality || moreCount);
  const page = result.data;

  return (
    <div className="page">
      <header className="page__header">
        <WelcomeBanner message="¡Hola! Acá están las búsquedas activas. Cada postulación la revisa una persona." />
        <div className="page__titles">
          <h1 className="page__title">Buscar empleo</h1>
          <p className="page__subtitle" aria-live="polite">
            {loading || !page
              ? 'Buscando…'
              : `${page.total} ${page.total === 1 ? 'búsqueda activa' : 'búsquedas activas'}${hasFilters ? ' con estos filtros' : ''}`}
          </p>
        </div>

        <form className="searchbar" role="search" onSubmit={onSearch}>
          <div className="searchbar__field">
            <Icon name="search" size={16} className="searchbar__icon" />
            <input
              type="search"
              className="searchbar__input"
              placeholder="Puesto, tecnología o empresa"
              aria-label="Buscar por puesto, tecnología o empresa"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              maxLength={100}
            />
          </div>
          <button type="submit" className="btn btn--primary">
            Buscar
          </button>
        </form>

        <div className="filters" role="group" aria-label="Filtrar por modalidad">
          {MODALITY_FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              className="filter-pill"
              aria-pressed={filters.modality === f.value}
              onClick={() => update({ modality: f.value })}
            >
              {f.label}
            </button>
          ))}
          <button
            type="button"
            className="filter-pill filter-pill--more"
            aria-expanded={showMore}
            aria-controls="more-filters"
            onClick={() => setShowMore((v) => !v)}
          >
            <Icon name="sliders" size={14} /> Más filtros{moreCount ? ` (${moreCount})` : ''}
          </button>
        </div>

        {showMore && (
          <form id="more-filters" className="more-filters" onSubmit={applyMore}>
            <div className="more-filters__grid">
              <label className="field">
                <span className="field__label">Ubicación</span>
                <input
                  className="field__input"
                  placeholder="Ej: Córdoba"
                  value={draft.location}
                  onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                  maxLength={100}
                />
              </label>
              <div className="field">
                <span className="field__label">Rango salarial (AR$ por mes)</span>
                <div className="range-inputs">
                  <input
                    className="field__input"
                    inputMode="numeric"
                    placeholder="Desde"
                    aria-label="Salario desde"
                    value={draft.salaryMin}
                    onChange={(e) => setDraft({ ...draft, salaryMin: e.target.value.replace(/\D/g, '') })}
                  />
                  <span aria-hidden="true">a</span>
                  <input
                    className="field__input"
                    inputMode="numeric"
                    placeholder="Hasta"
                    aria-label="Salario hasta"
                    value={draft.salaryMax}
                    onChange={(e) => setDraft({ ...draft, salaryMax: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
                <p className="field__hint">Solo considera las ofertas que muestran su salario.</p>
              </div>
              <label className="field">
                <span className="field__label">Ordenar por</span>
                <select
                  className="field__input"
                  value={draft.sort}
                  onChange={(e) => setDraft({ ...draft, sort: e.target.value as VacancySort })}
                >
                  <option value="recent">Más recientes</option>
                  <option value="salary">Mayor salario</option>
                </select>
              </label>
            </div>
            <SkillPicker
              label="Skills (la oferta tiene que pedir todas)"
              tone="employee"
              max={10}
              value={draft.skills}
              onChange={(skills) => setDraft({ ...draft, skills })}
            />
            <div className="more-filters__actions">
              <button type="submit" className="btn btn--primary">
                Aplicar filtros
              </button>
              <button type="button" className="btn btn--ghost" onClick={clearAll}>
                Limpiar todo
              </button>
            </div>
          </form>
        )}
      </header>

      <div className="page__scroll">
        {loading ? (
          <div className="job-grid" aria-busy="true" aria-label="Cargando búsquedas">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="job-card job-card--skeleton" />
            ))}
          </div>
        ) : result.error ? (
          <div className="state-box" role="alert">
            <p className="state-box__title">No pudimos cargar las búsquedas</p>
            <p className="state-box__text">{result.error}</p>
            <button type="button" className="btn btn--primary" onClick={() => setReload((n) => n + 1)}>
              Reintentar
            </button>
          </div>
        ) : page && page.items.length === 0 ? (
          <div className="state-box">
            <Mascot state="no-matches" size={140} enabled={user?.mascotEnabled} />
            <p className="state-box__title">
              {hasFilters ? 'No encontramos búsquedas con estos filtros' : 'Todavía no hay búsquedas activas'}
            </p>
            <p className="state-box__text">
              {hasFilters ? 'Probá con menos filtros o con otras palabras.' : 'Volvé a pasar pronto: las empresas publican todos los días.'}
            </p>
            {hasFilters && (
              <button type="button" className="btn btn--ghost" onClick={clearAll}>
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          page && (
            <>
              <div className="job-grid">
                {page.items.map((v) => (
                  <VacancyCard key={v.id} vacancy={v} returnTo={`/empleado/buscar?${queryString}`} />
                ))}
              </div>
              <Pagination
                page={page.page}
                totalPages={page.totalPages}
                onChange={(p) => update({ page: p > 1 ? String(p) : undefined })}
              />
            </>
          )
        )}
      </div>
    </div>
  );
}
