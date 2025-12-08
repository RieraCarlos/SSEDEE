// src/components/Clubs/CreateClubForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store/store';
import { uploadLogoAndCreateClub } from '@/store/thunks/clubsThunks';
import { updateUserProfile } from '@/store/thunks/userThunks';
import { supabase } from '@/api/supabaseClient';
import { toast } from 'sonner';
import type { AuthUser } from '@/api/type/auth.api';
import { setAuthUser } from '@/store/slices/authSlice';
import { fetchTournaments } from '@/store/thunks/tournamentsThunks';

interface CreateClubFormProps {
  user: AuthUser;
}

export default function CreateClubForm({ user }: CreateClubFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);

  const { tournaments, loading: tournamentsLoading } = useSelector((state: RootState) => state.tournaments);

  // Form state
  const [clubName, setClubName] = useState('');
  const [clubLogoFile, setClubLogoFile] = useState<File | null>(null);
  const [clubBackgroundTeam, setClubBackgroundTeam] = useState('');
  const [clubColor, setClubColor] = useState('#000000');
  const [clubNameError, setClubNameError] = useState<string | null>(null);
  const [isCheckingClubName, setIsCheckingClubName] = useState(false);

  // Background selection state
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [isBackgroundDialogOpen, setIsBackgroundDialogOpen] = useState(false);
  const [backgroundLoading, setBackgroundLoading] = useState(false);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    dispatch(fetchTournaments());
    
    // Fetch background images
    const fetchBackgrounds = async () => {
      setBackgroundLoading(true);
      try {
        const { data, error } = await supabase.storage.from('backgrounds').list('', { limit: 100 });
        if (error) throw error;
        const urls = data.map((file) => {
          const { data: { publicUrl } } = supabase.storage.from('backgrounds').getPublicUrl(file.name);
          return publicUrl;
        });
        setBackgroundImages(urls);
      } catch (error: any) {
        toast.error("Error al cargar fondos", { description: error.message });
      } finally {
        setBackgroundLoading(false);
      }
    };
    fetchBackgrounds();
  }, [dispatch]);

  useEffect(() => {
    if (clubName) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      setClubNameError(null);
      setIsCheckingClubName(true);
      debounceTimeoutRef.current = setTimeout(async () => {
        const { data, error } = await supabase.from('clubes').select('name').eq('name', clubName).maybeSingle();
        if (error && error.code !== 'PGRST116') {
          setClubNameError('Error al verificar el nombre del club.');
        } else if (data) {
          setClubNameError('Este nombre de club ya está en uso.');
        } else {
          setClubNameError(null);
        }
        setIsCheckingClubName(false);
      }, 500);
    } else {
      setClubNameError(null);
      setIsCheckingClubName(false);
    }
  }, [clubName]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubName || !clubLogoFile || !clubBackgroundTeam || !clubColor) {
      toast.error("Error de Validación", { description: "Por favor, complete todos los campos, incluyendo la selección de un torneo." });
      return;
    }
    if (clubNameError) {
      toast.error("Error de Validación", { description: clubNameError });
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Upload logo and create the club
      const clubResult = await dispatch(uploadLogoAndCreateClub({
        file: clubLogoFile,
        name: clubName,
        backgroud_team: clubBackgroundTeam,
        color: clubColor,
      })).unwrap();

      const clubId = clubResult.id;
      if (!clubId) {
        throw new Error('La creación del club falló, no se recibió un ID.');
      }

      // Step 2: Update the user with their new club ID
      const updatedUser = await dispatch(updateUserProfile({
        userId: user.id,
        updates: { id_club: clubId }
      })).unwrap();
      
      // Step 3: Update the auth state in Redux with the full user profile
      dispatch(setAuthUser(updatedUser));

      toast.success("¡Club creado con éxito!", { description: `Bienvenido a ${clubName}.`});
    } catch (error: any) {
      toast.error("Error al Crear el Club", {
        description: error.message || "Ocurrió un error al procesar tu solicitud.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 p-8 rounded-md text-white max-w-lg w-full shadow-[0px_0px_130px_rgba(34,197,94,0.15)] border border-gray-800")}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold">Crea tu Club</h1>
        <p className="text-sm px-4 text-gray-400">
          Completa los datos para configurar tu club. Esto solo lo harás una vez.
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="grid gap-4">
        <div className='grid gap-2'>
          <Label htmlFor="clubName">Nombre del Club</Label>
          <Input id="clubName" value={clubName} onChange={e => setClubName(e.target.value)} placeholder="Ej: Los Cracks del Balón" required aria-invalid={!!clubNameError} />
          {isCheckingClubName && <p className="text-sm text-yellow-400">Verificando nombre...</p>}
          {clubNameError && <p className="text-red-500 text-sm">{clubNameError}</p>}
        </div>
        <div className='grid gap-2'>
          <Label htmlFor="clubLogo">Logo del Club</Label>
          <Input id="clubLogo" type="file" accept="image/*" onChange={e => setClubLogoFile(e.target.files ? e.target.files[0] : null)} required />
        </div>
        <div className='grid gap-2'>
          <Label>Fondo Predeterminado para Jugadores</Label>
          <div className='flex items-center gap-4'>
            {clubBackgroundTeam && (
              <img src={clubBackgroundTeam} alt="Selected background" className='w-24 h-16 object-cover rounded-md' />
            )}
            <Button type='button' onClick={() => setIsBackgroundDialogOpen(true)} disabled={backgroundLoading}>
              {backgroundLoading ? 'Cargando...' : 'Elegir Fondo'}
            </Button>
          </div>
          <p className='text-xs text-gray-400 mt-1'>
            Una vez escogido el fondo para los perfiles de los jugadores de su club, ya no se podrá cambiar.
          </p>
        </div>
        <div className='grid gap-2'>
          <Label htmlFor="clubColor">Color Primario del Club</Label>
          <Input id="clubColor" type="color" value={clubColor} onChange={e => setClubColor(e.target.value)} required className="w-full h-10 cursor-pointer" />
        </div>
        
        <Button type="submit" disabled={isLoading || isCheckingClubName || tournamentsLoading} className="w-full mt-4">
          {isLoading ? 'Creando Club...' : 'Finalizar y Crear Club'}
        </Button>
      </form>

      <Dialog open={isBackgroundDialogOpen} onOpenChange={setIsBackgroundDialogOpen}>
        <DialogContent className="bg-[#13161c] text-white border-0">
          <DialogHeader>
            <DialogTitle>Selecciona un Fondo para tu Equipo</DialogTitle>
          </DialogHeader>
          {backgroundLoading ? (
            <div className='flex justify-center items-center h-40'><p>Cargando fondos...</p></div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-[70vh] overflow-y-auto">
              {backgroundImages.map((url, index) => (
                <div 
                  key={url + index} 
                  className={`cursor-pointer h-50 rounded-md overflow-hidden border-4 hover:border-green-300 ${clubBackgroundTeam === url ? 'border-green-400 ring-2 ring-green-400' : 'border-transparent'}`}
                  onClick={() => {
                    setClubBackgroundTeam(url);
                    setIsBackgroundDialogOpen(false);
                  }}
                >
                  <img src={url} alt="Background" className="w-full h-auto object-cover"/>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
