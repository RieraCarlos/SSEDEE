{/*
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchClubs } from "@/store/thunks/clubsThunks";
import ClubList from "@/components/Clubs/clubsList";

export default function ClubsPage(){
    const dispatch = useDispatch();
    const {clubs, loading } = useSelector((state) => state.clubs); 
    
    useEffect(() => {
        dispatch(fetchClubs());
    }, []);

    if(loading) return <p>Cargando clubs...</p>

    return(
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Clubs</h1>
            <ClubList clubs={clubs}/>
        </div>
    )
}
*/}