import { supabase } from "@/api/supabaseClient";
import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"
import RegisterForm from "@/components/auth/register-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { signIn} from "@/store/thunks/authThunks";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchClubs } from "@/store/thunks/clubsThunks";
import type { Club } from "@/api/type/clubs.api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [avatarUrls, setAvatarUrls] = useState<string[]>([]);

  const clubs = useAppSelector((state) => state.clubs.clubs as Club[]);

  // Fetch clubs and avatars when user switches to register view
  useEffect(() => {
    if (!isLoginView) {
      dispatch(fetchClubs());
      
      const fetchAvatars = async () => {
        const { data, error } = await supabase.storage.from('avatars').list();
        if (error) {
          console.error('Error fetching avatars:', error);
          return;
        }
        if (data) {
          const urls = data.map(file => {
            return supabase.storage.from('avatars').getPublicUrl(file.name).data.publicUrl;
          });
          setAvatarUrls(urls);
        }
      };
      fetchAvatars();
    }
  }, [isLoginView, dispatch]);

  const from = location.state?.from?.pathname || '/';


  const handleShowRegister = () => setIsLoginView(false);
  const handleShowLogin = () => setIsLoginView(true);

  const handleLogin = async ({ email, password }: { email: string, password:string }) => {
    setIsLoading(true);
    try {
      await dispatch(signIn({ email, password })).unwrap();
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Fallo el inicio de sesión:', error);
      alert(error.message || 'Correo o contraseña incorrectos.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="grid min-h-svh lg:grid-cols-2 ">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium text-[#0ae98a]">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4 text-[#0ae98a]" />
            </div>
            rg technology
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            {isLoginView ? (
              <LoginForm 
                onSubmit={handleLogin} 
                isLoading={isLoading} 
                onSwitchToRegister={handleShowRegister} 
              />
            ) : (
              <RegisterForm
                isLoading={isLoading}
                onSwitchToLogin={handleShowLogin}
                clubs={clubs}
                avatarUrls={avatarUrls}
              />
            )}
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <img
          src="https://d1csarkz8obe9u.cloudfront.net/posterpreviews/lionel-messi-design-template-84b62ec2b69a33cc179bf75483f5fa1f_screen.jpg?ts=1709318232"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.2] grayscale"
        />
      </div>
    </div>
  )
}
