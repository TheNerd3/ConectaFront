import { Link } from 'react-router-dom';
import type { VacancyListItem } from '../../types/vacancy';
import { formatSalary, MODALITY_LABEL, RESPONSE_LABEL, responseSpeed, timeAgo } from '../../utils/format';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { CompanyLogo } from './CompanyLogo';
import { MatchSlot } from './MatchSlot';

interface Props {
  vacancy: VacancyListItem;
  /** Búsqueda actual (?q=…) para volver a la misma página desde el detalle. */
  returnTo: string;
}

/** Tarjeta de vacante de BuscarEmpleo (prototipo). */
export function VacancyCard({ vacancy, returnTo }: Props) {
  const speed = responseSpeed(vacancy.company.avgResponseHours);
  const salary = formatSalary(vacancy.salary);
  return (
    <Link to={`/empleado/vacantes/${vacancy.id}`} state={{ returnTo }} className="job-card">
      <div className="job-card__top">
        <div className="job-card__identity">
          <CompanyLogo company={vacancy.company} />
          <div className="job-card__names">
            <h2 className="job-card__title">{vacancy.title}</h2>
            <div className="job-card__company">
              {vacancy.company.name}
              {vacancy.company.verified && <VerifiedBadge />}
            </div>
          </div>
        </div>
        <MatchSlot />
      </div>

      <div className="chips">
        {vacancy.featured && <span className="chip chip--featured">★ Empresa Transparente</span>}
        <span className="chip chip--modality">{MODALITY_LABEL[vacancy.modality]}</span>
        <span className="chip chip--neutral">{vacancy.location}</span>
        <span className={`chip chip--response-${speed}`}>{RESPONSE_LABEL[speed]}</span>
      </div>

      <div className="job-card__bottom">
        <span className={salary ? 'job-card__salary' : 'job-card__salary job-card__salary--hidden'}>
          {salary ?? 'Salario no informado'}
        </span>
        <span className="job-card__posted">Publicada {timeAgo(vacancy.createdAt)}</span>
      </div>
    </Link>
  );
}
