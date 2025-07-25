"use client";
import React, { useState, useEffect, useRef } from "react";
import UserIcon from "./user-icon";
import axios from "axios";
import { getCurrentUser } from "@/app/lib/userState";
import { el } from "date-fns/locale";

interface InfoUsuarioProps {
  userId?: string;
}

// Simulación de datos de usuario y sus IDs registrados
const currentUser = {
  nombre: "Juan Pérez",
  idsRegistrados: [
    { id: "123456", estado: "Desactivado" },
    { id: "789012", estado: "Activo" },
    { id: "345678", estado: "Activo" },
  ],
  matricula: "612266666",
  foto: "/user-placeholder.png", // Ruta de imagen por defecto
};

export function InfoUsuario({ userId }: InfoUsuarioProps) {
  const [showModal, setShowModal] = useState(false);
  const [foto, setFoto] = useState<string | null>(null); // Foto actual mostrada
  const [previewFoto, setPreviewFoto] = useState<string | null>(null); // Foto seleccionada en modal
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cargar la foto del localStorage solo en el cliente
  useEffect(() => {
    const fotoGuardada = localStorage.getItem("fotoPerfil");
    if (fotoGuardada) {
      setFoto(fotoGuardada);
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let url = "/api/profiles/me";
        let config = {};
        if (userId) {
          url = `/api/profiles/${userId}`;
        } else {
          // Si no hay id, intenta obtener el email del usuario local
          const localUser = getCurrentUser();
          if (localUser?.email) {
            config = { headers: { "x-user-email": localUser.email } };
          } else {
            console.log("No se proporcionó userId ni email local");
          }
        }
        const response = await axios.get(url, config);

        if (response.status === 401 || response.data?.error === "No autenticado") {
          // Si no está autenticado, usa el usuario local
          const localUser = getCurrentUser();
          if (localUser) {
            console.log("userData (local) --:", localUser);
            setProfile(localUser);
            setError(null);
          } else {
            setProfile(null);
            setError(
              "No has iniciado sesión. Por favor, inicia sesión para ver tu perfil."
            );
          }
        } else {
          console.log("userData (local) es!: ", response.data);
          setProfile(response.data || null);
          setError(null);
        }
      } catch (err: any) {
        // Si hay error, intenta mostrar el usuario local
        const localUser = getCurrentUser();
        if (localUser) {
          setProfile(localUser);
          setError(null);
        } else {
          setError("Error al obtener el perfil");
          setProfile(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPreviewFoto(ev.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleGuardarFoto = () => {
    if (previewFoto) {
      setFoto(previewFoto);
      localStorage.setItem("fotoPerfil", previewFoto);
      setShowModal(false);
      setPreviewFoto(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCancelarFoto = () => {
    setShowModal(false);
    setPreviewFoto(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Escuchar el evento 'userChanged' para actualizar automáticamente la información del usuario
  useEffect(() => {
    const handler = (e: any) => {
      const newUser = e.detail;
      if (newUser?._id !== profile?._id) {
        setProfile(null); // Reiniciar perfil para forzar recarga
        setLoading(true);
        setError(null);
      }
    };
    window.addEventListener("userChanged", handler);
    return () => {
      window.removeEventListener("userChanged", handler);
    };
  }, [profile?._id]);

  if (loading) return <div>Cargando información...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!profile) return <div>No se encontró información del usuario.</div>;

  return (
    <>
      {/* Información del usuario actual y foto */}
      <div className="flex items-center my-4 gap-6 w-full">
        <div className="flex flex-1 flex-row bg-[#f7f9fb] rounded-xl p-6 min-w-[320px] items-center shadow-sm relative overflow-visible">
          <div className="absolute right-10 -top-16">
            <div className="relative">
              {foto ? (
                <img
                  src={foto}
                  alt="Foto de perfil"
                  className="w-32 h-32 rounded-full object-cover border-2 border-gray-300 bg-white shadow"
                />
              ) : (
                <UserIcon className="w-32 h-32 text-gray-400 bg-white rounded-full border-2 border-gray-300 shadow p-4" />
              )}
              <button
                className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow hover:bg-blue-100 border border-blue-400"
                title="Cambiar foto"
                onClick={() => setShowModal(true)}
                type="button"
              >
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M15.232 5.232a3 3 0 1 1 4.243 4.243l-9.193 9.193a2 2 0 0 1-.878.515l-3.387.97a1 1 0 0 1-1.213-1.213l.97-3.387a2 2 0 0 1 .515-.878l9.193-9.193z"
                    stroke="#2563eb"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1 mt-8">
            <span className="font-bold text-lg text-black">Nombre:</span>
            <span className="text-base text-black mb-2">{profile?.name || "-"}</span>
            <span className="font-bold text-lg text-black">Email:</span>
            <span className="text-base text-black mb-2">
              {profile?.email || "-"}
            </span>
            <span className="font-bold text-lg text-black">Matricula:</span>
            <span className="text-base text-black">{profile?.matricula || "-"}</span>
            <span className="font-bold text-lg text-black">Carrera:</span>
            <span className="text-base text-black">{profile?.carrera || "-"}</span>
            <span className="font-bold text-lg text-black">Grupo:</span>
            <span className="text-base text-black">{profile?.grupo || "-"}</span>
          </div>
        </div>
      </div>

      {/* Modal para cambiar foto */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl p-8 shadow-2xl w-[340px] flex flex-col items-center">
            <h3 className="font-bold text-lg mb-4 text-black">
              Cambiar foto de perfil
            </h3>
            {previewFoto ? (
              <img
                src={previewFoto}
                alt="Foto actual"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 mb-4 bg-white shadow"
              />
            ) : foto ? (
              <img
                src={foto}
                alt="Foto actual"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 mb-4 bg-white shadow"
              />
            ) : (
              <UserIcon className="w-24 h-24 text-gray-400 bg-white rounded-full border-2 border-gray-300 shadow p-2 mb-4" />
            )}
            {/* Input de archivo personalizado */}
            <label className="mb-4 w-full flex flex-col items-center cursor-pointer">
              <span className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mb-2 text-base font-semibold shadow">
                Seleccionar archivo
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFotoChange}
                ref={fileInputRef}
              />
              <span className="text-xs text-gray-500">
                Formatos permitidos: JPG, PNG, etc.
              </span>
            </label>
            <div className="flex gap-2 mt-2">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                onClick={handleGuardarFoto}
                disabled={!previewFoto}
              >
                Guardar
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                onClick={handleCancelarFoto}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
                onClick={() => {
                  setFoto(null);
                  setPreviewFoto(null);
                  localStorage.removeItem("fotoPerfil");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                  setShowModal(false);
                }}
                type="button"
              >
                Borrar imagen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de RFIDs registrados */}
      <div className="my-4">
        <h2 className="font-bold text-lg mb-2 text-black">RFID Registrados</h2>
        <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden bg-white shadow">
          <thead>
            <tr className="bg-[#f7f9fb]">
              <th className="px-4 py-2 text-left text-gray-500 font-semibold">ID</th>
              <th className="px-4 py-2 text-left text-gray-500 font-semibold">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {profile?.rfids && profile.rfids.length > 0 ? (
              profile.rfids.map((rfid: any, idx: number) => (
                <tr key={rfid.id || idx}>
                  <td className="border-t border-gray-200 px-4 py-2 text-base">
                    {rfid.id}
                  </td>
                  <td className="border-t border-gray-200 px-4 py-2 text-base">
                    <span
                      className={
                        rfid.active
                          ? "ml-2 font-semibold text-green-600"
                          : "ml-2 font-semibold text-red-500"
                      }
                    >
                      {rfid.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={2}
                  className="border-t border-gray-200 px-4 py-2 text-base text-gray-500"
                >
                  No hay RFIDs registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
