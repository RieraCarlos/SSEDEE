import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { signOut } from '@/store/thunks/authThunks';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

const LogoB = '/images/LogoB.png';

const Nav: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(state => state.auth.user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await dispatch(signOut() as any);
      navigate('/login');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  const navItems = [
    { label: 'Servicios', action: () => navigate('/', { state: { scrollTo: 'servicios' } }) },
    { label: 'Nosotros', action: () => navigate('/', { state: { scrollTo: 'nosotros' } }) },
    { label: 'Contactanos', action: () => navigate('/', { state: { scrollTo: 'contactanos' } }) },
    { label: 'Eventos', action: () => navigate('/eventos') },
  ];

  return (
    <>
      {/* Overlay para menú móvil */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <nav className="relative">
        {/* Header Principal - Glassmorphism */}
        <div className="relative z-50 bg-secondary-bg/80 backdrop-blur-xl border-b border-accent/10 h-20 px-4 md:px-6 lg:px-8 flex items-center justify-between shadow-lg">
          {/* Logo */}
          <div className="flex items-center">
            <img src={LogoB} alt="SSEDEE Logo" className="h-10 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <ul className="flex items-center space-x-8">
              {navItems.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={item.action}
                    className="text-white/80 hover:text-accent font-medium transition-colors duration-200 text-sm uppercase tracking-wide"
                  >
                    {item.label}
                  </button>
                </li>
              ))}

              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 text-white/80 hover:text-accent font-medium transition-colors duration-200 text-sm uppercase tracking-wide">
                      Mi cuenta
                      <ChevronDown size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-secondary-bg border-accent/20 text-white">
                    <DropdownMenuItem
                      onClick={() => navigate(user.role === 'dt' ? '/dt' : '/jugador')}
                    >
                      Dashboard
                    </DropdownMenuItem>
                    {user.role === 'dt' && (
                      <DropdownMenuItem
                        onClick={() => navigate('/nomina')}
                        className="hover:bg-accent/10 focus:bg-accent/10"
                      >
                        Nómina
                      </DropdownMenuItem>
                    )}
                    {user.role === 'dt' && (
                      <DropdownMenuItem
                        onClick={() => navigate('/solicitudes')}
                        className="hover:bg-accent/10 focus:bg-accent/10"
                      >
                        Solicitudes
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </ul>

            {/* Auth Buttons */}
            {!user ? (
              <Button
                asChild
                className="bg-accent hover:bg-accent/90 text-primary-bg font-bold border border-accent/20 shadow-lg hover:shadow-accent/20 transition-all duration-200"
              >
                <Link to="/login">Login</Link>
              </Button>
            ) : (
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-400 font-bold"
              >
                Cerrar sesión
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-secondary-bg/50 border border-accent/10 text-accent hover:bg-accent/10 transition-colors duration-200"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`md:hidden fixed top-20 left-0 right-0 bg-secondary-bg/95 backdrop-blur-xl border-b border-accent/10 shadow-2xl z-40 transition-all duration-300 ${
          isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}>
          <div className="px-4 py-6 space-y-4">
            {/* Navigation Items */}
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  item.action();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-white/80 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors duration-200 font-medium uppercase tracking-wide text-sm"
              >
                {item.label}
              </button>
            ))}

            {/* User Menu */}
            {user && (
              <>
                <div className="border-t border-accent/10 pt-4">
                  <button
                    onClick={() => {
                      navigate(user.role === 'dt' ? '/dt' : '/jugador');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-accent/20 rounded-lg transition-colors duration-200 font-medium"
                  >
                    Dashboard
                  </button>
                  {user.role === 'dt' && (
                    <>
                      <button
                        onClick={() => {
                          navigate('/nomina');
                          setIsMobileMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-accent/20 rounded-lg transition-colors duration-200 font-medium"
                      >
                        Nómina
                      </button>
                      <button
                        onClick={() => {
                          navigate('/solicitudes');
                          setIsMobileMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-accent/20 rounded-lg transition-colors duration-200 font-medium"
                      >
                        Solicitudes
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {/* Auth Actions */}
            <div className="border-t border-accent/10 pt-4 space-y-3">
              {!user ? (
                <Button
                  asChild
                  className="w-full bg-accent hover:bg-accent/90 text-primary-bg font-bold"
                >
                  <Link to="/login">Login</Link>
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-400 font-bold"
                >
                  Cerrar sesión
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Nav;