import { useAppSelector } from '@/hooks/useAppSelector';
import LoadingSpinner from '@/components/LoadingSpinner';
import HomeAdmin from '@/components/HomeAdmin/Home';

export default function Admin() {
  const { loading } = useAppSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="text-white min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Otherwise, show the normal DT dashboard.
  return (
    <div className="text-white min-h-screen flex flex-col space-y-2">
      <div className='px-5 md:px-15 lg:px-35 mb-15 '>
        <HomeAdmin />
      </div>
    </div>
  );
}
