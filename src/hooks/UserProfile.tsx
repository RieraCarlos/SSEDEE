import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface PlayerCardProps {
  name: string;
  nickname?: string;
  posicion: string;
  team: string;
  height: string;
  birthdate: string;
  country: string;
  rating: number;
  image: string;
  background:string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  name,
  nickname,
  posicion,
  team,
  height,
  birthdate,
  country,
  image,
  background,
}) => {
  return (
    <Card className="w-full bg-[#07080a] text-white  border-0 rounded-none md:h-48 p-0">
      <CardContent className="flex flex-col md:flex-row py-4">

        {/* === LEFT INFO === */}
        <div className="md:w-1/3 flex flex-col order-2 md:order-1 -mt-10 mb-5 text-center md:text-left md:mb-0 md:-mt-0">
          <h2 className="text-lg md:text-xl font-bold">
            {name} {nickname && <span className="font-light">'{nickname}'</span>}
          </h2>
          <p className="text-gray-400 mt-1 text-xs md:text-sm">{posicion}</p>

          <div className="mt-5  text-xs md:text-sm">
            <p>
              <span className="text-gray-400">Equipo </span>
              <span className="text-white font-bold text-base">{team}</span>
            </p>
            <p>
              <span className="text-gray-400">Altura </span>
              <span className="text-white font-semibold">{height}</span>
            </p>
            <p>
              <span className="text-gray-400">Fecha de nacimiento </span>
              <span className="text-white font-semibold">{birthdate}</span>
            </p>
            <p>
              <span className="text-gray-400">Lugar </span>
              <span className="text-white font-semibold">{country}</span>
            </p>
          </div>
        </div>

        {/* === PLAYER IMAGE === */}
        <div 
            className="flex md:w-1/3 justify-center relative md:-top-40 -top-10 h-80 md:h-80 order-1 md:order-2"
            style={{
                backgroundImage:`url(${background})`,
                backgroundSize: '235px',
                backgroundPosition: 'center',
                backgroundBlendMode: 'overlay',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <img
                src={image}
                alt="player"
                className="h-55 relative top-12 mask-[linear-gradient(#000_70%,#0000)]"
            />
          
        </div>

        {/* === RATING === */}
        <div className="flex md:w-1/3 md:justify-end justify-center w-full order-3 md:order-3">
          <div className="bg-yellow-500 text-black rounded-lg p-4 text-center w-25 h-15 flex flex-col items-center justify-center shadow-lg -space-y-2">
            <span className="text-[10px]">Proximamente</span>
            <span className="text-xl font-extrabold underline">Puntaje</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerCard;
