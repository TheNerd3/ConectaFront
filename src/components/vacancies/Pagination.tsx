import { Icon } from '../ui/Icon';

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Paginación">
      <button type="button" className="btn btn--ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <Icon name="chevronLeft" size={16} /> Anterior
      </button>
      <span className="pagination__status" aria-current="page">
        Página {page} de {totalPages}
      </span>
      <button type="button" className="btn btn--ghost" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Siguiente <Icon name="chevronRight" size={16} />
      </button>
    </nav>
  );
}
