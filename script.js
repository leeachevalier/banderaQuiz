const bandera = document.getElementById("bandera");
const opcionesDiv = document.getElementById("opciones");
const resultado = document.getElementById("resultado");
const btnSiguiente = document.getElementById("siguiente");
const puntaje = document.getElementById("puntaje");
const regionSelect = document.getElementById("region");
const modoSelect = document.getElementById("modo");
const filtroRegion = document.getElementById("filtroRegion");
const leaderboard = document.getElementById("leaderboard");
const ranking = document.getElementById("ranking");

let paises = [];
let paisCorrecto = null;
let puntos = 0;
let modo = "libre";


let maxPuntajeLibre = parseInt(localStorage.getItem("maxLibre") || "0");


const record = document.createElement("p");
record.id = "record";
record.textContent = `Récord personal: ${maxPuntajeLibre}`;
puntaje.insertAdjacentElement("afterend", record);


modoSelect.addEventListener("change", () => {
  modo = modoSelect.value;
  puntos = 0;
  puntaje.textContent = "Puntos: 0";
  resultado.textContent = "";
  opcionesDiv.innerHTML = "";
  leaderboard.classList.add("oculto");

  if (modo === "libre") {
    filtroRegion.classList.remove("oculto");
    record.classList.remove("oculto");
    record.textContent = `Récord personal: ${maxPuntajeLibre}`;
    cargarPaises(regionSelect.value);
  } else {
    filtroRegion.classList.add("oculto");
    record.classList.add("oculto");
    cargarPaises("all");
  }
});


regionSelect.addEventListener("change", () => {
  puntos = 0;
  puntaje.textContent = "Puntos: 0";
  cargarPaises(regionSelect.value);
});


btnSiguiente.addEventListener("click", () => {
  nuevaPregunta();
});


function cargarPaises(region = "all") {
  const base = "https://restcountries.com/v3.1";
  const fields = "?fields=name,flags,translations,region";
  const url = region === "all"
    ? `${base}/all${fields}`
    : `${base}/region/${region}${fields}`;

  fetch(url)
    .then(res => {
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      return res.json();
    })
    .then(data => {
      if (!Array.isArray(data)) {
        console.error("Respuesta inválida:", data);
        return;
      }

      paises = data.filter(p => p.flags?.png && p.name?.common && p.translations?.spa?.common);
      if (paises.length < 4) {
        resultado.textContent = "❌ No hay suficientes países en esta región.";
        resultado.style.color = "salmon";
        return;
      }

      nuevaPregunta();
    })
    .catch(err => {
      console.error("Error al cargar países:", err);
      resultado.textContent = "❌ No se pudieron cargar los países.";
      resultado.style.color = "salmon";
    });
}


function nuevaPregunta() {
  resultado.textContent = "";
  opcionesDiv.innerHTML = "";

  paisCorrecto = paises[Math.floor(Math.random() * paises.length)];
  bandera.src = paisCorrecto.flags.png;

  const opciones = [paisCorrecto];
  while (opciones.length < 4) {
    const random = paises[Math.floor(Math.random() * paises.length)];
    if (!opciones.includes(random)) {
      opciones.push(random);
    }
  }

  opciones.sort(() => Math.random() - 0.5);

  opciones.forEach(pais => {
    const nombre = pais.translations?.spa?.common || pais.name.common;
    const btn = document.createElement("button");
    btn.textContent = nombre;
    btn.addEventListener("click", () => verificarRespuesta(pais));
    opcionesDiv.appendChild(btn);
  });
}


function verificarRespuesta(paisSeleccionado) {
  const correcta = paisCorrecto.translations?.spa?.common || paisCorrecto.name.common;
  const elegida = paisSeleccionado.translations?.spa?.common || paisSeleccionado.name.common;

  const botones = opcionesDiv.querySelectorAll("button");
  botones.forEach(btn => btn.disabled = true);

  if (correcta === elegida) {
    resultado.textContent = "¡Correcto!";
    resultado.style.color = "lightgreen";
    puntos += 1;
    puntaje.textContent = `Puntos: ${puntos}`;
  } else {
    resultado.textContent = `Incorrecto. Era: ${correcta}`;
    resultado.style.color = "salmon";

    if (modo === "challenge") {
      guardarEnLeaderboard();
    } else if (modo === "libre") {
      if (puntos > maxPuntajeLibre) {
        maxPuntajeLibre = puntos;
        localStorage.setItem("maxLibre", maxPuntajeLibre);
        record.textContent = ` Récord personal: ${maxPuntajeLibre}`;
      }

      puntos = 0;
      puntaje.textContent = `Puntos: 0`;
    }
  }
}


function guardarEnLeaderboard() {
  const nombre = prompt("¡Fallaste! Ingresá tu nombre para guardar tu puntaje:");
  if (!nombre) return;

  const entrada = { nombre, puntos };
  const guardados = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  guardados.push(entrada);

  guardados.sort((a, b) => b.puntos - a.puntos);
  localStorage.setItem("leaderboard", JSON.stringify(guardados.slice(0, 5)));

  mostrarLeaderboard();
}


function mostrarLeaderboard() {
  leaderboard.classList.remove("oculto");
  ranking.innerHTML = "";

  const datos = JSON.parse(localStorage.getItem("leaderboard") || "[]");

  datos.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.nombre} - ${entry.puntos} pts`;
    ranking.appendChild(li);
  });
}


cargarPaises("all");
