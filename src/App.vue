<template>
  <div class="app-container">
    <!-- Fondo -->
    <img id="fondo" src="/grafs/w12.jpg" alt="fondo" />

    <!-- Panel Superior -->
        <div id="panelSuperior">
          <span>Intervalos armónicos en:</span>
          <div id="selector-tonalidad">
            <select v-model="nombreTonicaActual" id="tonica">
              <option v-for="tono in diccionarioTonos[tipoEscalaActual === 'mayor' ? 'Mayores' : 'Menores']" :key="tono.id" :value="tono.nombre">
                {{ tono.nombre }}
              </option>
            </select>
            <select v-model="tipoEscalaActual" id="tipo-escala">
              <option value="mayor">Mayor</option>
              <option value="menor armónica" disabled>Menor Armónica</option>
            </select>
          </div>
        </div>

    <!-- Panel Izquierdo -->
    <div id="panelIzquierdo">
      <div id="selector">Intervalos simples armónicos</div>
      <p id="instrucciones">{{ textoInstruccion }}</p>
      
      <!-- Selectores de Categoría e Intervalos organizados por filas -->
      <div class="selector-grid">
        <!-- Fila J -->
        <div class="fila-intervalos">
          <button class="categ" :class="{ active: estaCategoriaActiva('J') }" @click="handleCategoriaClick('J')">J</button>
          <div class="botones-fila">
            <template v-for="item in getIntervalosAgrupadosPorCategoria('J')" :key="item.tipo === 'single' ? item.data.id : item.idGrupo">
              <button v-if="item.tipo === 'single'" class="intervalo-btn" :class="{ active: seleccionados.includes(item.data.id) }" @click="toggleIntervalo(item.data)">{{ item.data.nombreCorto }}</button>
              <div v-else class="btn-grupo" :class="{ active: isGrupoActive(item.idGrupo) }">
                <button class="intervalo-btn btn-numero" :class="{ active: isGenericActive(item.idGrupo) }" @click="handleGenericClick(item)">{{ item.idGrupo }}</button>
                <div class="btn-calidad">
                  <button v-for="m in item.miembros" :key="m.id" class="btn-calidad-btn" :class="{ active: seleccionados.includes(m.id) }" @click="toggleIntervalo(m)">{{ m.nombreCorto.replace(item.idGrupo, '') }}</button>
                </div>
              </div>
            </template>
          </div>
        </div>
        
        <!-- Fila C -->
        <div class="fila-intervalos">
          <button class="categ" :class="{ active: estaCategoriaActiva('C') }" @click="handleCategoriaClick('C')">C</button>
          <div class="botones-fila">
            <template v-for="item in getIntervalosAgrupadosPorCategoria('C')" :key="item.tipo === 'single' ? item.data.id : item.idGrupo">
              <button v-if="item.tipo === 'single'" class="intervalo-btn" :class="{ active: seleccionados.includes(item.data.id) }" @click="toggleIntervalo(item.data)">{{ item.data.nombreCorto }}</button>
              <div v-else class="btn-grupo" :class="{ active: isGrupoActive(item.idGrupo) }">
                <button class="intervalo-btn btn-numero" :class="{ active: isGenericActive(item.idGrupo) }" @click="handleGenericClick(item)">{{ item.idGrupo }}</button>
                <div class="btn-calidad">
                  <button v-for="m in item.miembros" :key="m.id" class="btn-calidad-btn" :class="{ active: seleccionados.includes(m.id) }" @click="toggleIntervalo(m)">{{ m.nombreCorto.replace(item.idGrupo, '') }}</button>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Fila D -->
        <div class="fila-intervalos">
          <button class="categ" :class="{ active: estaCategoriaActiva('D') }" @click="handleCategoriaClick('D')">D</button>
          <div class="botones-fila">
            <template v-for="item in getIntervalosAgrupadosPorCategoria('D')" :key="item.tipo === 'single' ? item.data.id : item.idGrupo">
              <button v-if="item.tipo === 'single'" class="intervalo-btn" :class="{ active: seleccionados.includes(item.data.id) }" @click="toggleIntervalo(item.data)">{{ item.data.nombreCorto }}</button>
              <div v-else class="btn-grupo" :class="{ active: isGrupoActive(item.idGrupo) }">
                <button class="intervalo-btn btn-numero" :class="{ active: isGenericActive(item.idGrupo) }" @click="handleGenericClick(item)">{{ item.idGrupo }}</button>
                <div class="btn-calidad">
                  <button v-for="m in item.miembros" :key="m.id" class="btn-calidad-btn" :class="{ active: seleccionados.includes(m.id) }" @click="toggleIntervalo(m)">{{ m.nombreCorto.replace(item.idGrupo, '') }}</button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Respuesta y Checkmark -->
      <div id="respuesta">
        <span id="respuesta-texto">{{ respuestaTexto }}</span>
        <img v-if="mostrarCheck" id="checkmark" :src="checkmarkImg" :style="{ transform: checkmarkScale }" class="fade-in" />
      </div>
      <!-- Panel Derecho (Controles) -->
      <div id="panelDerecho">
        <p id="textoI" v-if="mostrarTextoI" class="fade-in">No hay intervalos seleccionados. Por favor, antes de entrar seleccione los intervalos que desea trabajar.</p>
        
       <button v-if="estado === 'tocar' && modo" id="play-stop-btn" @click="togglePlayStop" @mouseup="respuestaTexto = '¿Cuál intervalo sonó?'">
        <!-- Ícono SVG de Play (triángulo) -->
        <svg v-if="!isPlaying" width="32" height="32" viewBox="0 0 24 24" fill="white">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <!-- Ícono SVG de Stop (cuadrado) -->
        <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="white">
          <path d="M6 6h12v12H6z"/>
        </svg>
      </button>
        
        <button id="entrar" @click="alternarEstado">
          {{ estado === 'selector' ? 'ENTRAR' : 'SELECCIONAR' }}
        </button>

        <button v-if="estado === 'tocar' && modo === 'discreto'" class="control" id="repetir" @click="repetirIntervalo">REPETIR</button>
        
        <button v-if="estado === 'tocar'" class="modo" :class="{ active: modo === 'discreto' }" @click="cambiarModo('discreto')">Modo Discreto</button>
        <button v-if="estado === 'tocar'" class="modo" :class="{ active: modo === 'continuum' }" @click="cambiarModo('continuum')">Modo Continuum</button>
      </div>
    </div>

    <div id="reloj">{{ reloj }}</div>
    
  </div>
</template>

<script setup>

import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// ==================== MOTOR TEÓRICO (TU LÓGICA) ====================
const estructurasEscalas = {
  'mayor': [0, 2, 4, 5, 7, 9, 11],
  'menor armónica': [0, 2, 3, 5, 7, 8, 11],
}
const diccionarioTonos = {
  'Mayores': [
    { id: 1, nombre: 'Do' }, { id: 2, nombre: 'Sol' }, { id: 3, nombre: 'Re' },
    { id: 4, nombre: 'La' }, { id: 5, nombre: 'Mi' }, { id: 6, nombre: 'Si/Dob' },
    { id: 7, nombre: 'Fa#/Solb' }, { id: 8, nombre: 'Do#/Reb' }, { id: 9, nombre: 'Lab' },
    { id: 10, nombre: 'Mib' }, { id: 11, nombre: 'Sib' }, { id: 12, nombre: 'Fa' }
  ],
  'Menores': [
    { id: 1, nombre: 'la' }, { id: 2, nombre: 'mi' }, { id: 3, nombre: 'si' },
    { id: 4, nombre: 'fa#' }, { id: 5, nombre: 'do#' }, { id: 6, nombre: 'sol#/lab' },
    { id: 7, nombre: 're#/mib' }, { id: 8, nombre: 'la#/sib' }, { id: 9, nombre: 'fa' },
    { id: 10, nombre: 'do' }, { id: 11, nombre: 'sol' }, { id: 12, nombre: 're' }
  ]
}
const nombresDeNotas = ['FAb','DOb','SOLb','REb','LAb','MIb','SIb','FA','DO','SOL','RE','LA','MI','SI','FA#','DO#','SOL#','RE#','LA#','MI#','SI#']
const ordenNombresNotas = [1,3,5,0,2,4,6]

const getNombresEscala = (nombreTonica) => {
  const rootIdx = nombresDeNotas.findIndex(n => n.toUpperCase() === nombreTonica.toUpperCase())
  if (rootIdx === -1) return []
  const startIdx = (rootIdx - 1 + 21) % 21
  const slice7 = []
  for(let i=0; i<7; i++) slice7.push(nombresDeNotas[(startIdx + i) % 21])
  const escalaOrdenada = []
  ordenNombresNotas.forEach(idx => escalaOrdenada.push(slice7[idx]))
  return escalaOrdenada
}

// ==================== DEFINICIONES DE INTERFAZ Y RANGO ====================
const MIDI_MIN = 48 // Do3
const MIDI_MAX = 81 // La5

const botonesIntervalo = [
  { id: 'unisono', nombreCorto: 'U', cat: 'J', grupo: null, semitonos: 0 },
  { id: '4J', nombreCorto: '4', cat: 'J', grupo: null, semitonos: 5 },
  { id: '5J', nombreCorto: '5', cat: 'J', grupo: null, semitonos: 7 },
  { id: '8va', nombreCorto: '8', cat: 'J', grupo: null, semitonos: 12 },
  { id: '3m', nombreCorto: '3m', cat: 'C', grupo: '3', semitonos: 3 },
  { id: '3M', nombreCorto: '3M', cat: 'C', grupo: '3', semitonos: 4 },
  { id: '6m', nombreCorto: '6m', cat: 'C', grupo: '6', semitonos: 8 },
  { id: '6M', nombreCorto: '6M', cat: 'C', grupo: '6', semitonos: 9 },
  { id: '2m', nombreCorto: '2m', cat: 'D', grupo: '2', semitonos: 1 },
  { id: '2M', nombreCorto: '2M', cat: 'D', grupo: '2', semitonos: 2 },
  { id: 'tritono', nombreCorto: 'T', cat: 'D', grupo: null, semitonos: 6 },
  { id: '7m', nombreCorto: '7m', cat: 'D', grupo: '7', semitonos: 10 },
  { id: '7M', nombreCorto: '7M', cat: 'D', grupo: '7', semitonos: 11 }
]

// ==================== ESTADO REACTIVO ====================
const estado = ref('selector')
const modo = ref('')
const seleccionados = ref([])
const respuestaTexto = ref('')
const mostrarTextoI = ref(false)
const mostrarCheck = ref(false)
const checkmarkImg = ref('/grafs/acierto.png')
const checkmarkScale = ref('scale(1.0)')
const reloj = ref('')
const textoInstruccion = ref('')
const datosInterv = ref({ lista: -1, item: -1, nombre: '', id: '', grupo: null, cat: null })
const jugando = ref(false)
const isPlaying = ref(false)
let intervaloContinuum = null
let catRespuestaTemp = null
// ==================== SISTEMA DE BOLSAS DE INTERVALOS ====================
let bolsasIntervalos = {}      // Objeto: { '3M': [ {midi1, midi2...}, ... ], '4J': [...] }
let listaBolsasActivas = []   // Arreglo de nombres de bolsas restantes en la ronda actual
let ultimoIntervaloTocado = null // Guarda el último objeto para el botón "Repetir"

// Llena las bolsas basándose en lo que el usuario seleccionó en la interfaz
const llenarBolsas = () => {
  bolsasIntervalos = {}
  const idsActivos = new Set()

  // 1. Averiguar qué IDs de botones están seleccionados (ej: '3M', '3_gen')
  seleccionados.value.forEach(id => {
    if (id.endsWith('_gen')) {
      // Si es genérico (ej: 3_gen), activamos sus dos hijos (3m y 3M)
      const grupo = id.replace('_gen', '')
      botonesIntervalo.filter(b => b.grupo === grupo).forEach(b => idsActivos.add(b.id))
    } else {
      idsActivos.add(id)
    }
  })

  // 2. Llenar cada bolsa sacando los intervalos del Mapa Diatónico
  idsActivos.forEach(id => {
    // Hacemos una copia del mapa para no destruir los datos originales
    bolsasIntervalos[id] = mapaIntervalosEscala
      .filter(i => i.tipo === id)
      .map(i => ({...i})) 
  })

  // 3. Preparar la lista de bolsas para esta ronda
  reiniciarListaBolsas()
}

// Vuelve a armar la lista de bolsas con las que vamos a jugar en este ciclo
const reiniciarListaBolsas = () => {
  // Filtramos por si acaso alguna bolsa se quedó vacía
  listaBolsasActivas = Object.keys(bolsasIntervalos).filter(id => bolsasIntervalos[id].length > 0)
}

// Elige el siguiente intervalo usando tu lógica de extracción
const seleccionarIntervaloDeBolsas = () => {
  // Si nos quedamos sin bolsas en la ronda actual, reiniciamos la ronda
  if (listaBolsasActivas.length === 0) {
    reiniciarListaBolsas()
  }

  // Seguridad por si no hay nada seleccionado
  if (listaBolsasActivas.length === 0) return null

  // 1. Tomar una bolsa al azar y RETIRARLA de la lista temporal
  const idxBolsa = aleatorio(0, listaBolsasActivas.length - 1)
  const idBolsaElegida = listaBolsasActivas[idxBolsa]
  listaBolsasActivas.splice(idxBolsa, 1)

  // 2. Sacar un intervalo al azar de esa bolsa y ELIMINARLO de la bolsa
  const bolsa = bolsasIntervalos[idBolsaElegida]
  const idxIntervalo = aleatorio(0, bolsa.length - 1)
  const intervaloElegido = bolsa[idxIntervalo]
  bolsa.splice(idxIntervalo, 1)

  // 3. Si la bolsa se quedó vacía, volver a llenar esa bolsa específica
  if (bolsa.length === 0) {
    bolsasIntervalos[idBolsaElegida] = mapaIntervalosEscala
      .filter(i => i.tipo === idBolsaElegida)
      .map(i => ({...i}))
  }

  return intervaloElegido
}

// --- Configuración Tonalidad ---
const tipoEscalaActual = ref('mayor')
const nombreTonicaActual = ref('Do')
const octavaActual = ref('4')

const midiRaiz = computed(() => {
  const notasMidiBase = { 'Do': 60, 'Re': 62, 'Mi': 64, 'Fa': 65, 'Sol': 67, 'La': 69, 'Si': 71 }
  let notaBase = nombreTonicaActual.value.replace('#', '').replace('b', '').split('/')[0]
  let midiBase = notasMidiBase[notaBase] || 60
  const offsetOctava = (parseInt(octavaActual.value) - 4) * 12
  return midiBase + offsetOctava
})

// ==================== MOTOR MAPA DIATÓNICO ====================
let mapaIntervalosEscala = []

const generarMapaDiatonico = () => {
  mapaIntervalosEscala = []
  const estructura = estructurasEscalas[tipoEscalaActual.value]
  const nombres = getNombresEscala(nombreTonicaActual.value)

  const notasEnRango = []
  for (let midi = MIDI_MIN; midi <= MIDI_MAX; midi++) {
    const claseDeAltura = ((midi - midiRaiz.value) % 12 + 12) % 12
    const indiceGrado = estructura.indexOf(claseDeAltura)
    if (indiceGrado !== -1) {
      const saltoOctavas = Math.floor((midi - midiRaiz.value) / 12)
      const indiceNombre = ((indiceGrado + saltoOctavas) % 7 + 7) % 7
      notasEnRango.push({ midi: midi, nombre: nombres[indiceNombre] })
    }
  }

  for (let i = 0; i < notasEnRango.length; i++) {
    for (let j = i; j < notasEnRango.length; j++) {
      const nota1 = notasEnRango[i]
      const nota2 = notasEnRango[j]
      const distancia = nota2.midi - nota1.midi
      const defIntervalo = botonesIntervalo.find(b => b.semitonos === distancia)
      
      if (defIntervalo) {
        mapaIntervalosEscala.push({
          tipo: defIntervalo.id, nombre: defIntervalo.nombreCorto, grupo: defIntervalo.grupo, cat: defIntervalo.cat,
          midi1: nota1.midi, midi2: nota2.midi, textoRespuesta: `${nota1.nombre} - ${nota2.nombre}`
        })
      }
    }
  }
}

// ==================== LÓGICA DE SELECCIÓN (ESTRICTA: 2 ESTADOS) ====================
const isGenericActive = (grupoId) => seleccionados.value.includes(grupoId + '_gen')
const isGrupoActive = (grupoId) => isGenericActive(grupoId) || botonesIntervalo.some(i => i.grupo === grupoId && seleccionados.value.includes(i.id))

const toggleGenerico = (grupo) => {
  const genId = grupo.idGrupo + '_gen'
  const miembrosIds = botonesIntervalo.filter(b => b.grupo === grupo.idGrupo).map(b => b.id)
  const isActive = seleccionados.value.includes(genId)

  if (isActive) {
    // REGLA INVERSA: Si el número estaba activo, apagamos TODO (número, 'm' y 'M')
    seleccionados.value = seleccionados.value.filter(id => id !== genId && !miembrosIds.includes(id))
  } else {
    // TU REGLA 1: Si pulso el número, se activan tanto 'm' como 'M' (y el número)
    if (!seleccionados.value.includes(genId)) seleccionados.value.push(genId)
    miembrosIds.forEach(id => {
      if (!seleccionados.value.includes(id)) seleccionados.value.push(id)
    })
  }
}

const toggleSubIntervalo = (intervalo) => {
  const genId = intervalo.grupo + '_gen'
  const otro = botonesIntervalo.find(i => i.grupo === intervalo.grupo && i.id !== intervalo.id)
  const otroId = otro ? otro.id : null
  
  const isSelfActive = seleccionados.value.includes(intervalo.id)
  const isOtherActive = otroId ? seleccionados.value.includes(otroId) : false

  if (isSelfActive) {
    // Estamos apagando la letra pulsada
    seleccionados.value = seleccionados.value.filter(id => id !== intervalo.id)
    
    if (!isOtherActive) {
      // TU REGLA 3: Si apagué 'm' y 'M' ya estaba apagado, apago también el número
      seleccionados.value = seleccionados.value.filter(id => id !== genId)
    } else {
      // TU REGLA 2: Si apagué 'M' pero 'm' sigue encendido, el número SE QUEDA encendido (no hago nada extra)
    }
  } else {
    // Estamos encendiendo la letra pulsada
    if (!seleccionados.value.includes(intervalo.id)) seleccionados.value.push(intervalo.id)
    
    // TU REGLA 1 y 4: Encender una letra SIEMPRE enciende el número (si no lo estaba)
    if (!seleccionados.value.includes(genId)) seleccionados.value.push(genId)
  }
}

const toggleIntervalo = (intervalo) => {
  if (estado.value === 'selector') {
    if (intervalo.grupo) toggleSubIntervalo(intervalo)
    else {
      const index = seleccionados.value.indexOf(intervalo.id)
      if (index > -1) seleccionados.value.splice(index, 1)
      else seleccionados.value.push(intervalo.id)
    }
  } else if (estado.value === 'tocar' && modo.value) {
    respuestaTexto.value = intervalo.nombreCorto
    evaluar()
  }
}
// --- DESBLOQUEO MÓVIL (Aporte del usuario: AudioSession + Click Global) ---
if (navigator.audioSession) {
  navigator.audioSession.type = "playback";
}

document.addEventListener('click', () => {
  // En lugar de repetir el código del buffer, llamamos a nuestra función segura.
  // Esto crea el contexto si no existe, y dispara el buffer silenciosointerno.
  getAudioContext() 
}, { once: true });

const handleGenericClick = (grupo) => {
  if (estado.value === 'tocar') {
    // Enviamos la abreviatura base del botón
    let respuesta = grupo.idGrupo
    if (respuesta === 'unisono') respuesta = 'U'
    if (respuesta === '8va') respuesta = '8'
    
    respuestaTexto.value = respuesta
    evaluar()
  } else if (estado.value === 'selector') {
    toggleGenerico(grupo)
  }
}

// Funciones para renderizar el HTML (AHORA APUNTAN A botonesIntervalo)
const getIntervalosPorCategoria = (cat) => botonesIntervalo.filter(i => i.cat === cat)

const getIntervalosAgrupadosPorCategoria = (cat) => {
  const ints = getIntervalosPorCategoria(cat)
  const resultado = []
  const gruposVistos = new Set()
  for (const int of ints) {
    if (int.grupo) {
      if (!gruposVistos.has(int.grupo)) {
        gruposVistos.add(int.grupo)
        resultado.push({ tipo: 'grupo', idGrupo: int.grupo, miembros: ints.filter(i => i.grupo === int.grupo) })
      }
    } else {
      resultado.push({ tipo: 'single', data: int })
    }
  }
  return resultado
}

const estaCategoriaActiva = (cat) => {
  // 1. Sacamos TODOS los IDs que componen esta categoría (números, 'm', 'M')
  const idsEnCategoria = botonesIntervalo
    .filter(i => i.cat === cat)
    .flatMap(i => {
      if (i.grupo) {
        // Si es un grupo (ej: 3), devolvos el número genérico ('3_gen') y las letras ('3m', '3M')
        return [i.grupo + '_gen', i.id]
      } else {
        // Si es simple (ej: U, 4, 5), devuelvo solo su ID
        return [i.id]
      }
    })

  // 2. La categoría brilla si AL MENOS UNO de esos IDs está seleccionado
  return idsEnCategoria.some(id => seleccionados.value.includes(id))
}

const toggleCategoria = (cat) => {
  if (estado.value !== 'selector') return
  
  const gruposDeCat = [...new Set(botonesIntervalo.filter(i => i.cat === cat && i.grupo).map(i => i.grupo))]
  const singlesDeCat = botonesIntervalo.filter(i => i.cat === cat && !i.grupo)
  
  if (estaCategoriaActiva(cat)) {
    // DESELECCIONAR TODO: Apagamos números, 'm' y 'M' de esta categoría
    const idsARemover = new Set()
    
    singlesDeCat.forEach(s => idsARemover.add(s.id))
    
    gruposDeCat.forEach(g => {
      idsARemover.add(g + '_gen') // Apaga el número
      botonesIntervalo.filter(b => b.grupo === g).forEach(b => {
        idsARemover.add(b.id) // Apaga la 'm' y la 'M'
      })
    })
    
    seleccionados.value = seleccionados.value.filter(id => !idsARemover.has(id))
    
  } else {
    // SELECCIONAR TODO: Encendemos números, 'm' y 'M' de esta categoría
    const idsAAgregar = new Set()
    
    singlesDeCat.forEach(s => { if (!seleccionados.value.includes(s.id)) idsAAgregar.add(s.id) })
    
    gruposDeCat.forEach(g => {
      const genId = g + '_gen'
      if (!seleccionados.value.includes(genId)) idsAAgregar.add(genId) // Enciende el número
      
      botonesIntervalo.filter(b => b.grupo === g).forEach(b => {
        if (!seleccionados.value.includes(b.id)) idsAAgregar.add(b.id) // Enciende 'm' y 'M'
      })
    })
    
    seleccionados.value.push(...idsAAgregar)
  }
}

const handleCategoriaClick = (cat) => {
  if (estado.value === 'tocar' && modo.value) {
    catRespuestaTemp = cat // Guardamos la letra 'C', 'J' o 'D' directamente
    // Mostramos la palabra en la pantalla solo para que el usuario la lea
    respuestaTexto.value = cat === 'J' ? 'Justo' : (cat === 'C' ? 'Consonante' : 'Disonante')
    evaluar()
  } else if (estado.value === 'selector') {
    toggleCategoria(cat)
  }
}

// ==================== LÓGICA DE JUEGO ====================
const getIntervalosParaJugar = () => {
  const pool = []
  for (const id of seleccionados.value) {
    if (id.endsWith('_gen')) {
      const grupoId = id.replace('_gen', '')
      mapaIntervalosEscala.filter(i => i.grupo === grupoId).forEach(i => {
        if (!pool.find(p => p.textoRespuesta === i.textoRespuesta)) pool.push(i)
      })
    } else {
      mapaIntervalosEscala.filter(i => i.tipo === id).forEach(i => {
        if (!pool.find(p => p.textoRespuesta === i.textoRespuesta)) pool.push(i)
      })
    }
  }
  return pool
}

const llenarMatriz = () => {
  poolDeJuego = getIntervalosParaJugar()
  matrizInterv.value = poolDeJuego.map(() => [0,1,2,3,4,5,6,7,8,9,10,11,12])
}

const aleatorio = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
const seleccionaItem = (lista) => {
  if (lista.length === 0) return null
  const g = aleatorio(0, lista.length - 1)
  const item = lista[g]; lista.splice(g, 1); return item
}

const selectArchivo = () => {
  mostrarCheck.value = false; respuestaTexto.value = ''
  
  const objetoIntervalo = seleccionarIntervaloDeBolsas()
  
  if (objetoIntervalo) {
    ultimoIntervaloTocado = objetoIntervalo // Lo guardamos por si el usuario pulsa "Repetir"
    tocaIntervalo(objetoIntervalo)
    
    // Guardamos los datos para la evaluación (ya no usamos índices de matriz)
    datosInterv.value = { 
      lista: 0, 
      item: 0, 
      nombre: objetoIntervalo.nombre, 
      id: objetoIntervalo.tipo, 
      grupo: objetoIntervalo.grupo, 
      cat: objetoIntervalo.cat 
    }
  }
}

const repetirIntervalo = () => {
  // Simplemente tocamos el último objeto guardado
  if (ultimoIntervaloTocado) tocaIntervalo(ultimoIntervaloTocado)
}

// ==================== MOTOR WEB AUDIO API ====================
let audioCtx = null
let masterGain = null
let calentado = false // <-- LA BANDERA MÁGICA

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    
    // Mantenemos el control maestro que creamos antes para el botón Stop
    masterGain = audioCtx.createGain()
    masterGain.gain.setValueAtTime(1.0, audioCtx.currentTime)
    masterGain.connect(audioCtx.destination)
  }
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  
  // ---> INICIO DEL SECRETO EXTRAÍDO DE TU OTRA APP <---
  if (!calentado) {
    calentado = true
    // Creamos un buffer (espacio en RAM) de 1 muestra, es decir, 1 milisegundo de silencio total
    const bufferSilencio = audioCtx.createBuffer(1, 1, audioCtx.sampleRate)
    const fuenteSilencio = audioCtx.createBufferSource()
    fuenteSilencio.buffer = bufferSilencio
    // Lo conectamos directamente a la salida para que el móvil escuche "algo" y desbloquee el hardware
    fuenteSilencio.connect(audioCtx.destination)
    fuenteSilencio.start()
  }
  // ---> FIN DEL SECRETO <---

  return audioCtx
}

const midiToFrecuencia = (midi) => 440 * Math.pow(2, (midi - 69) / 12)

const tocarIntervaloSintetizado = (midi1, midi2) => {
  const ctx = getAudioContext() // Al llamar esto, se desbloquea solo si hace falta
  const ahora = ctx.currentTime
  const duracion = 2.5
  
  // Nota 1
  const freq1 = midiToFrecuencia(midi1)
  const osc1 = ctx.createOscillator(); const gain1 = ctx.createGain()
  osc1.type = 'triangle'; osc1.frequency.setValueAtTime(freq1, ahora)
  gain1.gain.setValueAtTime(0.4, ahora); gain1.gain.exponentialRampToValueAtTime(0.01, ahora + duracion)
  osc1.connect(gain1).connect(masterGain) // <--- AHORA SE CONECTA AL MASTER, NO AL DESTINO
  osc1.start(ahora); osc1.stop(ahora + duracion)

  // Nota 2
  const freq2 = midiToFrecuencia(midi2)
  const osc2 = ctx.createOscillator(); const gain2 = ctx.createGain()
  osc2.type = 'triangle'; osc2.frequency.setValueAtTime(freq2, ahora)
  gain2.gain.setValueAtTime(0.4, ahora); gain2.gain.exponentialRampToValueAtTime(0.01, ahora + duracion)
  osc2.connect(gain2).connect(masterGain) // <--- AHORA SE CONECTA AL MASTER, NO AL DESTINO
  osc2.start(ahora); osc2.stop(ahora + duracion)
  
  isPlaying.value = true
  setTimeout(() => isPlaying.value = false, duracion * 1000)
}

const tocaIntervalo = (objeto) => {
  if (objeto) tocarIntervaloSintetizado(objeto.midi1, objeto.midi2)
}

const detenerAudio = () => {
  // NUEVA FORMA DE HACER STOP: Bajamos el volumen maestro a 0 instantáneamente
  if (masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime)
    // Lo volvemos a subir un microsegundo después para que el próximo Play funcione
    setTimeout(() => {
      if(masterGain) masterGain.gain.setValueAtTime(1.0, audioCtx.currentTime)
    }, 50)
  }
  
  jugando.value = false
  isPlaying.value = false
  if (intervaloContinuum) clearInterval(intervaloContinuum)
}

const alternarEstado = () => {
  if (estado.value === 'selector') {
    if (seleccionados.value.length === 0) { 
      mostrarTextoI.value = true; 
      setTimeout(() => mostrarTextoI.value = false, 2000); 
      return 
    }
    
    // 1. CAMBIAMOS EL ESTADO PRIMERO (Esto desbloquea los botones de la UI inmediatamente)
    estado.value = 'tocar'
    modo.value = ''
    
    // 2. INTENTAMOS LLENAR LAS BOLSAS (Si falla, no rompe la interfaz)
    try {
      llenarBolsas()
    } catch (error) {
      console.error("Error al generar las bolsas de intervalos:", error)
    }
    
  } else {
    salir()
  }
}

const salir = () => { detenerAudio(); estado.value = 'selector'; modo.value = ''; respuestaTexto.value = '' }

const cambiarModo = (nuevoModo) => {
  detenerAudio(); modo.value = nuevoModo
  if (nuevoModo === 'continuum') jugarContinuum()
}

const jugar = () => {
  isPlaying.value = true
  if (modo.value === 'discreto') selectArchivo()
  else if (modo.value === 'continuum') { jugando.value = true; jugarContinuum() }
}

const jugarContinuum = () => {
  if (intervaloContinuum) clearInterval(intervaloContinuum)
  intervaloContinuum = setInterval(() => { if (jugando.value) selectArchivo(); else clearInterval(intervaloContinuum) }, 3200)
}

const togglePlayStop = () => { if (isPlaying.value) detenerAudio(); else jugar() }

const evaluar = () => {
  mostrarCheck.value = false 
  
  setTimeout(() => {
    let esCorrecto = false
    const respuesta = respuestaTexto.value.trim()
    const correcta = datosInterv.value.nombre.trim()
    const grupoId = datosInterv.value.grupo
    const catCorrecta = datosInterv.value.cat
    
    // 1. NIVEL ESPECÍFICO: Exacto (ej: '3m' === '3m')
    if (respuesta === correcta) {
      esCorrecto = true
    }

    // 2. NIVEL MEDIO: Genérico (ej: '3' === '3') - SOLO SE COMPRUEBA SI EL ANTERIOR FALLÓ
    if (!esCorrecto && grupoId && isGenericActive(grupoId)) {
      const baseCorrecta = correcta.replace(/[mM]$/, '') 
      if (respuesta === baseCorrecta) {
        esCorrecto = true
      }
    }

    // 3. NIVEL AMPLIO: Categoría (ej: 'C' === 'C') - SOLO SE COMPRUEBA SI LOS ANTERIORES FALLARON
    if (!esCorrecto && catRespuestaTemp !== null && catRespuestaTemp === catCorrecta) {
      esCorrecto = true
    }

    catRespuestaTemp = null 

    if (esCorrecto) { checkmarkImg.value = '/grafs/acierto.png'; checkmarkScale.value = 'scale(1.0)' }
    else { checkmarkImg.value = '/grafs/error.png'; checkmarkScale.value = 'scale(0.7)' }
    mostrarCheck.value = true
  }, 50)
}

// ==================== RELOJ Y CICLO DE VIDA ====================
let relojTimer = null

watch([tipoEscalaActual, nombreTonicaActual, octavaActual], () => {
  generarMapaDiatonico()
  if (estado.value === 'tocar') { llenarBolsas() } // <--- CAMBIO AQUÍ
})

onMounted(() => {
  generarMapaDiatonico()
  const textoCompleto = "Seleccione los intervalos que desea trabajar, individualmente o por categorías."
  let pos = 0
  const typeInterval = setInterval(() => { textoInstruccion.value = textoCompleto.substring(0, pos); pos++; if (pos > textoCompleto.length) clearInterval(typeInterval) }, 50)
  const actualizarReloj = () => { const fecha = new Date(); reloj.value = `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}:${String(fecha.getSeconds()).padStart(2, '0')}` }
  relojTimer = setInterval(actualizarReloj, 1000); actualizarReloj()
})

onUnmounted(() => { if (relojTimer) clearInterval(relojTimer); if (intervaloContinuum) clearInterval(intervaloContinuum) })
</script>

<style scoped>
/* --- CONTENEDOR PRINCIPAL --- */
#panelIzquierdo {
  max-width: 500px; margin: 70px auto 20px auto; background-color: rgb(230,252,230);
  padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); position: relative;
}
#panelSuperior {
  position: fixed; top: 0; left: 0; width: 100%; text-align: center; font-family: futura, sans-serif;
  background-color: green; color: white; font-size: 20px; padding: 10px 0; z-index: 10;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}
#selector-tonalidad {
  display: flex; gap: 10px; font-size: 14px;
}
#tipo-escala, #tonica, #octava {
  padding: 4px 8px; border-radius: 4px; border: none; font-family: futura; 
  background-color: rgba(255,255,255,0.2); color: white; cursor: pointer;
}
#tipo-escala option, #tonica option, #octava option { 
  color: #333; background: white; /* Para que el desplegable se lea bien al abrirlo */
}
#selector { background-color: green; font-family: futura; color: rgb(176,220,173); text-align: center; font-size: 18px; margin-bottom: 15px; border-radius: 6px;}
#instrucciones { font-family: helvetica; color: rgb(10,75,5); font-size: 14px; min-height: 20px; margin-bottom: 15px; }

/* --- SISTEMA DE BOTONES --- */
.selector-grid { display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px; margin-left: 16%; margin-right: 16%; }
.fila-intervalos { display: flex; align-items: center; gap: 15px; }
.botones-fila { display: flex; gap: 8px; flex-wrap: wrap; }

.categ, .intervalo-btn {
  text-align: center; font-family: futura, sans-serif; opacity: 0.4; transition: all 0.2s ease;
  cursor: pointer; border: 1px solid #333; background: white;
}
.categ:hover, .intervalo-btn:hover { opacity: 0.7; transform: scale(1.05); }
.categ.active, .intervalo-btn.active { opacity: 1; background-color: #d4edda; border-color: #28a745; box-shadow: 0 0 8px rgba(40, 167, 69, 0.5); }

.categ { width: 40px; height: 40px; font-size: 18px; border-radius: 8px; flex-shrink: 0; }
.intervalo-btn { width: 45px; height: 40px; font-size: 14px; border-radius: 6px; }

/* --- BOTONES AGRUPADOS (3m/3M) --- */
.btn-grupo { display: flex; height: 40px; border-radius: 6px; overflow: hidden; box-shadow: 1px 1px 3px rgba(0,0,0,0.1); }
.btn-numero { border-top-right-radius: 0 !important; border-bottom-right-radius: 0 !important; border-right: none !important; }
.btn-calidad { display: flex; flex-direction: column; }
.btn-calidad-btn {
  width: 22px; height: 20px; font-size: 12px; border: 1px solid #333; background: white;
  opacity: 0.5; transition: all 0.2s ease; cursor: pointer; font-family: futura;
  display: flex; align-items: center; justify-content: center; color: #333;
}
.btn-calidad-btn:first-child { border-top-right-radius: 6px; border-bottom: none; }
.btn-calidad-btn:last-child { border-bottom-right-radius: 6px; border-top: none; }
.btn-calidad-btn:hover { opacity: 0.8; background: #e9ecef; }
.btn-calidad-btn.active { opacity: 1; background-color: #d4edda; border-color: #28a745; color: #155724; }

/* El número se ilumina SOLO si está activo de verdad */
.btn-grupo .btn-numero.active { opacity: 1; background-color: #d4edda; border-color: #28a745; }

/* --- PANEL DE CONTROLES --- */
#panelDerecho {
  background-color: rgb(71,75,71); color: white; font-size: 16px; padding: 15px;
  border-radius: 8px; margin-top: 20px; display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
}
#textoI { width: 100%; color: rgb(234,247,233); font-family: futura; margin-bottom: 10px; }
#entrar { background-color: rgb(171,185,171); color: rgb(2,18,5); font-size:14px; font-family: futura, sans-serif; padding: 8px 15px; border-radius: 5px; border: none; cursor: pointer; font-weight: bold; }
.control, .modo { cursor: pointer; border: none; color: white; font-family: futura; border-radius: 5px; }
#play-stop-btn {
  width: 45px;
  height: 45px;
  background: rgba(54, 247, 96, 0.3); /* Blanco muy transparente */
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 50%; /* Lo hace redondo */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}
#play-stop-btn:hover {
  background: rgba(115, 246, 144, 0.5); /* Se ilumina al pasar el ratón */
  transform: scale(1.1); /* Crece un poquito */
}
#play-stop-btn svg {
  margin-left: 3px; /* Ajuste visual para que el triángulo quede perfectamente centrado */
}
#repetir { background: rgba(255,255,255,0.2); padding: 8px; font-size: 14px; margin-left: auto; }
.modo { flex: 1; padding: 10px; font-size: 14px; background: rgba(255,255,255,0.1); transition: all 0.2s; margin-top: 10px;}
.modo:hover { background: rgba(255,255,255,0.3); }
.modo.active { background: rgba(46, 204, 113, 0.6); }

/* --- RESPUESTA Y CHECKMARK --- */
#respuesta {
  width: 100%; height: 35px; background-color: rgb(50,50,50); 
  color: rgb(234,247,233); font-family: futura; display: flex; align-items: center;
  justify-content: space-between; /* Empuja el texto a la izquierda y el icono a la derecha */
  border-radius: 6px; margin-top: 20px; font-size: 18px;
  padding: 0 15px; /* Espacio interno para que no rocen los bordes */
  box-sizing: border-box; 
}
#respuesta-texto {
  flex-grow: 1; /* El texto ocupa todo el espacio disponible */
  text-align: center; /* Y se centra en ese espacio */
}
#checkmark { 
  width: 25px; /* Un poco más pequeño para que quepa bien en la barra */
  height: 25px; 
  margin-left: 10px; /* Separación entre el texto y el icono */
}

/* --- RELOJ Y FONDO --- */
#reloj { position: fixed; bottom: 10px; left: 50%; transform: translateX(-50%); background-color: green; color: white; font-size: 16px; padding: 5px 15px; border-radius: 5px; z-index: 10;}
#fondo { position: fixed; top:0; left:0; z-index: -1; width: 100vw; height: 100vh; object-fit: cover; opacity: 0.8;}

/* --- ANIMACIONES --- */
.fade-in { animation: fadeIn 0.3s ease-in; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }

@media (max-width: 400px) {
  .intervalo-btn { width: 38px; font-size: 12px; }
  .categ { width: 35px; font-size: 16px; }
}
</style>