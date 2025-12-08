import React from 'react';

const Componente4: React.FC = () => {
  return (
    <div>
      {/* Título de la copa y tabla */}
      <div className="flex flex-col items-center mb-8">
        <span className="text-gray-400 text-xl md:text-2xl lg:text-3xl font-light mb-2">
          Copa -NOMBRE-
        </span>
        <span className="text-gray-400 text-xl md:text-2xl lg:text-3xl font-light">
          Tabla de posiciones
        </span>
      </div>

      {/* Contenedor de la tabla de posiciones */}
      <div className="flex-shrink-0 w-full">
        <div className="bg-gray-800 border border-gray-600 rounded-3xl p-4 md:p-8 lg:p-12 h-96 md:h-[600px] lg:h-[700px] flex items-center justify-center">
          {/* Aquí se renderizaría la tabla real con los datos */}
          <span className="text-gray-500 font-mono">
            Aquí va la tabla de posiciones...
          </span>
        </div>
      </div>
    </div>
  );
};

export default Componente4;