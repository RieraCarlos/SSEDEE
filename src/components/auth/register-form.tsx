import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import { signUp } from '@/store/thunks/authThunks';
import { toast } from 'sonner';

// Assuming Club has this structure based on DB schema
interface Club {
  id: string;
  name: string;
  logo_url: string;
  backgroud_team: string;
  color: string;
}

interface RegisterFormProps extends Omit<React.ComponentProps<"form">, 'onSubmit'> {
  isLoading: boolean;
  onSwitchToLogin: () => void;
  clubs: Club[];
  avatarUrls: string[]; // Expect a list of avatar URLs
}

export default function RegisterForm({ className, isLoading, onSwitchToLogin, clubs, avatarUrls, ...props }: RegisterFormProps) {
  const dispatch = useDispatch<AppDispatch>();

  const [role, setRole] = useState('jugador');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    selectedClub: '',
    fullname: '',
    posicion: '',
    alias: '',
    altura: '',
    fecha_nacimiento: '',
    avatar_url: '',
  });

  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { email, password, selectedClub, fullname, posicion, alias, altura, fecha_nacimiento, avatar_url } = formData;

    if (role === 'jugador') {
      if (!selectedClub || !fullname || !posicion || !alias || !altura || !fecha_nacimiento || !avatar_url || !email || !password) {
        toast.error("Error de Validación", {
          description: "Por favor, complete todos los campos obligatorios para el registro de Jugador.",
        });
        return;
      }

      try {
        await dispatch(signUp({
          email,
          password,
          role,
          id_club: selectedClub,
          fullname,
          posicion,
          alias,
          altura,
          fecha_nacimiento,
          avatar: avatar_url,
        })).unwrap();
        setRegistrationSuccess(true);
      } catch (error: any) {
        toast.error("Error en el Registro", {
            description: error.message || "Ocurrió un error al registrar tu cuenta de jugador.",
        });
      }
      return;
    } 
    
    else if (role === 'dt') {
      if (!fullname || !posicion || !alias || !altura || !fecha_nacimiento || !avatar_url || !email || !password) {
        toast.error("Error de Validación", {
          description: "Por favor, complete todos los campos obligatorios para el registro de DT.",
        });
        return;
      }

      try {
        await dispatch(signUp({
          email,
          password,
          role, // 'dt'
          fullname,
          posicion,
          alias,
          altura,
          fecha_nacimiento,
          avatar: avatar_url,
        })).unwrap();

        setRegistrationSuccess(true);
      } catch (error: any) {
        toast.error("Error en el Registro", {
          description: error.message || "Ocurrió un error al registrar tu cuenta de DT.",
        });
      }
    }
  };

  const handleAvatarSelect = (url: string) => {
    setFormData(prev => ({ ...prev, avatar_url: url }));
    setIsAvatarDialogOpen(false);
  };

  return (
    <>
      {registrationSuccess ? (
        <div className="flex flex-col items-center justify-center text-center gap-4 p-4 text-white">
            <h1 className="text-2xl font-bold">¡Registro Exitoso!</h1>
            <p>
                Le hemos enviado un correo de confirmación a <span className="font-bold">{formData.email}</span>.
            </p>
            <p className="text-sm text-gray-400">
                Por favor, revise su bandeja de entrada (y la carpeta de spam) y haga clic en el enlace para activar su cuenta.
            </p>
            <Button onClick={onSwitchToLogin} className="w-full mt-4">
                Volver a inicio de sesión
            </Button>
        </div>
      ) : (
        <form onSubmit={handleFormSubmit} className={cn("flex flex-col gap-6 px-4 py-6 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-400 shadow-[0px_0px_130px_rgba(34,197,94,0.15)]", className)} {...props}>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Crea una cuenta</h1>
            <p className="text-xs px-4">
              Elige tu rol y completa tus datos para registrarte
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div 
              className={`cursor-pointer p-4 rounded-lg text-center border-2 ${role === 'jugador' ? 'border-green-400 bg-green-900/20' : 'border-gray-600'}`}
              onClick={() => setRole('jugador')}
            >
              <Label>Jugador</Label>
            </div>
            <div 
              className={`cursor-pointer p-4 rounded-lg text-center border-2 ${role === 'dt' ? 'border-green-400 bg-green-900/20' : 'border-gray-600'}`}
              onClick={() => setRole('dt')}
              title="Registrarse como DT"
            >
              <Label>DT</Label>
            </div>
          </div>

          {(role === 'jugador' || role === 'dt') && (
            <div className='grid gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="m@example.com" required />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" type="password" required />
              </div>
            </div>
          )}

          {role === 'dt' && (
            <div className='grid gap-4 border-t pt-4 border-gray-700'>
              <h2 className='text-lg font-semibold'>Datos Personales</h2>
              <div className='grid gap-2'>
                <Label htmlFor="fullname">Nombre y Apellido</Label>
                <Input id="fullname" name="fullname" value={formData.fullname} onChange={handleChange} placeholder="Ej: Juan Pérez" required />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <Label htmlFor="posicion">Posición de Juego</Label>
                  <Input id="posicion" name="posicion" value={formData.posicion} onChange={handleChange} placeholder="Ej: Director Técnico" required />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor="alias">Alias</Label>
                  <Input id="alias" name="alias" value={formData.alias} onChange={handleChange} placeholder="Ej: El Míster" required />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <Label htmlFor="altura">Altura (cm)</Label>
                  <Input 
                    id="altura" 
                    name="altura"
                    type="number" 
                    value={formData.altura} 
                    onChange={handleChange} 
                    placeholder="Ej: 175" 
                    required 
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                  <Input id="fecha_nacimiento" name="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={handleChange} required />
                </div>
              </div>
              <div className='grid gap-4'>
                <Label>Selecciona tu avatar</Label>
                <div className='flex items-center gap-4 '>
                  <img 
                    src={formData.avatar_url || 'https://placehold.co/80x80'} 
                    alt="Avatar preview"
                    className={formData.avatar_url ? 'imgShadow': 'opacity-10 h-20 w-20 rounded-full'}
                  />
                  <Button type='button' onClick={() => setIsAvatarDialogOpen(true)}>Elegir Avatar</Button>
                </div>
              </div>
            </div>
          )}

          {role === 'jugador' && (
            <div className='grid gap-4 border-t pt-4 border-gray-700'>
              <h2 className='text-lg font-semibold'>Datos de Jugador</h2>
              <div className='grid gap-2'>
                <Label htmlFor="club">Selecciona tu Club</Label>
                <Select value={formData.selectedClub} onValueChange={(value) => handleSelectChange('selectedClub', value)}>
                  <SelectTrigger id="club">
                    <SelectValue placeholder="Elige un club..." />
                  </SelectTrigger>
                  <SelectContent className='bg-gray-800 text-white'>
                    {clubs.map(club => (
                      <SelectItem key={club.id} value={club.id}>
                        <div className='flex items-center gap-2'>
                          <img src={club.logo_url} alt={club.name} className='w-6 h-6 object-contain'/>
                          <span>{club.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className='text-xs text-gray-400 mt-1'>
                  Una vez selecciones el club, el DT debe aceptar tu solicitud. Esto puede demorar.
                </p>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor="fullname">Nombre y Apellido</Label>
                <Input id="fullname" name="fullname" value={formData.fullname} onChange={handleChange} placeholder="Ej: Lionel Messi" required />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <Label htmlFor="posicion">Posición</Label>
                  <Input id="posicion" name="posicion" value={formData.posicion} onChange={handleChange} placeholder="Ej: Delantero" required />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor="alias">Alias</Label>
                  <Input id="alias" name="alias" value={formData.alias} onChange={handleChange} placeholder="Ej: La Pulga" required />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <Label htmlFor="altura">Altura (cm)</Label>
                  <Input id="altura" name="altura" type="number" value={formData.altura} onChange={handleChange} placeholder="Ej: 170" required />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                  <Input id="fecha_nacimiento" name="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={handleChange} required />
                </div>
              </div>
              <div className='grid gap-4'>
                <Label>Selecciona tu avatar</Label>
                <div className='flex items-center gap-4 '>
                  <img 
                    src={formData.avatar_url || 'https://placehold.co/80x80'} 
                    alt="Avatar preview"
                    className={formData.avatar_url ? 'imgShadow': 'opacity-10 h-20 w-20 rounded-full'}
                  />
                  <Button type='button' onClick={() => setIsAvatarDialogOpen(true)}>Elegir Avatar</Button>
                </div>
              </div>
            </div>
          )}
          
          <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
            <DialogContent className="bg-[#13161c] text-white border-0">
              <DialogHeader>
                <DialogTitle>Selecciona tu Avatar</DialogTitle>
                <DialogDescription>
                  Elige un avatar de la lista. Este será tu imagen de perfil.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-4 gap-2  max-h-[70vh] md:max-h-[80vh] overflow-y-auto">
                {avatarUrls.map((url) => (
                  <div 
                    key={url} 
                    className={`cursor-pointer rounded-full overflow-hidden border-4 hover:border-green-300  ${formData.avatar_url === url ? 'border-green-400 ring-2 ring-green-400' : 'border-transparent'}`}
                    onClick={() => handleAvatarSelect(url)}
                  >
                    <img src={url} alt="Avatar" className="w-full h-full"/>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <Button type="submit" disabled={isLoading} className="w-full mt-2">
            {(isLoading) ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
          
          <div className="text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <button type="button" onClick={onSwitchToLogin} className="underline underline-offset-4">
              Inicia sesión
            </button>
          </div>
        </form>
      )}
    </>
  )
}
