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
import { useState } from 'react';
import LogoB from '/images/LogoB.png';

const Nav: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(state => state.auth.user)
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(signOut() as any)
      navigate('/login')
    } catch (e) {
      console.error('Logout failed', e)
    }
  }
  return (
    <div className="relative">
      {/* <p>SSEDEE</p> Encabezado */}
      <div className="flex items-center justify-between bg-[#13161c] h-20 px-7 md:px-15 lg:px-30 mb-8">
        <div className="font-bold text-2xl text-[#0ae98a] rounded-full">
          <img src={LogoB} alt="" className='h-10'/>
        </div>

        {/* Hamburger menu icon for small screens */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              )}
            </svg>
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <ul className='flex space-x-8 text-white'>
            <li className="cursor-pointer" onClick={() => navigate('/', { state: { scrollTo: 'servicios' } })}>Servicios</li>
            <li className="cursor-pointer" onClick={() => navigate('/', { state: { scrollTo: 'nosotros' } })}>Nosotros</li>
            <li className="cursor-pointer" onClick={() => navigate('/', { state: { scrollTo: 'contactanos' } })}>Contactanos</li>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <li className="cursor-pointer">Mi cuenta</li>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='bg-[#13161c] text-white border-0 '>
                  <DropdownMenuItem onClick={() => navigate(user.role === 'dt' ? '/dt' : '/jugador')}>
                    Dashboard
                  </DropdownMenuItem>
                  {user.role === 'dt' && (
                    <DropdownMenuItem onClick={() => navigate('/nomina')}>
                      Nómina
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
            {user?.role === 'admin' && <Link to={'/eventos'}>Eventos</Link>}
          </ul>
          {!user ? (
            <button className=" text-white font-bold py-2 px-6 border-2 border-[#0ae98a] rounded-xl shadow-lg hover:bg-[#0ae98a] hover:text-[#13161c] transition-colors">
              <Link to={'/login'}>Login</Link>
            </button>
          ) : (
            <Button onClick={handleLogout} className="text-white font-bold py-2 px-6 border-2 border-red-600 rounded-xl shadow-lg hover:bg-red-900 transition-colors">
              Cerrar sesión
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden absolute top-20 left-0 w-full bg-[#13161c] shadow-lg transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-10`}>
        <ul className='flex flex-col space-y-4 p-7 text-white'>
          <li className="cursor-pointer" onClick={() => { navigate('/', { state: { scrollTo: 'servicios' } }); setIsOpen(false); }}>Servicios</li>
          <li className="cursor-pointer" onClick={() => { navigate('/', { state: { scrollTo: 'nosotros' } }); setIsOpen(false); }}>Nosotros</li>
          <li className="cursor-pointer" onClick={() => { navigate('/', { state: { scrollTo: 'contactanos' } }); setIsOpen(false); }}>Contactanos</li>
          {user ? (
            <>
              <li className="cursor-pointer" onClick={() => navigate(user.role === 'dt' ? '/dt' : '/jugador')}>
                Dashboard
              </li>
              {user.role === 'dt' && (
                <li className="cursor-pointer" onClick={() => navigate('/nomina')}>
                  Nómina
                </li>
              )}
            </>
          ) : null}
          {user?.role === 'admin' && <Link to={'/eventos'}>Eventos</Link>}
          {user?.role === 'dt' && <Link to={'/solicitudes'}>Solicitudes</Link>}
          <div className="pt-4">
            {!user ? (
              <button className="w-full text-white font-bold py-2 px-6 border-2 border-[#0ae98a] rounded-xl shadow-lg hover:bg-[#0ae98a] hover:text-[#13161c] transition-colors">
                <Link to={'/login'}>Login</Link>
              </button>
            ) : (
              <Button onClick={handleLogout} className="w-full text-white font-bold py-2 px-6 border-2 border-red-600 rounded-xl shadow-lg hover:bg-red-900 transition-colors">
                Cerrar sesión
              </Button>
            )}
          </div>
        </ul>
      </div>
    </div>
  )
}

export default Nav;