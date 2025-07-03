"use client";
import { Metadata } from "next";
import { lusitana } from "@/app/ui/fonts";
import { CardEmpty } from '@/app/ui/dashboard/cards_empty';
import { useEffect, useState } from "react";
import { CardImage } from "@/app/ui/dashboard/cards_image";

// export const metadata: Metadata = {
//   title: 'Consultase',
// };

export default function Page() {
  const [homeroQuote, setHomeroQuote] = useState("Cargando...");
  const [chock_norris, setChuckNorris] = useState("Cargando...");
  const [pokemon, setPokemon] = useState("Cargando...");
  const [pokemonStats, setPokemonStats] = useState<string>("Cargando...");
  const [pokemonTypes, setPokemonTypes] = useState<string>("Cargando...");
  const [pokemonImg, setPokemonImg] = useState<string>("");

  const [dogUrl, setDogUrl] = useState<string>("");
  const [chuckImg, setChuckImg] = useState<string | null>(null);
  const [bromaType, setBromaType] = useState<string>("");
  const [bromaCategory, setBromaCategory] = useState<string>("");
  const [bromaImg, setBromaImg] = useState<string| null>(null);
  const [chuckCreatedAt, setChuckCreatedAt] = useState<string>("");
  const [chuckId, setChuckId] = useState<string>("");
  const [futuramaName, setFuturamaName] = useState("Cargando...");
  const [futuramaSpecies, setFuturamaSpecies] = useState("Cargando...");
  const [futuramaCreatedAt, setFuturamaCreatedAt] = useState("Cargando...");
  const [futuramaImg, setFuturamaImg] = useState("");

  useEffect(() => {
    fetch("https://v2.jokeapi.dev/joke/Any?lang=es")
      .then(res => res.json())
      .then(data => {
        if (data && data.joke) {
          setHomeroQuote(data.joke);
        } else if (data && data.setup && data.delivery) {
          setHomeroQuote(`${data.setup} ... ${data.delivery}`);
        } else {
          setHomeroQuote("No se encontró broma.");
        }
        if( data && data.type) {
          setBromaType(data.type);
        } else {
          setBromaType("Desconocido");
        }
        if( data && data.category) {
          setBromaCategory(data.category);
        } else {
          setBromaCategory("Desconocido");
        }
      })
      .catch(() => {
        setHomeroQuote("Error al obtener la broma.");
        setBromaImg("");
      });
  }, []);

 useEffect(() => {
  // Obtener una imagen aleatoria de Unsplash relacionada con "funny" (broma)
  fetch("https://picsum.photos/200/200")
    .then(response => {
      console.log(response);
      console.log(response.url);
      setBromaImg(response.url);
    })
    .catch(() => setBromaImg(""));
}, []);

  useEffect(() => {
    fetch("https://api.chucknorris.io/jokes/random")
      .then(res => res.json())
      .then(data => {
        if (data && data.value) {
          setChuckNorris(data.value);
        } else {
          setChuckNorris("No se encontró chiste.");
        }
        // Guardar fecha de creación del chiste
        if (data && data.created_at) {
          setChuckCreatedAt(data.created_at);
        } else {
          setChuckCreatedAt("Sin fecha");
        }

        if( data && data.id) {
          setChuckId(data.id);
        } else {
          setChuckId("Sin Id");
        }
        // La API de chucknorris.io siempre regresa la misma imagen, pero la obtenemos por fetch:
        if (data && data.icon_url) {
          setChuckImg(data.icon_url);
        } else {
          setChuckImg("");
        }
      })
      .catch(() => {
        setChuckNorris("Error al obtener chiste.");
        setChuckImg("");
        setChuckCreatedAt("Error");
      });
  }, []);

   useEffect(() => {
    // Obtener un Pokémon aleatorio entre 1 y 898 (Pokémon de la Pokédex Nacional)
    const randomId = Math.floor(Math.random() * 898) + 1;
    fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.id && data.name) {
          setPokemon(`#${data.id} - ${data.name.charAt(0).toUpperCase() + data.name.slice(1)}`);
          // Extraer stats y formatear como texto
          if (Array.isArray(data.stats)) {
            const statsText = data.stats
              .map((stat: any) => `${stat.stat.name}: ${stat.base_stat}`)
              .join(", ");
            setPokemonStats(statsText);
          } else {
            setPokemonStats("Sin stats");
          }
          // Extraer types y formatear como texto
          if (Array.isArray(data.types)) {
            const typesText = data.types
              .map((type: any) => type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1))
              .join(", ");
            setPokemonTypes(typesText);
          } else {
            setPokemonTypes("Sin tipos");
          }
          // Imagen del Pokémon
          if (data.sprites && data.sprites.front_default) {
            setPokemonImg(data.sprites.front_default);
          } else {
            setPokemonImg("");
          }
        } else {
          setPokemon("No se encontró Pokémon.");
          setPokemonStats("Sin stats");
          setPokemonTypes("Sin tipos");
          setPokemonImg("");
        }
      })
      .catch(() => {
        setPokemon("Error al obtener Pokémon.");
        setPokemonStats("Error al obtener stats");
        setPokemonTypes("Error al obtener tipos");
        setPokemonImg("");
      });
  }, []);

  useEffect(() => {
    fetch("https://dog.ceo/api/breeds/image/random")
      .then(res => res.json())
      .then(data => {
        if (data && data.status === "success" && data.message) {
          setDogUrl(data.message);
        } else {
          setDogUrl("");
        }
      })
      .catch(() => setDogUrl(""));
  }, []);

  useEffect(() => {
  // Generar un seed aleatorio para el icono
  const randomSeed = Math.floor(Math.random() * 10000);
  fetch(`https://api.dicebear.com/7.x/icons/svg?seed=${randomSeed}`)
    .then(response => {
      // La API de Dicebear regresa el SVG directamente, así que usamos la URL
      setBromaImg(response.url);
    })
    .catch(() => setBromaImg(""));
}, []);

  useEffect(() => {
    // Obtener un personaje aleatorio de Futurama (del 1 al 100)
    const randomId = Math.floor(Math.random() * 50) + 1;
    fetch(`https://futuramaapi.com/api/characters/${randomId}`)
      .then(res => res.json())
      .then(data => {
        console.log(data);
        if (data) {
          setFuturamaName(data.name || "Sin nombre");
          setFuturamaSpecies(data.species || "Sin especie");
          setFuturamaCreatedAt(data.createdAt || "Sin fecha");
          setFuturamaImg(data.image || "");
        } else {
          setFuturamaName("No encontrado");
          setFuturamaSpecies("No encontrado");
          setFuturamaCreatedAt("No encontrado");
          setFuturamaImg("");
        }
      })
      .catch(() => {
        setFuturamaName("Error");
        setFuturamaSpecies("Error");
        setFuturamaCreatedAt("Error");
        setFuturamaImg("");
      });
  }, []);

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        APIs Consultadas
      </h1>

      {/* CHUCK NORRIS */}
      <div className="mb-10">
        <h2 className="text-lg font-bold mb-2">Chuck Norris</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardEmpty title="Chiste" value={chock_norris} type="collected" />
          <CardEmpty title="Creado en" value={chuckCreatedAt} type="pending" />
          <CardEmpty title="ID:" value={chuckId} type="invoices" />
          <CardImage title="Imagen" value={chuckImg} type="customers" />
        </div>
      </div>

      {/* POKEMON */}
      <div className="mb-10">
        <h2 className="text-lg font-bold mb-2">Pokémon</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardEmpty title="Pokémon" value={pokemon} type="collected" />
          <CardEmpty title="Types" value={pokemonTypes} type="pending" />
          <CardEmpty title="Stats" value={pokemonStats} type="invoices" />
          <CardImage title="Imagen" value={pokemonImg} type="customers" />
        </div>
      </div>

      {/* DOG */}
      <div className="mb-10">
        <h2 className="text-lg font-bold mb-2">Dog</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardEmpty title="Raza" value={dogUrl.split('/')[4] ? dogUrl.split('/')[4] : "Desconocida"} type="collected" />
          <CardEmpty title="Fuente" value="dog.ceo" type="pending" />
          <CardEmpty title="Estado" value={dogUrl ? "Cargada" : "Cargando..."} type="invoices" />
          <CardImage title="Imagen" value={dogUrl} type="customers" />
        </div>
      </div>

      {/* FUTURAMA */}
      <div className="mb-10">
        <h2 className="text-lg font-bold mb-2">Futurama</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardEmpty title="Name" value={futuramaName} type="collected" />
          <CardEmpty title="Species" value={futuramaSpecies} type="pending" />
          <CardEmpty title="Created At" value={futuramaCreatedAt} type="invoices" />
          <CardImage title="Image" value={futuramaImg} type="customers" />
        </div>
      </div>

      
      {/* BROMA */}
      <div className="mb-10">
        <h2 className="text-lg font-bold mb-2">Broma</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardEmpty title="Broma" value={homeroQuote} type="collected" />
          <CardEmpty title="Tipo" value={bromaType} type="pending" />
          <CardEmpty title="Idioma" value={bromaCategory} type="invoices" />
          <CardImage title="Imagen" value={bromaImg} type="customers" skipCheck = {true} />
        </div>
      </div>

    </main>
  );
}
