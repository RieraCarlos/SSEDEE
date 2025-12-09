import { useEffect } from 'react';
import Footer from "../Landing/Footer";
import Nav from "../Landing/Nav";
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { fetchClub, fetchClubPlayers } from '@/store/thunks/clubsThunks';
import { selectAuthUser } from '@/store/slices/authSlice';
import { selectCurrentClubLogoUrl, selectClubName } from '@/store/slices/clubsSlice';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function C_solicitudesClub(){
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectAuthUser);
    const players = useAppSelector((state) => state.clubs.players);
    const loading = useAppSelector((state) => state.clubs.loading);
    const error = useAppSelector((state) => state.clubs.error);
    const clubLogoUrl = useAppSelector(selectCurrentClubLogoUrl);
    const clubName = useAppSelector(selectClubName);
 
    useEffect(() => {
        if (user && user.id_club) {
            dispatch(fetchClubPlayers(user.id_club));
            dispatch(fetchClub(user.id_club));
        }
    }, [dispatch, user]);

    if (loading) {
        return (
            <div className="text-white min-h-screen flex items-center justify-center">
                Cargando nómina de jugadores...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-white min-h-screen flex items-center justify-center">
                Error al cargar nómina: {error}
            </div>
        );
    }
    
    return(
        <div className="text-white min-h-screen flex flex-col space-y-2">
            <Nav />
            <div className='px-5 md:px-15 lg:px-35'>
                <div className='flex justify-center my-10 drop-shadow-[0_0_30px_rgba(255,255,255,0.35)]'>
                    {clubLogoUrl && (
                        <img src={clubLogoUrl} alt={`${clubName || 'Club'} Logo`} className="w-30 h-30 object-contain rounded-full" />
                    )}
                </div>
                
                <div className="text-white flex flex-col space-y-8">
                    <Card className="bg-[#13161c] border-2 border-[#13161c] text-white">
                        <CardHeader className="flex flex-row items-center gap-4">
                            
                            <div>
                                <CardTitle className="text-3xl font-bold text-[#0ae98a]">
                                    Nómina de Jugadores de {clubName || 'Tu Club'}
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    Gestiona los jugadores que son parte del club.
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className='text-gray-300'>
                                        <TableHead className="w-[100px] text-gray-300">Nombre Completo</TableHead>
                                        <TableHead className='text-gray-300'>email</TableHead>
                                        <TableHead className='text-gray-300'>Posición</TableHead>
                                        <TableHead className='text-gray-300'>Alias</TableHead>
                                        <TableHead className='text-gray-300'>Fecha de nacimiento</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {players.length > 0 ? (
                                        players.map((player: any) => ( // Use 'any' temporarily if player type isn't fully defined yet
                                            <TableRow key={player.id}>
                                                <TableCell className="font-medium">{player.fullname}</TableCell>
                                                <TableCell>{player.email}</TableCell>
                                                <TableCell>{player.posicion}</TableCell>
                                                <TableCell>{player.alias}</TableCell>
                                                <TableCell>{player.fecha_nacimiento}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                                No hay jugadores registrados en este club.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Footer />
        </div>
    )
}