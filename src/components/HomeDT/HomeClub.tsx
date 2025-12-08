import C_Cupos from "@/components/Clubs/C_Cupos";
import C_CopasAbiertas from "../Clubs/C_CopasAbiertas";
import C_Equipos from "../Clubs/C_Equipos";
import C_Chalecos from "../Clubs/C_Chalecos";
import C_UbicacionCancha from "../Clubs/C_UbicacionCancha";
import C_Perfil from "../Clubs/C_Perfil";
import C_ResultadoAnterior from "../Clubs/C_ResultadoAnterior";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { selectAuthUser } from "@/store/slices/authSlice";
import { selectUserProfile } from "@/store/slices/userSlice";
import { useEffect } from "react";
import { fetchUserProfile } from "@/store/thunks/userThunks";

export default function HomeClubDT(){
    const user = useAppSelector(selectAuthUser);
    const dispatch = useAppDispatch();
    const userProfile = useAppSelector(selectUserProfile);

    useEffect(() => {
    // Fetch profile only if we have a user and the profile isn't already loaded
    if (user?.id && !userProfile) {
        dispatch(fetchUserProfile(user.id));
    }
    }, [user?.id, userProfile, dispatch]);
    
    const displayName = userProfile?.fullname 
    ? userProfile.fullname.split(' ')[0] // Get first name
    : (user?.email?.split('@')[0] ?? 'Jugador'); // Fallback to email prefix or generic 'Jugador'

    return(
        <div className="text-white min-h-screen flex flex-col space-y-8">
            {/* Saludo */}
            <div className="text-3xl font-bold text-[#1d2029]">
            Bienvenido, <span className="capitalize">{displayName}</span>
            </div>
            {/* Sección Cupos + Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 flex-grow">
                {/* Cupos */}
                <C_Cupos/>
                <div className="flex flex-col space-y-4 md:col-span-2 lg:col-span-2">
                    {/* Resultado anterior */}
                    <C_ResultadoAnterior/>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Perfil */}
                    <C_Perfil/>
                    {/* Ubicación */}
                    <C_UbicacionCancha/>
                    {/* Chaleco de hoy (lista simple) */}
                    <C_Chalecos/>
                    </div>
                    {/* Listas de jugadores */}
                    <C_Equipos/>
                </div>
            </div>
    
            {/* Copas abiertas (solo títulos centrados) */}
        </div>
    )
}