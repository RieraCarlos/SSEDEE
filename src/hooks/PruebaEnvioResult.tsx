import React, { useState } from "react";

export default function FormularioUsuario() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    edad: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("http://localhost:4000/guardar-usuario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    alert(data.mensaje);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-gray-800 text-white rounded">
      <h2 className="mb-4 text-lg font-bold">Formulario Usuario</h2>

      <input
        type="text"
        name="nombre"
        placeholder="Nombre"
        value={formData.nombre}
        onChange={handleChange}
        className="block w-full mb-2 p-2 rounded bg-gray-700"
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="block w-full mb-2 p-2 rounded bg-gray-700"
      />

      <input
        type="number"
        name="edad"
        placeholder="Edad"
        value={formData.edad}
        onChange={handleChange}
        className="block w-full mb-4 p-2 rounded bg-gray-700"
      />

      <button
        type="submit"
        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
      >
        Guardar en JSON
      </button>
    </form>
  );
}
