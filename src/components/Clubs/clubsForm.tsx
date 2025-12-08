import { useDispatch, UseDispatch } from "react-redux";
import { useState } from "react";
import { uploadLogoAndCreateClub } from "@/store/thunks/clubsThunks";
export default function ClubForm(){
    const dispatch = useDispatch();
    const [form, setForm] = useState({
        name:'',
        file:null,
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(uploadLogoAndCreateClub(form));
    }

    return(
        <form className="p-4 bg-white shadow rounded-xl" onSubmit={handleSubmit}>
            <input 
                type="text"
                placeholder="Nombre del Club"
                className="input"
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
            <input 
                type="file"
                className="input"
                accept="image/*"
                onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
            />

            <button type="submit" className="btn-primary mt-3">
                Crear Club
            </button>
        </form>
    )
}   