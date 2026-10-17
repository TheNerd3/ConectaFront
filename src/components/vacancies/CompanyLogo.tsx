import { initials, logoColor } from '../../utils/format';

interface Props {
  company: { id: number; name: string; logoUrl: string | null };
  size?: number;
}

/** Logo de la empresa, o sus iniciales sobre un color estable si no cargó uno. */
export function CompanyLogo({ company, size = 40 }: Props) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.34) };
  if (company.logoUrl) {
    return <img className="company-logo" src={company.logoUrl} alt="" style={style} />;
  }
  return (
    <span className="company-logo" style={{ ...style, background: logoColor(company.id) }} aria-hidden="true">
      {initials(company.name)}
    </span>
  );
}
