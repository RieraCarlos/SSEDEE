{/*
import { type User } from '@/hooks/useAuth';
import HomeClub from './HomeJugadores/HomeClub';
import HomeCopa from './HomeJugadores/HomeCopa';
import HomeClubDT from './HomeDT/HomeClub';
import HomeCopaDT from './HomeDT/HomeCopa';
//import equiposData from '@/hooks/BD_Equipos.json';
//import eventosData from '@/hooks/BD_Admin.json';

const componentMap = {
  club: {
    jugador: HomeClub,
    dt: HomeClubDT,
  },
  copa: {
    jugador: HomeCopa,
    dt: HomeCopaDT,
  },
};

const getUserInfo = (email: string | null | undefined) => {
  if (!email) return null;

  const userTeam = equiposData.find(
    (equipo) =>
      equipo.jugadores.some((j) => j.email === email) ||
      equipo.dt.some((d) => d.email === email)
  );

  if (!userTeam) return null;

  const esCopa = eventosData.some((evento) =>
    evento.clubes.some((club) => club.nombre === userTeam.equipo)
  );

  const tipoEquipo = esCopa ? 'copa' : 'club';

  return { tipoEquipo };
};

export default function TipoEquipoSpecificContent({ user }: { user: User | null }) {
  if (!user || !user.email) return null;

  const userInfo = getUserInfo(user.email);

  if (!userInfo) {
    return <div>No se encontró información para el usuario: {user.email}</div>;
  }

  const { tipoEquipo } = userInfo;
  const role = user.role as keyof typeof componentMap[keyof typeof componentMap];

  // Aseguramos que tipoEquipo y role sean válidos antes de buscar en el mapa
  if (
    !(tipoEquipo in componentMap) ||
    !role ||
    !(role in componentMap[tipoEquipo as keyof typeof componentMap])
  ) {
    return <div>Tipo de equipo o rol no reconocido.</div>;
  }

  const ComponentToRender = componentMap[tipoEquipo as keyof typeof componentMap][role];

  // Verificamos si el componente necesita la prop `user`
  const componentProps = ComponentToRender === HomeClub || ComponentToRender === HomeCopa ? { user } : {};

  return <ComponentToRender {...componentProps} />;
};
*/}