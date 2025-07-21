import React, { useState, useEffect } from "react";
import axios from "axios";

interface Profile {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  matricula: string;
  carrera: string;
  grupo: string;
}

const CrudProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [form, setForm] = useState<Profile>({
    name: "",
    email: "",
    password: "",
    role: "user",
    matricula: "",
    carrera: "",
    grupo: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await axios.get<Profile[]>("/api/profiles");
      console.log("Fetched profiles:", response.data);
      setProfiles(response.data);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/profiles/${editingId}`, form);
      } else {
        await axios.post("/api/profiles", form);
      }
      setForm({
        name: "",
        email: "",
        password: "",
        role: "user",
        matricula: "",
        carrera: "",
        grupo: "",
      });
      setEditingId(null);
      setIsModalOpen(false);
      fetchProfiles();
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleEdit = (profile: Profile) => {
    console.log("Editing profile:", profile);
    setForm({
      name: profile.name || "",
      email: profile.email || "",
      password: "", // La contraseña no se debe cargar por seguridad
      role: profile.role || "user",
      matricula: profile.matricula || "",
      carrera: profile.carrera || "",
      grupo: profile.grupo || "",
    });
    setEditingId(profile._id || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    console.log("Deleting profile with ID:", id);
    try {
      await axios.delete(`/api/profiles/${id}`);
      fetchProfiles();
    } catch (error) {
      console.error("Error deleting profile:", error);
    }
  };

  const cancelEdit = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      role: "user",
      matricula: "",
      carrera: "",
      grupo: "",
    });
    setEditingId(null);
    setIsModalOpen(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Administrar Perfiles</h1>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
      >
        Crear Perfil
      </button>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-blue-100 text-blue-700">
            <th className="border border-gray-300 p-3">Nombre</th>
            <th className="border border-gray-300 p-3">Correo</th>
            <th className="border border-gray-300 p-3">Rol</th>
            <th className="border border-gray-300 p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((profile) => (
            <tr key={profile._id} className="bg-blue-50">
              <td className="border border-gray-300 p-3">{profile.name}</td>
              <td className="border border-gray-300 p-3">{profile.email}</td>
              <td className="border border-gray-300 p-3">{profile.role}</td>
              <td className="border border-gray-300 p-3">
                <button
                  onClick={() => handleEdit(profile)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600 mr-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(profile._id!)}
                  className="px-3 py-1 bg-red-500 text-white rounded shadow hover:bg-red-600"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? "Editar Perfil" : "Crear Perfil"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                placeholder="Nombre completo"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                placeholder="Correo electrónico"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleInputChange}
                placeholder="Contraseña inicial"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
              <select
                name="role"
                value={form.role}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
              <input
                type="text"
                name="matricula"
                value={form.matricula}
                onChange={handleInputChange}
                placeholder="Matrícula"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                type="text"
                name="carrera"
                value={form.carrera}
                onChange={handleInputChange}
                placeholder="Carrera"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                type="text"
                name="grupo"
                value={form.grupo}
                onChange={handleInputChange}
                placeholder="Grupo"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
                >
                  {editingId ? "Actualizar" : "Crear"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-3 bg-gray-500 text-white rounded shadow hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrudProfiles;
