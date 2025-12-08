import React from 'react';

// Importa el icono que desees usar. Aquí se usa un SVG como ejemplo.
// Puedes reemplazarlo con un icono de una librería como react-icons.
const UserIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const Componente5: React.FC = () => {
  return (
    <div className="bg-black min-h-screen text-white p-4 md:p-8 lg:p-12 flex flex-col items-center justify-center">
      {/* Título del equipo */}
      <div className="text-center mb-8">
        <p className="text-gray-400 font-light text-xl md:text-2xl mb-1">REALIZADO POR:</p>
        <h1 className="text-gray-400 font-bold text-2xl md:text-3xl">EQUIPO RG TECHNOLOGY</h1>
      </div>

      {/* Contenedor de las tarjetas de los miembros */}
      <div className="flex flex-col items-center md:flex-row md:space-x-8 md:items-end">
        {/* Tarjeta del miembro 1 */}
        <div className="bg-gray-800 border-2 border-gray-600 rounded-3xl p-6 mb-8 md:mb-0 w-64 h-80 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
          <UserIcon />
        </div>

        {/* Tarjeta del miembro 2 */}
        <div className="bg-gray-800 border-2 border-gray-600 rounded-3xl p-6 mb-8 md:mb-0 w-64 h-80 flex items-center justify-center -translate-y-4 md:translate-y-0 transform hover:scale-105 transition-transform duration-300">
          <UserIcon />
        </div>

        {/* Tarjeta del miembro 3 */}
        <div className="bg-gray-800 border-2 border-gray-600 rounded-3xl p-6 mb-8 md:mb-0 w-64 h-80 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
          <UserIcon />
        </div>

        {/* Tarjeta del miembro 4 */}
        <div className="bg-gray-800 border-2 border-gray-600 rounded-3xl p-6 mb-8 md:mb-0 w-64 h-80 flex items-center justify-center -translate-y-4 md:translate-y-0 transform hover:scale-105 transition-transform duration-300">
          <UserIcon />
        </div>
      </div>
    </div>
  );
};

export default Componente5;