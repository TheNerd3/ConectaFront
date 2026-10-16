import { Mascot } from '../components/mascot/Mascot';

export default function Landing() {
  return (
    <main className="landing">
      <Mascot state="waving" />
      <h1>Conecta</h1>
      <p>Búsqueda laboral sin filtros de IA y con estado de postulación siempre visible.</p>
    </main>
  );
}
