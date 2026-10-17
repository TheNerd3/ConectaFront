import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FormAlert } from '../../components/auth/FormAlert';
import { Icon } from '../../components/ui/Icon';
import { SkillPicker } from '../../components/vacancies/SkillPicker';
import { ApiError } from '../../services/api';
import { vacanciesService } from '../../services/vacancies';
import type { EmployerCompany, EmployerVacancyDetail, Modality, Skill, VacancyInput } from '../../types/vacancy';
import { MODALITY_LABEL } from '../../utils/format';

interface FormState {
  title: string;
  modality: Modality;
  location: string;
  salaryMin: string;
  salaryMax: string;
  showSalary: boolean;
  description: string;
  skills: Skill[];
}

type Field = 'title' | 'location' | 'salary' | 'description' | 'skills';

const EMPTY: FormState = {
  title: '',
  modality: 'REMOTE',
  location: '',
  salaryMin: '',
  salaryMax: '',
  // El prototipo trae "Mostrar el rango públicamente" marcado.
  showSalary: true,
  description: '',
  skills: [],
};

function fromVacancy(v: EmployerVacancyDetail): FormState {
  return {
    title: v.title,
    modality: v.modality,
    location: v.location,
    salaryMin: v.salaryMin?.toString() ?? '',
    salaryMax: v.salaryMax?.toString() ?? '',
    showSalary: v.showSalary,
    description: v.description,
    skills: v.skills,
  };
}

const money = new Intl.NumberFormat('es-AR');
const formatAmount = (digits: string) => (digits ? money.format(Number(digits)) : '');

function validate(f: FormState): Partial<Record<Field, string>> {
  const min = f.salaryMin ? Number(f.salaryMin) : null;
  const max = f.salaryMax ? Number(f.salaryMax) : null;
  return {
    title: f.title.trim().length < 3 ? 'Ingresá el puesto' : undefined,
    location: f.location.trim().length < 2 ? 'Ingresá la ubicación' : undefined,
    salary:
      min !== null && max !== null && max < min
        ? 'El salario "hasta" no puede ser menor que el "desde"'
        : f.showSalary && min === null && max === null
          ? 'Para mostrar el rango, cargá al menos un valor (o destildá la opción)'
          : undefined,
    description:
      f.description.trim().length < 20 ? 'Contá un poco más sobre el puesto (al menos 20 caracteres)' : undefined,
    skills: f.skills.length === 0 ? 'Agregá al menos una skill' : undefined,
  };
}

interface Loaded {
  key: string;
  company?: EmployerCompany;
  error?: string;
}

/** PublicarVacante (docs/prototype/PublicarVacante.dc.html): alta, edición y duplicado. */
export default function PublishVacancy() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const editingId = id ? Number(id) : null;
  const sourceId = editingId ?? (params.get('desde') ? Number(params.get('desde')) : null);
  const key = `${editingId}-${sourceId}`;

  const [loaded, setLoaded] = useState<Loaded>({ key: '' });
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const k = `${editingId}-${sourceId}`;
    Promise.all([vacanciesService.listMine(), sourceId ? vacanciesService.getMine(sourceId) : null])
      .then(([mine, source]) => {
        if (cancelled) return;
        const initial = source ? fromVacancy(source) : EMPTY;
        setForm(initial);
        setLoaded({ key: k, company: mine.company });
      })
      .catch((e) => {
        if (!cancelled) setLoaded({ key: k, error: e instanceof ApiError ? e.message : 'Error inesperado' });
      });
    return () => {
      cancelled = true;
    };
  }, [editingId, sourceId]);

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    const next = { ...form, [field]: value };
    setForm(next);
    // Después del primer intento, los errores se actualizan mientras se corrige.
    if (submitted) setErrors(validate(next));
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setSubmitted(true);
    setFormError(null);
    if (Object.values(nextErrors).some(Boolean)) return;

    const input: VacancyInput = {
      title: form.title.trim(),
      modality: form.modality,
      location: form.location.trim(),
      salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
      showSalary: form.showSalary,
      description: form.description.trim(),
      skillIds: form.skills.map((s) => s.id),
    };

    setSubmitting(true);
    try {
      if (editingId) await vacanciesService.update(editingId, input);
      else await vacanciesService.create(input);
      navigate('/empleador/vacantes', {
        replace: true,
        state: { flash: editingId ? 'Guardamos los cambios de la vacante.' : 'Publicamos la vacante. Ya es visible para quienes buscan empleo.' },
      });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Ocurrió un error inesperado. Intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  const title = editingId ? 'Editar vacante' : 'Publicar vacante';
  const header = (
    <header className="page__header page__header--bordered">
      <Link to="/empleador/vacantes" className="back-link">
        <Icon name="chevronLeft" size={14} strokeWidth={2.5} /> Volver a mis vacantes
      </Link>
      <h1 className="page__title page__title--sm">{title}</h1>
      <p className="page__subtitle page__subtitle--sm">
        Cada postulante que llegue lo va a revisar una persona de tu equipo, no un filtro automático
      </p>
    </header>
  );

  if (loaded.key !== key) {
    return (
      <div className="page">
        {header}
        <p className="route-loading route-loading--inline" role="status">
          Cargando…
        </p>
      </div>
    );
  }

  if (loaded.error) {
    return (
      <div className="page">
        {header}
        <div className="page__scroll">
          <div className="state-box" role="alert">
            <p className="state-box__title">No pudimos cargar la vacante</p>
            <p className="state-box__text">{loaded.error}</p>
            <Link to="/empleador/vacantes" className="btn btn--primary">
              Volver a mis vacantes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canPublish = loaded.company?.canPublish ?? false;

  return (
    <div className="page">
      {header}
      <div className="page__scroll">
        <form className="vacancy-form" onSubmit={handleSubmit} noValidate>
          {!canPublish && (
            <div className="notice notice--warning" role="status">
              <strong>Tu empresa está en verificación.</strong> Vas a poder publicar cuando un administrador la apruebe.
            </div>
          )}
          <FormAlert>{formError}</FormAlert>

          <label className="field">
            <span className="field__label">Puesto</span>
            <input
              className="field__input field__input--employer"
              placeholder="Ej: Full Stack Developer"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              maxLength={120}
              aria-invalid={errors.title ? true : undefined}
            />
            {errors.title && <span className="field__error">{errors.title}</span>}
          </label>

          <div className="form-row">
            <label className="field">
              <span className="field__label">Modalidad</span>
              <select
                className="field__input field__input--employer"
                value={form.modality}
                onChange={(e) => set('modality', e.target.value as Modality)}
              >
                {(Object.keys(MODALITY_LABEL) as Modality[]).map((m) => (
                  <option key={m} value={m}>
                    {MODALITY_LABEL[m]}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field__label">Ubicación</span>
              <input
                className="field__input field__input--employer"
                placeholder="Ej: Buenos Aires, Argentina"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                maxLength={120}
                aria-invalid={errors.location ? true : undefined}
              />
              {errors.location && <span className="field__error">{errors.location}</span>}
            </label>
          </div>

          <fieldset className="field field--fieldset">
            <legend className="field__label">Rango salarial (opcional, AR$ por mes)</legend>
            <div className="range-inputs">
              <input
                className="field__input field__input--employer"
                inputMode="numeric"
                placeholder="Desde"
                aria-label="Salario desde"
                value={formatAmount(form.salaryMin)}
                onChange={(e) => set('salaryMin', e.target.value.replace(/\D/g, '').slice(0, 10))}
                aria-invalid={errors.salary ? true : undefined}
              />
              <span aria-hidden="true">a</span>
              <input
                className="field__input field__input--employer"
                inputMode="numeric"
                placeholder="Hasta"
                aria-label="Salario hasta"
                value={formatAmount(form.salaryMax)}
                onChange={(e) => set('salaryMax', e.target.value.replace(/\D/g, '').slice(0, 10))}
                aria-invalid={errors.salary ? true : undefined}
              />
            </div>
            <label className="checkbox">
              <input type="checkbox" checked={form.showSalary} onChange={(e) => set('showSalary', e.target.checked)} />
              Mostrar el rango públicamente en la oferta
            </label>
            {!form.showSalary && (
              <p className="field__hint">El rango queda guardado pero no se muestra ni se usa en los filtros de búsqueda.</p>
            )}
            {errors.salary && <span className="field__error">{errors.salary}</span>}
          </fieldset>

          <label className="field">
            <span className="field__label">Descripción del puesto</span>
            <textarea
              className="field__input field__input--employer field__textarea"
              placeholder="Contá de qué se trata el rol, el equipo y el día a día"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              maxLength={5000}
              aria-invalid={errors.description ? true : undefined}
            />
            {errors.description && <span className="field__error">{errors.description}</span>}
          </label>

          <SkillPicker
            label="Skills buscadas"
            value={form.skills}
            onChange={(skills) => set('skills', skills)}
            error={errors.skills}
          />

          <div className="vacancy-form__actions">
            <button type="submit" className="btn btn--employer" disabled={submitting || !canPublish} aria-busy={submitting}>
              {submitting ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Publicar vacante'}
            </button>
            <Link to="/empleador/vacantes" className="btn btn--ghost">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
