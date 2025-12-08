import React from 'react';
import DecryptedText from '../ui/DecryptedText';
const Componente1: React.FC = () => {
  return (
    <div className='min-h-screen flex flex-col mt-10 md:mt-0'>
        {/* Contenido principal */}
        <div className="flex flex-col md:flex-row md:space-x-8 flex-grow">
            {/* Sección de la imagen (o placeholder) */}
            <div className="p-4 md:w-1/2 mb-8 md:mb-0">
                <div className=" h-full flex items-center justify-center drop-shadow-[0_0_50px_rgba(10,233,138,.45)]">
                    {/* Aquí puedes agregar un componente de imagen real si lo deseas */}
                    <img src="https://png.pngtree.com/png-vector/20250205/ourmid/pngtree-man-playing-football-logo-png-image_15382256.png" alt="" className='' />
                </div>
            </div>
            {/* Sección de texto */}
            <div className="flex-1 p-4 flex items-center justify-center flex-col space-y-4">
                <DecryptedText
                    text="Vive la emoción del deporte local en tiempo real"
                    sequential={true}
                    animateOn='view'
                    revealDirection='start'
                    speed={30}
                    maxIterations={10}
                    className="text-white text-xl md:text-2xl lg:text-3xl"
                    parentClassName='text-white text-xl md:text-2xl lg:text-3xl'
                />
                <DecryptedText
                    text="Inscribe a tu club, sigue los partidos en vivo y mantente actualizado con los resultados de cada torneo en Lago Agrio y Sucumbíos."
                    sequential={true}
                    animateOn='view'
                    revealDirection='start'
                    speed={10}
                    maxIterations={10}
                    className="text-white text-base md:text-lg lg:text-xl"
                    parentClassName='text-white text-base md:text-lg lg:text-xl'
                />
            </div>
        </div>
    </div>
        
  );
};

export default Componente1;