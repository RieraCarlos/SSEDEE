import HomeClub from '@/components/HomeJugadores/HomeClub';
// Render según tipoEquipo

export default function Jugador(){
  
  
  return (
    <div className="text-white min-h-screen flex flex-col space-y-2">
      <div className="px-5 md:px-15 lg:px-35 mb-15">
        <HomeClub />
      </div>
    </div>
  );
}
