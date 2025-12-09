import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { getAllClubsWithPlayers, type ClubWithPlayers } from "../../services/clubs.services"

export default function RegisteredClubs() {
  const [clubs, setClubs] = useState<ClubWithPlayers[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const data = await getAllClubsWithPlayers();
        setClubs(data);
      } catch (err) {
        setError("Failed to fetch clubs.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  if (loading) {
    return (
      <section className="w-full py-10 px-4 mb-30 flex justify-center">
        <p className="text-white text-lg">Cargando clubes...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full py-10 px-4 mb-30 flex justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </section>
    );
  }

  return (
    <section className="w-full py-10 px-4 mb-10 flex justify-center">
      <div className="max-w-6xl w-full">
        {/* Title */}
        <h2 className="text-center text-white text-3xl font-bold mb-10">
          Clubs registrados
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {clubs.map((club) => (
            <Card
              key={club.id}
              className="bg-[#13161c] border border-[#13161c]  hover:border-[#0ae98a] transition-all duration-300 rounded-2xl group cursor-pointer"
            >
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">

                {/* Icon */}
                <div className="w-20 h-20 rounded-2xl border-0 flex items-center justify-center group-hover:border-[#0ae98a] transition-all">
                  <img src={club.logo_url} alt={`${club.name} logo`} className="w-full h-full object-contain" />
                </div>

                {/* Club name */}
                <h3 className="text-white font-semibold text-lg">
                  {club.name}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
