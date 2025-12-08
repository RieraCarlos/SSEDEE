import { UserCog, PencilLine } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import PlayerCard from "@/hooks/UserProfile";
import EditProfileForm from "./EditProfileForm"; // Import the new form component
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchUserProfile } from "@/store/thunks/userThunks";
import { fetchClub, fetchClubNameById } from "@/store/thunks/clubsThunks";
import { selectUserProfile, selectUserLoading, selectUserError } from "@/store/slices/userSlice";
import { backgroundClubTeam, selectClubName } from "@/store/slices/clubsSlice";
import { selectAuthUser } from "@/store/slices/authSlice";
import LoadingSpinner from "../LoadingSpinner";

export default function C_Perfil() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState(false);
  
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const profile = useAppSelector(selectUserProfile);
  const clubName = useAppSelector(selectClubName);
  const isLoading = useAppSelector(selectUserLoading);
  const error = useAppSelector(selectUserError);
  const backgroud_team = useAppSelector(backgroundClubTeam);

  useEffect(() => {
    // Open the dialog and fetch profile if user is available and profile is not loaded
    if (isDialogOpen && user?.id && !profile) {
      dispatch(fetchUserProfile(user.id));
    }
  }, [dispatch, user, profile, isDialogOpen]);

  useEffect(() => {
    if (profile?.id_club) {
      dispatch(fetchClubNameById(profile.id_club));
      dispatch(fetchClub(profile.id_club));
    }
  }, [dispatch, profile]);


  const handleEditClick = () => {
    setEditForm(true);
  };

  const handleCloseForm = () => {
    setEditForm(false);
    // Optionally refetch data after closing the form to show updated info
    if (user?.id) {
        dispatch(fetchUserProfile(user.id));
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditForm(false); // Reset form state when dialog closes
    }
  };

  return (
    <div className="bg-[#13161c] border-2 border-[#13161c] rounded-2xl p-4 flex items-center justify-center overflow-hidden text-center space-x-3">
      <h2 className="font-bold text-xl text-gray-300">Perfil</h2>
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-400 hover:bg-gray-800"
            title="Ver y editar perfil"
          >
            <UserCog className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full md:min-w-5xl bg-[#13161c] text-white border-0 p-0">
          <DialogHeader className={editForm ? 'md:mb-0' : 'md:mb-25'}>
            <DialogTitle className="text-gray-300 p-6 flex  items-center">
              <span>Perfil de Jugador</span>
              {!editForm && (
                 <Button onClick={handleEditClick} className="text-gray-400 bg-[#13161c] hover:text-gray-400 hover:bg-gray-800">
                    <PencilLine />
                 </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {isLoading && <div className="flex justify-center items-center h-48"><LoadingSpinner /></div>}
          
          {error && !isLoading && <div className="text-red-500 text-center p-4">{error}</div>}

          {!isLoading && !error && profile && (
            <>
              {editForm ? (
                <EditProfileForm profile={profile} onClose={handleCloseForm} />
              ) : (
                <PlayerCard
                  name={profile.fullname || 'N/A'}
                  nickname={profile.alias}
                  posicion={profile.posicion || 'N/A'}
                  team={clubName || 'Sin Club'}
                  height={`${profile.altura || 'N/A'} cm`}
                  birthdate={profile.fecha_nacimiento || 'N/A'}
                  country={profile.lugar || 'N/A'}
                  rating={83} // This seems to be a mock value
                  image={profile.avatar || ''} // This should probably come from the profile
                  background={backgroud_team || ''}
                />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}