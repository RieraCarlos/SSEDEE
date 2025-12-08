import React from 'react';

const Componente3: React.FC = () => {
  return (
    <div className='flex flex-col mt-40'>
        {/* Sección superior de texto */}
        <div className="flex-grow flex flex-col items-center justify-center p-0 md:p-4 space-y-5">
            <span className="text-white text-3xl md:text-5xl lg:text-6xl font-extralight text-center">
                ¿Qué es la Plataforma?
            </span>
            <p className='text-white text-sm md:text-lg lg:text-xl text-center'>
              Eventos Deportivos es la primera plataforma digital de Lago Agrio que conecta clubes, torneos y fanáticos. Nuestro objetivo es dar visibilidad al deporte local, organizando competencias y mostrando resultados en vivo.
            </p>
        </div>
    </div>
      

  );
};

export default Componente3;