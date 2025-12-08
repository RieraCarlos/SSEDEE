import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { updateUserProfile } from '@/store/thunks/userThunks';
import type { UserProfile } from '@/api/type/user-profile.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EditProfileFormProps {
  profile: UserProfile;
  onClose: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ profile, onClose }) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    fullname: '',
    alias: '',
    posicion: '',
    altura: 0,
    fecha_nacimiento: '',
    lugar: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullname: profile.fullname || '',
        alias: profile.alias || '',
        posicion: profile.posicion || '',
        altura: profile.altura || 0,
        fecha_nacimiento: profile.fecha_nacimiento || '',
        lugar: profile.lugar || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateUserProfile({ userId: profile.id, updates: formData }))
      .then(() => {
        onClose(); // Close the form on successful update
      });
  };

  return (
    <Card className="bg-[#13161c] text-white border-0">
      <CardHeader>
        <CardTitle>Editar Perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullname">Nombre Completo</Label>
            <Input
              id="fullname"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="alias">Alias</Label>
            <Input
              id="alias"
              name="alias"
              value={formData.alias}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="posicion">Posición</Label>
            <Input
              id="posicion"
              name="posicion"
              value={formData.posicion}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="altura">Altura (cm)</Label>
            <Input
              id="altura"
              name="altura"
              type="number"
              value={formData.altura}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
            <Input
              id="fecha_nacimiento"
              name="fecha_nacimiento"
              type="date"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="lugar">Lugar</Label>
            <Input
              id="lugar"
              name="lugar"
              value={formData.lugar}
              onChange={handleChange}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditProfileForm;
