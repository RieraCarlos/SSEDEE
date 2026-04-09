import React from 'react';
import { 
  Trophy, 
  Dribbble, 
  Volleyball, 
  Waves, 
  Target, 
  Gamepad2,
  Sword,
  User
} from 'lucide-react';

interface SportIconProps {
  disciplineId?: string | null;
  size?: number;
  className?: string;
}

/**
 * SportIcon: Lookup table dinámico para iconografía según deporte.
 * Sigue el principio Open/Closed para escalabilidad.
 */
export const SportIcon: React.FC<SportIconProps> = ({ disciplineId, size = 20, className }) => {
  if (!disciplineId) return <Trophy size={size} className={className} />;

  const iconMap: Record<string, React.ReactNode> = {
    'futbol': <Trophy size={size} className={className} />,
    'futsal': <Target size={size} className={className} />,
    'basketball': <Dribbble size={size} className={className} />,
    'ecuavoley': <Volleyball size={size} className={className} />,
    'natacion': <Waves size={size} className={className} />,
    'gaming': <Gamepad2 size={size} className={className} />,
    'martial_arts': <Sword size={size} className={className} />,
  };

  // Normalización básica para el matching
  const normalizedId = disciplineId.toLowerCase();

  return iconMap[normalizedId] || <User size={size} className={className} />;
};

export default SportIcon;
