import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { skillsService } from '../../services/skills';
import type { Skill } from '../../types/vacancy';
import { Icon } from '../ui/Icon';

interface Props {
  label: string;
  value: Skill[];
  onChange: (skills: Skill[]) => void;
  max?: number;
  error?: string;
  /** Colores de las pastillas: empleador (terracota) o empleado (verde). */
  tone?: 'employer' | 'employee';
}

/** Selector de skills del catálogo: pastillas + "Agregar skill" con autocompletado. */
export function SkillPicker({ label, value, onChange, max = 15, error, tone = 'employer' }: Props) {
  const id = useId();
  const listId = `${id}-list`;
  // open: el buscador ya se mostró (queda visible para no mover el layout); focused: lista de sugerencias abierta.
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  // Sugerencias visibles: al abrir el buscador, al escribir o con ↓. Se cierran al elegir una
  // skill, para que la lista no tape los botones de abajo.
  const [browsing, setBrowsing] = useState(true);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<Skill[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Búsqueda con espera corta para no llamar a la API en cada tecla.
  const listVisible = focused && browsing;

  useEffect(() => {
    if (!listVisible) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      skillsService
        .search(query.trim(), controller.signal)
        .then((found) => {
          setOptions(found.filter((s) => !value.some((v) => v.id === s.id)));
          setActive(0);
        })
        .catch(() => {
          if (!controller.signal.aborted) setOptions([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [listVisible, query, value]);

  function add(skill: Skill) {
    // Las sugerencias pueden ser de la búsqueda anterior: nunca duplicar una skill.
    if (!value.some((s) => s.id === skill.id)) onChange([...value, skill]);
    setQuery('');
    setOptions([]);
    setBrowsing(false);
    inputRef.current?.focus();
  }

  function onQueryChange(next: string) {
    setQuery(next);
    setBrowsing(true);
    // Las sugerencias viejas no corresponden al texto nuevo: se descartan hasta que llegue la respuesta.
    setOptions([]);
    setLoading(true);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setBrowsing(true);
      setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (browsing && options[active]) add(options[active]);
    } else if (e.key === 'Escape') {
      setFocused(false);
    }
  }

  const full = value.length >= max;

  return (
    <div className="field" role="group" aria-labelledby={`${id}-label`}>
      <span id={`${id}-label`} className="field__label">
        {label}
      </span>

      {value.length > 0 && (
        <ul className="skill-pills">
          {value.map((skill) => (
            <li key={skill.id} className={`skill-pill skill-pill--${tone}`}>
              {skill.name}
              <button
                type="button"
                className="skill-pill__remove"
                onClick={() => onChange(value.filter((s) => s.id !== skill.id))}
                aria-label={`Quitar ${skill.name}`}
              >
                <Icon name="close" size={10} strokeWidth={3} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <div className="skill-search">
          <input
            ref={inputRef}
            autoFocus
            className="field__input"
            role="combobox"
            aria-expanded={listVisible && options.length > 0}
            aria-controls={listId}
            aria-activedescendant={options[active] ? `${listId}-${options[active].id}` : undefined}
            aria-label="Buscar skill"
            placeholder="Escribí para buscar (ej.: React)"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={full}
          />
          {/* La lista es absoluta: abrirla o cerrarla no mueve el resto del formulario. */}
          <ul id={listId} role="listbox" className="skill-search__list" hidden={!listVisible}>
            {options.map((skill, i) => (
              <li
                key={skill.id}
                id={`${listId}-${skill.id}`}
                role="option"
                aria-selected={i === active}
                className={i === active ? 'skill-search__option skill-search__option--active' : 'skill-search__option'}
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(skill);
                }}
              >
                {skill.name}
              </li>
            ))}
            {!loading && options.length === 0 && (
              <li className="skill-search__empty">{query ? 'No hay skills con ese nombre en el catálogo' : 'Sin más skills para agregar'}</li>
            )}
          </ul>
        </div>
      ) : (
        <button
          type="button"
          className={`skill-add skill-add--${tone}`}
          onClick={() => setOpen(true)}
          disabled={full}
          title={full ? `Máximo ${max} skills` : undefined}
        >
          <Icon name="plus" size={14} strokeWidth={2.5} />
          Agregar skill
        </button>
      )}

      {error && <p className="field__error">{error}</p>}
    </div>
  );
}
