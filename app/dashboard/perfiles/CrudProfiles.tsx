import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNotifications } from "@/app/lib/notificationsClient";

const SendButton = ({ email, name, id }: { email: string; name: string; id?: string | null }) => {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  let notificationsCtx = null as any;
  try {
    notificationsCtx = useNotifications();
  } catch (e) {
    // not within provider
    notificationsCtx = null;
  }

  const handleSend = async () => {
    setLoading(true);
    const inputId = `notif-input-${id ?? email}`;
    const input = document.getElementById(inputId) as HTMLInputElement | null;
    const message = input?.value || `Hola ${name}, notificación de prueba`;
    try {
      if (notificationsCtx && notificationsCtx.sendNotification) {
        await notificationsCtx.sendNotification(email, message, "Admin");
      } else {
        // fallback: try posting directly, but handle 404 by consulting lookup and retrying
        try {
          await axios.post("/api/notifications", { to: email, message, from: "Admin" });
        } catch (err: any) {
          if (err?.response?.status === 404) {
            try {
              const lookup = await axios.get(`/api/profiles/lookup?email=${encodeURIComponent(email)}`);
              const data = lookup.data || {};
              if (data?.found && data.email) {
                await axios.post("/api/notifications", { to: data.email, message, from: "Admin" });
              } else {
                const normalized = (email || "").toString().trim().toLowerCase();
                if (normalized && normalized !== email) {
                  await axios.post("/api/notifications", { to: normalized, message, from: "Admin" });
                } else {
                  throw err;
                }
              }
            } catch (innerErr) {
              throw innerErr;
            }
          } else {
            throw err;
          }
        }
      }
      if (input) input.value = "";
      // trigger a client event so bell updates if recipient is current user
      window.dispatchEvent(new CustomEvent("notifications:changed"));
      // non-blocking success feedback (avoid alert which blocks JS and can delay SSE delivery)
      setStatusMsg("Notificación enviada");
      setTimeout(() => setStatusMsg(null), 2500);
    } catch (err) {
      console.error(err);
      // non-blocking error feedback
      setStatusMsg("Error enviando notificación");
      setTimeout(() => setStatusMsg(null), 3500);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center space-x-2">
      <button onClick={handleSend} className="px-3 py-1 bg-green-500 text-white rounded" disabled={loading}>
        {loading ? "Enviando..." : "Enviar"}
      </button>
      {statusMsg && (
        <span className={`text-sm ${statusMsg.startsWith("Error") ? "text-rose-600" : "text-green-600"}`}>
          {statusMsg}
        </span>
      )}
    </div>
  );
};

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
  // minutes before event to receive desktop notification (null = disabled)
  calendarNotificationMinutes?: number | null;
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
    calendarNotificationMinutes: null,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExtraFieldsModalOpen, setIsExtraFieldsModalOpen] = useState(false);
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
  const [isDuplicateRfidModalOpen, setIsDuplicateRfidModalOpen] = useState(false);
  const [duplicateRfidValue, setDuplicateRfidValue] = useState<string | null>(null);
  const [isEmailExistsModalOpen, setIsEmailExistsModalOpen] = useState(false);
  const [emailExistsValue, setEmailExistsValue] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isDebugeoOpen, setIsDebugeoOpen] = useState(false);
  const [debugeoTarget, setDebugeoTarget] = useState<Profile | null>(null);
  const [availableFeatures, setAvailableFeatures] = useState<{ key: string; name: string }[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  useEffect(() => {
    fetchProfiles();
    // load available features from central module
    (async () => {
      try {
        const mod = await import("@/app/lib/featureFlags");
        const list = (mod.ALL_LINKS || []).map((l: any) => ({ key: l.feature, name: l.name }));
        setAvailableFeatures(list);
      } catch (e) {
        console.warn("Could not load feature flags", e);
      }
    })();
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
    // support number input for calendarNotificationMinutes
    if (name === "calendarNotificationMinutes") {
      const v = value === "" ? null : Number(value);
      setForm({ ...form, [name]: v as any });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const handleAddToList = (field: "rfids" | "calendarIds", value: string) => {
    const normalized = value?.toString().trim();
    if (!normalized) return;
    if (field === "rfids") {
      // Prevent duplicates for the same user
      const exists = form.rfids.some((r) => r.id === normalized);
      if (exists) {
        setDuplicateRfidValue(normalized);
        setIsDuplicateRfidModalOpen(true);
        return;
      }
      setForm({ ...form, rfids: [...form.rfids, { id: normalized, active: false }] });
    } else {
      // prevent duplicate calendar ids as well
      const exists = form.calendarIds.includes(normalized);
      if (exists) return;
      setForm({ ...form, calendarIds: [...form.calendarIds, normalized] });
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
      // If server indicates email already exists, show modal
      if (axios.isAxiosError(error) && error.response && error.response.status === 409) {
        setEmailExistsValue(form.email);
        setIsEmailExistsModalOpen(true);
        return;
      }
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
      calendarNotificationMinutes: (profile as any).calendarNotificationMinutes ?? null,
    });
    setEditingId(profile._id || null);
    setIsModalOpen(true);
  };

  const openFeaturesModal = (profileId: string) => {
    setSelectedProfileId(profileId);
    const profile = profiles.find((p) => p._id === profileId) as any;
    if (profile) {
      setSelectedFeatures(Array.isArray(profile.features) ? profile.features : []);
    } else {
      setSelectedFeatures([]);
    }
    setIsFeaturesModalOpen(true);
  };

  const closeFeaturesModal = () => {
    setSelectedProfileId(null);
    setSelectedFeatures([]);
    setIsFeaturesModalOpen(false);
  };

  const toggleFeature = (featureKey: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureKey) ? prev.filter((f) => f !== featureKey) : [...prev, featureKey]
    );
  };

  const saveFeatures = async () => {
    try {
      if (!selectedProfileId) return;
      const payload: any = { features: selectedFeatures };
      await axios.put(`/api/profiles/${selectedProfileId}`, payload);
      fetchProfiles();
      closeFeaturesModal();
    } catch (e) {
      console.error("Error saving features", e);
    }
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
    const profile = profiles.find((p) => p._id === profileId);
    if (profile) {
      setForm({
        name: profile.name || "",
        email: profile.email || "",
        password: "", // No cargar contraseña
        role: profile.role || "user",
        matricula: profile.matricula || "",
        carrera: profile.carrera || "",
        grupo: profile.grupo || "",
        rfids: profile.rfids || [],
        calendarIds: profile.calendarIds || [],
      });
    }
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
        console.log("Updating profile:", profileToUpdate);
        if (profileToUpdate) {
          // Merge previous profile data with updated rfids and calendarIds
          const updatedProfile = {
            ...profileToUpdate,
            rfids: form.rfids,
            calendarIds: form.calendarIds,
          };
          // Remove _id if present (MongoDB does not allow updating _id)
          const { _id, ...profileDataToSend } = updatedProfile;
          await axios.put(`/api/profiles/${selectedProfileId}`, profileDataToSend);
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
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openExtraFieldsModal(profile._id!)}
                    className="px-3 py-1 bg-blue-500 text-white rounded shadow hover:bg-blue-600 mr-2"
                  >
                    Agregar RFID y Calendarios
                  </button>
                  <button
                    onClick={() => openFeaturesModal(profile._id!)}
                    className="px-3 py-1 bg-purple-600 text-white rounded shadow hover:bg-purple-700 mr-2"
                  >
                    Editar Features
                  </button>
                  <button
                    onClick={() => handleEdit(profile)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600 mr-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(profile._id!)}
                    className="px-3 py-1 bg-red-500 text-white rounded shadow hover:bg-red-600 mr-2"
                  >
                    Eliminar
                  </button>
                </div>

                {/* Debugeo: opens modal with notification input, send and test actions */}
                <div className="mt-2">
                  <button
                    onClick={() => {
                      setDebugeoTarget(profile as Profile);
                      setIsDebugeoOpen(true);
                    }}
                    className="px-3 py-1 bg-gray-800 text-white rounded shadow hover:bg-gray-900"
                  >
                    Debugeo
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-600 to-sky-500">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 .88-.39 1.67-1 2.22M12 11c0-.88.39-1.67 1-2.22M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white text-lg font-bold">{editingId ? "Editar Perfil" : "Crear Perfil"}</h3>
                <p className="text-sky-100 text-sm">Rellena la información del usuario. El correo debe ser único.</p>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Nombre completo"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  placeholder="Correo electrónico"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
                  required
                />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleInputChange}
                  placeholder="Contraseña inicial"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Notificaciones (min antes)</label>
                    <input
                      type="number"
                      name="calendarNotificationMinutes"
                      value={form.calendarNotificationMinutes ?? ""}
                      onChange={handleInputChange}
                      placeholder="Ej: 10"
                      min={0}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Rol</label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    name="matricula"
                    value={form.matricula}
                    onChange={handleInputChange}
                    placeholder="Matrícula"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                  <input
                    type="text"
                    name="carrera"
                    value={form.carrera}
                    onChange={handleInputChange}
                    placeholder="Carrera"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                  <input
                    type="text"
                    name="grupo"
                    value={form.grupo}
                    onChange={handleInputChange}
                    placeholder="Grupo"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 bg-white border rounded-lg text-gray-700 hover:shadow"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-lg shadow hover:scale-[1.02] transition"
                  >
                    {editingId ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
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
      {isDebugeoOpen && debugeoTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-yellow-500 to-amber-400">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-black text-2xl font-bold">!</span>
              </div>
              <div>
                <h3 className="text-black text-lg font-bold">Debugeo — Notificaciones</h3>
                <p className="text-black text-sm">Enviar y probar notificaciones para <span className="font-semibold">{debugeoTarget.name}</span></p>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Texto de notificación"
                  className="w-full p-3 border rounded"
                  id={`notif-input-${debugeoTarget._id}`}
                />
                <div className="flex items-center space-x-2">
                  <SendButton email={debugeoTarget.email} name={debugeoTarget.name} id={debugeoTarget._id} />
                  <button
                    onClick={async () => {
                      try {
                        if (typeof Notification !== "undefined" && Notification.permission !== "granted") {
                          await Notification.requestPermission();
                        }
                        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
                          new Notification(`Prueba: ${debugeoTarget.name}`, { body: `Esta es una notificación de prueba para ${debugeoTarget.email}` });
                        } else {
                          alert("No se pudo mostrar la notificación. Permiso denegado o no soportado.");
                        }
                      } catch (e) {
                        console.error(e);
                        alert("Error mostrando notificación de prueba");
                      }
                    }}
                    className="px-3 py-1 bg-indigo-500 text-white rounded"
                  >
                    Probar notificación de escritorio
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setIsDebugeoOpen(false);
                    setDebugeoTarget(null);
                  }}
                  className="px-4 py-2 bg-white border rounded text-gray-700 hover:shadow"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isDuplicateRfidModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-rose-500 to-pink-500">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636L5.636 18.364M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="text-white text-lg font-bold">RFID ya registrado</h3>
                <p className="text-rose-100 text-sm">No puede agregarse porque ya existe en este usuario.</p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">El RFID <span className="font-mono bg-gray-100 px-2 py-1 rounded">{duplicateRfidValue}</span> ya está registrado para este usuario.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsDuplicateRfidModalOpen(false);
                    setDuplicateRfidValue(null);
                    // focus email input or first input in modal for quick correction
                    if (typeof document !== "undefined") {
                      const el = document.querySelector('input[name="email"]') as HTMLInputElement | null;
                      el?.focus();
                    }
                  }}
                  className="px-4 py-2 bg-white border rounded text-gray-700 hover:shadow"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    // Open extra fields modal to show the list where RFIDs are managed
                    setIsDuplicateRfidModalOpen(false);
                    setDuplicateRfidValue(null);
                    setIsExtraFieldsModalOpen(true);
                    // small UX: focus the rfid input inside extra modal after a tick
                    setTimeout(() => {
                      if (typeof document !== "undefined") {
                        const r = document.getElementById("rfidInput") as HTMLInputElement | null;
                        r?.focus();
                      }
                    }, 120);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded shadow hover:scale-[1.02] transition"
                >
                  Ver RFIDs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isEmailExistsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-600 to-sky-500">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v7" />
                </svg>
              </div>
              <div>
                <h3 className="text-white text-lg font-bold">Correo ya registrado</h3>
                <p className="text-sky-100 text-sm">No se puede crear otra cuenta con este correo.</p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">El correo <span className="font-mono bg-gray-100 px-2 py-1 rounded">{emailExistsValue}</span> ya está registrado en el sistema.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsEmailExistsModalOpen(false);
                    setEmailExistsValue(null);
                    // focus the email input so user can correct it
                    if (typeof document !== "undefined") {
                      const el = document.querySelector('input[name="email"]') as HTMLInputElement | null;
                      el?.focus();
                    }
                  }}
                  className="px-4 py-2 bg-white border rounded text-gray-700 hover:shadow"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    // Close modal and keep the form open for correction
                    setIsEmailExistsModalOpen(false);
                    // small UX: focus email after a tick
                    setTimeout(() => {
                      if (typeof document !== "undefined") {
                        const el = document.querySelector('input[name="email"]') as HTMLInputElement | null;
                        el?.focus();
                      }
                    }, 80);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded shadow hover:scale-[1.02] transition"
                >
                  Corregir email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isFeaturesModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editar Features</h2>
            <div className="space-y-2">
              {availableFeatures.map((f) => (
                <label key={f.key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedFeatures.includes(f.key)}
                    onChange={() => toggleFeature(f.key)}
                  />
                  <span>{f.name}</span>
                </label>
              ))}
            </div>
            <div className="flex space-x-4 mt-4">
              <button onClick={saveFeatures} className="px-6 py-3 bg-blue-500 text-white rounded">
                Guardar
              </button>
              <button onClick={closeFeaturesModal} className="px-6 py-3 bg-gray-500 text-white rounded">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrudProfiles;
