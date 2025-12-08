import Footer from '@/components/Landing/Footer';
import Nav from '@/components/Landing/Nav';
import { useAppSelector } from '@/hooks/useAppSelector';
import HomeClub from '@/components/HomeDT/HomeClub'; // Corrected path for DT's home
import CreateClubForm from '@/components/Clubs/CreateClubForm';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DT() {
  const { user, loading } = useAppSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="text-white min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  // If the user is a DT and has no club, show the creation form.
  if (user && user.role === 'dt' && !user.id_club) {
    return (
      <div className="text-white min-h-screen flex flex-col">
        <Nav />
        <div className="flex-grow flex items-center justify-center p-4">
          <CreateClubForm user={user} />
        </div>
        <Footer />
      </div>
    );
  }

  // Otherwise, show the normal DT dashboard.
  return (
    <div className="text-white min-h-screen flex flex-col space-y-2">
      <Nav />
      <div className='px-5 md:px-15 lg:px-35 mb-15 '>
        <HomeClub />
      </div>
      <Footer />
    </div>
  );
}
