import Nav from '@/components/Landing/Nav';
import { useAuth} from '@/hooks/useAuth';
import Footer from '@/components/Landing/Footer';
import HomeClub from '@/components/HomeJugadores/HomeClub';
// Render según tipoEquipo
import TipoEquipoSpecificContent from '@/components/TipoEquipoSpecificContent';

export default function Jugador(){
  
  
  return (
    <div className="text-white min-h-screen flex flex-col space-y-2">
      <Nav />
      <div className="px-5 md:px-15 lg:px-35 mb-15">
        <HomeClub />
      </div>
      <Footer />
    </div>
  );
}
