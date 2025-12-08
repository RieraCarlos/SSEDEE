import { use, useEffect, useState } from "react";
import { fetchClubs } from "@/store/thunks/clubsThunks";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
export default function ClubList() {
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(fetchClubs());
    }, []);
    
    const { clubs, loading, error } = useAppSelector((state) => state.clubs);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Lista de clubes</h2>

                <button
                onClick={() => dispatch(fetchClubs())}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                Actualizar
                </button>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(clubs) && clubs.map((club) => (
                    <li
                        key={club.id}
                        className="p-4 border rounded-lg shadow hover:shadow-md transition"
                    >
                        <h3 className="font-bold text-lg">{club.name}</h3>
                        <p className="text-gray-600">Activo: {club.is_active ? 'Sí' : 'No'}</p>
                        <p className="text-gray-600">Creado: {club.created_at}</p>
                    </li>
                ))}
            </ul>
        </div>
  );
}
