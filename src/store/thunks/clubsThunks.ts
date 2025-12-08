import { createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "@/api/supabaseClient";
import type { Club } from "../../api/type/clubs.api"; // Import Club interface

export const fetchClubs = createAsyncThunk(
    "clubs/fetchClubs",
    async ( ) => {
        const {data, error} = await supabase
        .from('clubes')
        .select('*')
        .order("created_at", {ascending: false});
        if (error) throw error;
        return data;
    }
);

//Crear un nuevo club
export const createClub = createAsyncThunk(
    "clubs/createClub",
    async ({name, logo_url, backgroud_team, color}:{name:string, logo_url: string, backgroud_team: string, color: string}) => {
        const {data, error} = await supabase
        .from('clubes')
        .insert([{name, logo_url, backgroud_team, color}])
        .select()
        .single();

        if(error) throw error;
        return data;
    }
)

//

export const uploadLogoAndCreateClub = createAsyncThunk(
    "clubs/uploadAndCreate",
    async({file, name, backgroud_team, color}: { file: File, name: string, backgroud_team: string, color: string}) => {
        const fileName = `${Date.now()}-${file.name}`;

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                console.error("Error getting session:", sessionError);
                throw sessionError;
            }

            if (!session) {
                console.error("No active session found before upload. User is not authenticated.");
                throw new Error("No active session found before upload. User is not authenticated.");
            }
            console.log("Session found, proceeding with upload.");

            // Subir al bucket
            const {data: storageData, error: storageError} = await supabase
            .storage
            .from('logo_Clubs') 
            .upload(fileName, file);


            if(storageError) {
                // --- MORE DETAILED ERROR LOGGING ---
                console.error("Error detallado de Supabase Storage:", storageError);
                throw storageError;
            }
    
            const logoUrl = supabase.storage.from("logo_Clubs").getPublicUrl(fileName).data.publicUrl;
    
            // Crear club en la BD
            const {data, error} = await supabase
            .from('clubes')
            .insert([{name, logo_url:logoUrl, backgroud_team, color}])
            .select()
            .single();
    
    
            if(error) throw error;
            return data;
        } catch (error) {
            console.error("Error catastrófico en uploadLogoAndCreateClub:", error);
            throw error;
        }
    }
)

// Lista de jusgadores del club
export const fetchClubPlayers = createAsyncThunk(
    "clubs/fetchClubPlayers",
    async( clubId: string ) => {
        const {data, error} = await supabase
        .from('usuarios')
        .select('*')
        .eq('id_club', clubId)
        .order("created_at", {ascending: false});
        if (error) throw error;
        return data;
    }
);
// Nomina de cupos
export const fetchNominaCupos = createAsyncThunk(
    "clubs/fetchNominaCupos",
    async(clubId: string) => {
        // get the most recent 'partido' for this club and return only the 'nomina' column
        const { data, error } = await supabase
        .from('partidos')
        .select('nomina')
        .eq('id_club', clubId)
        .order("created_at", {ascending: false})
        .limit(1)
        .maybeSingle()
        if (error) throw error;
        // data may be null or an object with { nomina: string[] }
        return data?.nomina;
    }
)

//Importar el profile de cada jugador
export const SetProfileN = createAsyncThunk(
    "clubs/setProfileN",
    async(userId: string) => {
        const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        if (error) throw error;
        return data;
    }
)

// Asignar cupo a un jugador
export const assignCupoToPlayer = createAsyncThunk(
    "clubs/assignCupoToPlayer",
    async({clubId, playerId}: {clubId: string, playerId: string}) => {
        // Fetch the most recent partido for the club
        const { data: partidoData, error: partidoError } = await supabase
        .from('partidos')
        .select('id, nomina')
        .eq('id_club', clubId)
        .order("created_at", {ascending: false})
        .limit(1)
        .maybeSingle();
        if (partidoError) throw partidoError;

        if (!partidoData) {
            throw new Error(`No match found for club ID: ${clubId}. Cannot assign player.`);
        }

        const currentNomina = partidoData.nomina || [];

        // Add the playerId to the nomina array if not already present
        if (!currentNomina.includes(playerId)) {
            currentNomina.push(playerId);
        }
        // Update the partido with the new nomina
        const { data, error } = await supabase
        .from('partidos')
        .update({ nomina: currentNomina })
        .eq('id', partidoData.id)
        .select()
        .maybeSingle();
        if (error) throw error;
        return data;
    }
)   
//Eliminar cupo de un jugador
export const removeCupoFromPlayer = createAsyncThunk(
    "clubs/removeCupoFromPlayer",
    async({clubId, playerId}: {clubId: string, playerId: string}) => {
        // Fetch the most recent partido for the club
        const { data: partidoData, error: partidoError } = await supabase
        .from('partidos')
        .select('id, nomina')
        .eq('id_club', clubId)
        .order("created_at", {ascending: false})
        .limit(1)
        .maybeSingle();
        if (partidoError) throw partidoError;
        if (!partidoData) {
            throw new Error(`No match found for club ID: ${clubId}. Cannot remove player.`);
        }
        const currentNomina = partidoData.nomina || [];

        // Remove the playerId from the nomina array if present
        const updatedNomina = currentNomina.filter((id: string) => id !== playerId);
        // Update the partido with the new nomina
        const { data, error } = await supabase
        .from('partidos')
        .update({ nomina: updatedNomina })
        .eq('id', partidoData.id)
        .select()
        .maybeSingle();
        if (error) throw error;
        return data;
    }
)

// Traer la fecha de partido
export const fetchMatchDate = createAsyncThunk(
    "clubs/fetchMatchDate",
    async( clubId: string ) => {
        // Fetch fecha_horarios and partidos to compute per-fecha states
        const { data: fechasData, error: fechasError } = await supabase
            .from('fecha_horarios')
            .select('*')
            .eq('id_club', clubId)
            .order('created_at', { ascending: false });

        if (fechasError) throw fechasError;

        // Fetch partidos for this club
        const { data: partidosData, error: partidosError } = await supabase
            .from('partidos')
            .select('id, estado, fecha_juego, nomina, equipoA, equipoB')
            .eq('id_club', clubId);

        if (partidosError) throw partidosError;

        // Compose a flat list of fechas with associated state
        const results: Array<any> = [];
        if (Array.isArray(fechasData)) {
            for (const rec of fechasData) {
                const fechasArr: string[] = Array.isArray(rec.fechas) ? rec.fechas : [rec.fechas];
                for (const fecha of fechasArr) {
                    // find partido matching this date
                    const partido = Array.isArray(partidosData) ? partidosData.find(p => p.fecha_juego === fecha) : null;
                    const estado = partido?.estado ?? 'deshabilitado';
                    results.push({
                        id: `${rec.id}__${fecha}`,
                        recordId: rec.id,
                        id_club: rec.id_club,
                        fecha,
                        horario: rec.horario ?? [],
                        estado,
                        partidoId: partido?.id ?? null,
                    });
                }
            }
        }

        return results;
    }
);

// Editar Fecha de partido
export const editMatchDate = createAsyncThunk(
    "clubs/editMatchDate",
    async({clubId, newDate}: {clubId: string, newDate: string}) => {
        // Fetch the most recent partido for the club
        const { data: partidoData, error: partidoError } = await supabase
        .from('fechas_partidos')
        .select('id, fecha')
        .eq('id_club', clubId)
        .order("created_at", {ascending: false})
        .limit(1)
        .maybeSingle();
        if (partidoError) throw partidoError;
        if (!partidoData) {
            throw new Error(`No match found for club ID: ${clubId}. Cannot edit date.`);
        }
        // Update the partido with the new date
        const { data, error } = await supabase
        .from('fechas_partidos')
        .update({ fecha: newDate })
        .eq('id', partidoData.id)
        .select()
        .maybeSingle();
        if (error) throw error;
        return data;
    }
)

// Editar Horario de selección de cupos
export const editCupoSelectionTime = createAsyncThunk(
    "clubs/editCupoSelectionTime",
    async({clubId, startTime, endTime}: {clubId: string, startTime: string, endTime: string}) => {
        // Fetch the most recent partido for the club
        const { data: partidoData, error: partidoError } = await supabase
        .from('fechas_partidos')
        .select('id, horario')
        .eq('id_club', clubId)
        .order("created_at", {ascending: false})
        .limit(1)
        .maybeSingle();
        if (partidoError) throw partidoError;
        if (!partidoData) {
            throw new Error(`No match found for club ID: ${clubId}. Cannot edit cupo selection time.`);
        }
        // Update the partido with the new times
        const arrayHorario = [startTime, endTime];
        const { data, error } = await supabase
        .from('fachas_partidos')
        .update({ horario: arrayHorario })
        .eq('id', partidoData.id)
        .select()
        .maybeSingle();
        if (error) throw error;
        return data;
    }
)

// Actualizar fechas de partido
export const updateMatchDates = createAsyncThunk(
    "clubs/updateMatchDates",
    async({recordId, newDates}: {recordId: string, newDates: string | string[]}) => {
        console.log('Updating match dates for recordId:', recordId, 'with newDates:', newDates); // Added logging
        // Update the fecha_horarios record with new dates
        const { data, error } = await supabase
        .from('fecha_horarios')
        .update({ fechas: newDates })
        .eq('id', recordId)
        .select()
        .single();
        if (error) {
            console.error("Supabase updateMatchDates error:", error); // Added detailed error logging
            throw error;
        }
        // Asegurar que devolvemos el objeto completo
        return data || { id: recordId, fechas: newDates };
    }
)
//Eliminar fecha de partido
export const deleteMatchDate = createAsyncThunk(
    "clubs/deleteMatchDate",
    async({recordId}:{recordId:string}) => {
        console.log('Eliminando fecha: ', recordId );
        //
        const {data, error} = await supabase
        .from('fecha_horarios')
        .delete()
        .eq('id', recordId)
        .select()
        .single();

        if(error){
            console.log("Supabase delete error: ", error);
            throw error
        }
        //
        return data;
    }   
)
// Create new match dates
export const createMatchDates = createAsyncThunk(
    "clubs/createMatchDates",
    async({clubId, dates}: {clubId: string, dates: string[]}) => {
        console.log('Creating new match dates for clubId:', clubId, 'with dates:', dates); // Added logging
        const { data, error } = await supabase
        .from('fecha_horarios')
        .insert([{ id_club: clubId, fechas: dates }])
        .select()
        .single();
        if (error) {
            console.error("Supabase createMatchDates error:", error);
            throw error;
        }
        return data;
    }
);


// Actualizar horarios de partido
export const updateMatchHours = createAsyncThunk(
    "clubs/updateMatchHours",
    async({recordId, startTime, endTime}: {recordId: string, startTime: string, endTime: string}) => {
        // Update the fecha_horarios record with new hours
        const horario = [startTime, endTime];
        const { data, error } = await supabase
        .from('fecha_horarios')
        .update({ horario })
        .eq('id', recordId)
        .select()
        .single();
        console.log('Array en supa: ', horario)
        if (error) throw error;
        // Asegurar que devolvemos el objeto completo
        return data || { id: recordId, horario };
    }
)

// Actualizar el horario para todos los registros de un club
export const updateClubHorario = createAsyncThunk(
    "clubs/updateClubHorario",
    async({clubId, startTime, endTime}: {clubId: string, startTime: string, endTime: string}) => {
        const horario = [startTime, endTime];
        const { data, error } = await supabase
            .from('fecha_horarios')
            .update({ horario })
            .eq('id_club', clubId)
            .select();

        if (error) throw error;
        return data;
    }
);

// Actualizar nomina de equipos
export const updateTeamsPlayers = createAsyncThunk(
    "clubs/updateTeamsPlayers",
    async({recordId, teamP_A, teamP_B}:{recordId:string, teamP_A: string[] | null, teamP_B:string[] | null}) => {
        // Ensure arrays (or empty arrays) are sent to Supabase
        const equipoA = Array.isArray(teamP_A) ? teamP_A : [];
        const equipoB = Array.isArray(teamP_B) ? teamP_B : [];

        // Try to update treating recordId as partido id first
        let { data, error } = await supabase
            .from("partidos")
            .update({ equipoA, equipoB })
            .eq('id', recordId)
            .select()
            .maybeSingle();


        // If nothing was updated (no matching partido by id), try treating recordId as club id
        if (!data) {
            const { data: partidoData, error: partidoError } = await supabase
                .from('partidos')
                .select('id')
                .eq('id_club', recordId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();


            if (partidoError) throw partidoError;
            if (!partidoData || !partidoData.id) {
                throw new Error(`No partido found for identifier: ${recordId}`);
            }

            const partidoId = partidoData.id;
            const res = await supabase
                .from('partidos')
                .update({ equipoA, equipoB })
                .eq('id', partidoId)
                .select()
                .maybeSingle();


            if (res.error) throw res.error;
            return res.data;
        }

        if (error) throw error;
        return data;
    }
)

// Toggle estado of a fecha_horarios record. If enabling, create a partido for that date (if none habilitado exists).
export const toggleMatchDateState = createAsyncThunk(
    'clubs/toggleMatchDateState',
    async({fechaId, clubId, date, newState}:{fechaId:string, clubId:string, date:string, newState: 'habilitado' | 'deshabilitado' | 'guardado'}) => {
        // Mark fechaId as used (we keep fecha_horarios as source of dates, partidos store estado)
        void fechaId;
        // Note: Do not persist estado on fecha_horarios; estado is represented in 'partidos' table
        // If enabling, ensure no other partido is habilitado and create a new partido linked to this club/date
        if (newState === 'habilitado') {
            // Check for existing habilitado partido
            const { data: habilitados, error: habErr } = await supabase
                .from('partidos')
                .select('id')
                .eq('estado', 'habilitado');
            if (habErr) throw habErr;
            if (Array.isArray(habilitados) && habilitados.length > 0) {
                throw new Error('Ya existe un partido habilitado. Deshabilite primero el otro partido.');
            }

            // Create partido with empty arrays and fecha_juego
            const { data: creado, error: createErr } = await supabase
                .from('partidos')
                .insert([{ id_club: clubId, nomina: [], equipoA: [], equipoB: [], estado: 'habilitado', fecha_juego: date }])
                .select()
                .maybeSingle();
            if (createErr) throw createErr;
            return { partido: creado };
        }

        // If guardado or deshabilitado, update partido matching club & date to change its estado
            const { data: partidoFound, error: pfErr } = await supabase
            .from('partidos')
            .select('*')
            .eq('id_club', clubId)
            .eq('fecha_juego', date)
            .limit(1)
            .maybeSingle();
        if (pfErr) throw pfErr;
        if (partidoFound) {
            const { data: pUpdated, error: pUpdErr } = await supabase
                .from('partidos')
                .update({ estado: newState })
                .eq('id', partidoFound.id)
                .select()
                .maybeSingle();
            if (pUpdErr) throw pUpdErr;
            return { partido: pUpdated };
        }

        return { partido: null };
    }
)

// Traer nomina de equipos
export const getTeamsPlayers = createAsyncThunk(
    "clubs/getTeamsPlayers",
    async({recordId}:{recordId:string}) => {
        let { data: partidoData, error: partidoError } = await supabase
                .from('partidos')
                .select('id')
                .eq('id_club', recordId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
        if(partidoError) throw partidoError;

        if(partidoData){
            const {data, error} = await supabase
                    .from('partidos')
                    .select('equipoA, equipoB, estado, equipo_ganador')
                    .eq('id', partidoData.id)
                    .maybeSingle();
            if(error) throw error;
            return { partidoId: partidoData.id, equipoA: data?.equipoA ?? [], equipoB: data?.equipoB ?? [], equipoGanador: data?.equipo_ganador, estado: data?.estado };
        }
        return { partidoId: null, equipoA: [], equipoB: [], equipoGanador: null, estado:null };
    }
)

// Fetch partidos with estado = 'guardado' for history view
export const fetchGuardadoMatches = createAsyncThunk(
    'clubs/fetchGuardadoMatches',
    async({clubId}:{clubId:string}) => {
        const { data, error } = await supabase
            .from('partidos')
            .select('id, created_at, fecha_juego, estado, equipo_ganador, equipoA, equipoB')
            .eq('id_club', clubId)
            .eq('estado', 'guardado')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }
)

export const saveMatchResult = createAsyncThunk(
    'clubs/saveMatchResult',
    async ({ partidoId, winningTeam }: { partidoId: string, winningTeam: 'A' | 'B' }) => {
        const { data, error } = await supabase
            .from('partidos')
            .update({ estado: 'guardado', equipo_ganador: winningTeam })
            .eq('id', partidoId)
            .select()
            .single();
        if (error) throw error;
        return data;
    }
);

export const assignPlayerToChaleco = createAsyncThunk(
    "clubs/assignPlayerToChaleco",
    async({clubId, playerName}: {clubId: string, playerName: string}) => {
        // Fetch the most recent partido for the club
        const { data: partidoData, error: partidoError } = await supabase
        .from('partidos')
        .select('id')
        .eq('id_club', clubId)
        .order("created_at", {ascending: false})
        .limit(1)
        .maybeSingle();
        if (partidoError) throw partidoError;

        if (!partidoData) {
            throw new Error(`No match found for club ID: ${clubId}. Cannot assign player to chaleco.`);
        }

        // Update the partido with the new chaleco player
        const { data, error } = await supabase
        .from('partidos')
        .update({ chaleco: playerName })
        .eq('id', partidoData.id)
        .select()
        .maybeSingle();
        if (error) throw error;
        return data;
    }
);

export const fetchChalecoPlayer = createAsyncThunk(
    "clubs/fetchChalecoPlayer",
    async(clubId: string) => {
        const { data, error } = await supabase
        .from('partidos')
        .select('chaleco')
        .eq('id_club', clubId)
        .order("created_at", {ascending: false})
        .limit(1)
        .maybeSingle();
        if (error) throw error;
        return data?.chaleco ?? null;
    }
);

export const updatePartidoUbicacion = createAsyncThunk(
    "clubs/updatePartidoUbicacion",
    async({clubId, ubicacion}: {clubId: string, ubicacion: string}) => {
        // Fetch the most recent partido for the club
        const { data: partidoData, error: partidoError } = await supabase
        .from('partidos')
        .select('id')
        .eq('id_club', clubId)
        .order("created_at", {ascending: false})
        .limit(1)
        .maybeSingle();
        if (partidoError) throw partidoError;

        if (!partidoData) {
            throw new Error(`No match found for club ID: ${clubId}. Cannot update ubicacion.`);
        }

        // Update the partido with the new ubicacion
        const { data, error } = await supabase
        .from('partidos')
        .update({ ubicacion: ubicacion })
        .eq('id', partidoData.id)
        .select()
        .maybeSingle();
        if (error) throw error;
        return data;
    }
);

export const fetchPartidoUbicacion = createAsyncThunk(
    "clubs/fetchPartidoUbicacion",
    async(clubId: string) => {
        const { data, error } = await supabase
        .from('partidos')
        .select('ubicacion')
        .eq('id_club', clubId)
        .order("created_at", {ascending: false})
        .limit(1)
        .maybeSingle();
        if (error) throw error;
        return data?.ubicacion ?? null;
    }
);

// Thunk to fetch a single club's name by ID
export const fetchClubNameById = createAsyncThunk<string, string>(
    "clubs/fetchClubNameById",
    async (clubId, { rejectWithValue }) => {
      try {
        const { data, error } = await supabase
          .from("clubes")
          .select("name")
          .eq("id", clubId)
          .single();
  
        if (error) {
          throw error;
        }
  
        return data.name;
      } catch (error: any) {
        return rejectWithValue(error.message);
      }
    }
  );

// Thunk to fetch a single club's name by ID
export const fetchClub = createAsyncThunk<Club, string>(
    "clubs/fetchClub",
    async (clubId, { rejectWithValue }) => {
      try {
        const { data, error } = await supabase
          .from("clubes")
          .select("*")
          .eq("id", clubId)
          .single();
  
        if (error) {
          throw error;
        }
  
        return data;
      } catch (error: any) {
        return rejectWithValue(error.message);
      }
    }
  );