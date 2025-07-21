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
  rfids: { id: string; active: boolean }[];
  calendarIds: string[];
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
    rfids: [],
    calendarIds: [],
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExtraFieldsModalOpen, setIsExtraFieldsModalOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

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

  const handleAddToList = (field: "rfids" | "calendarIds", value: string) => {
    if (field === "rfids") {
      setForm({ ...form, rfids: [...form.rfids, { id: value, active: false }] });
    } else {
      setForm({ ...form, calendarIds: [...form.calendarIds, value] });
    }
  };

  const handleRemoveFromList = (field: "rfids" | "calendarIds", index: number) => {
    const updatedList = [...form[field]];
    updatedList.splice(index, 1);
    setForm({ ...form, [field]: updatedList });
  };

  const handleToggleActive = (index: number) => {
    const updatedRfids = form.rfids.map((rfid, i) =>
      i === index ? { ...rfid, active: !rfid.active } : rfid
    );
    setForm({ ...form, rfids: updatedRfids });
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
        rfids: [],
        calendarIds: [],
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
      rfids: profile.rfids || [],
      calendarIds: profile.calendarIds || [],
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
      rfids: [],
      calendarIds: [],
    });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const openExtraFieldsModal = (profileId: string) => {
    setSelectedProfileId(profileId);
    setIsExtraFieldsModalOpen(true);
  };

  const closeExtraFieldsModal = () => {
    setSelectedProfileId(null);
    setIsExtraFieldsModalOpen(false);
  };

  const updateRFIDsAndCalendarIds = async () => {
    try {
      if (selectedProfileId) {
        const profileToUpdate = profiles.find(
          (profile) => profile._id === selectedProfileId
        );
        if (profileToUpdate) {
          await axios.put(`/api/profiles/${selectedProfileId}`, {
            ...profileToUpdate,
            rfids: form.rfids,
            calendarIds: form.calendarIds,
          });
          console.log("RFID and Calendar IDs updated successfully.");
          fetchProfiles();
        }
      }
    } catch (error) {
      console.error("Error updating RFID and Calendar IDs:", error);
    }
    closeExtraFieldsModal();
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
                  onClick={() => openExtraFieldsModal(profile._id!)}
                  className="px-3 py-1 bg-blue-500 text-white rounded shadow hover:bg-blue-600 mr-2"
                >
                  Agregar RFID y Calendarios
                </button>
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
          <div className="bg-white p-6 rounded shadow-md w-full max-w-4xl">
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
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-gray-500 text-white rounded shadow hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isExtraFieldsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-4xl">
            <h2 className="text-xl font-bold mb-4">Agregar RFID y Calendarios</h2>
            <div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Agregar RFID"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  id="rfidInput"
                />
                <button
                  onClick={() => {
                    const input = document.getElementById(
                      "rfidInput"
                    ) as HTMLInputElement;
                    if (input && input.value) {
                      handleAddToList("rfids", input.value);
                      input.value = "";
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
                >
                  Agregar
                </button>
              </div>
              <table className="w-full border-collapse border border-gray-300 mt-4">
                <tbody>
                  {form.rfids.map((rfid, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">{rfid.id}</td>
                      <td className="border border-gray-300 p-2">
                        <button
                          onClick={() => handleToggleActive(index)}
                          className={`px-2 py-1 rounded ${
                            rfid.active ? "bg-green-500" : "bg-red-500"
                          } text-white`}
                        >
                          {rfid.active ? "Activo" : "Inactivo"}
                        </button>
                      </td>
                      <td className="border border-gray-300 p-2">
                        <button
                          onClick={() => handleRemoveFromList("rfids", index)}
                          className="px-2 py-1 bg-red-500 text-white rounded"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Agregar ID de Calendario"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  id="calendarIdInput"
                />
                <button
                  onClick={() => {
                    const input = document.getElementById(
                      "calendarIdInput"
                    ) as HTMLInputElement;
                    if (input && input.value) {
                      handleAddToList("calendarIds", input.value);
                      input.value = "";
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
                >
                  Agregar
                </button>
              </div>
              <table className="w-full border-collapse border border-gray-300 mt-4">
                <tbody>
                  {form.calendarIds.map((id, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">{id}</td>
                      <td className="border border-gray-300 p-2">
                        <button
                          onClick={() => handleRemoveFromList("calendarIds", index)}
                          className="px-2 py-1 bg-red-500 text-white rounded"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={updateRFIDsAndCalendarIds}
                className="px-6 py-3 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
              >
                Guardar
              </button>
              <button
                onClick={closeExtraFieldsModal}
                className="px-6 py-3 bg-gray-500 text-white rounded shadow hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrudProfiles;
