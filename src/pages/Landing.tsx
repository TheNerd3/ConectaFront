import { Link } from 'react-router-dom';
import { Mascot } from '../components/mascot/Mascot';
import { ROLE_LOGIN } from '../routes/roles';

export default function Landing() {
  return (
    <main className="landing">
      <Mascot state="waving" />
      <h1>Conecta</h1>
      <p>Búsqueda laboral sin filtros de IA y con estado de postulación siempre visible.</p>
      <nav className="landing__links" aria-label="Ingresar">
        <Link to={ROLE_LOGIN.EMPLOYEE}>Busco empleo</Link>
        <Link to={ROLE_LOGIN.EMPLOYER}>Busco talento</Link>
        <Link to={ROLE_LOGIN.ADMIN}>Administración</Link>
      </nav>
    </main>
  );
}
