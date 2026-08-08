<template>
  <div class="app-container">
    <!-- Fondo -->
    <img id="fondo" src="/grafs/w12.jpg" alt="fondo" />

    <!-- Panel Superior -->
    <div id="panelSuperior">Intervalos armónicos</div>

    <!-- Panel Izquierdo -->
    <div id="panelIzquierdo">
      <div id="selector">Intervalos simples armónicos</div>
      <p id="instrucciones">{{ textoInstruccion }}</p>
      
      <!-- Selectores de Categoría e Intervalos organizados por filas -->
      <div class="selector-grid">
        <!-- Fila J -->
        <div class="fila-intervalos">
          <button class="categ" :class="{ active: estaCategoriaActiva('J') }" @click="toggleCategoria('J')">J</button>
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
          <button class="categ" :class="{ active: estaCategoriaActiva('C') }" @click="toggleCategoria('C')">C</button>
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
          <button class="categ" :class="{ active: estaCategoriaActiva('D') }" @click="toggleCategoria('D')">D</button>
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
      <div id="respuesta">{{ respuestaTexto }}</div>
      <img id="checkmark" v-if="mostrarCheck" :src="checkmarkImg" :style="{ transform: checkmarkScale }" class="fade-in" />

      <!-- Panel Derecho (Controles) -->
      <div id="panelDerecho">
        <p id="textoI" v-if="mostrarTextoI" class="fade-in">No hay intervalos seleccionados. Por favor, antes de entrar seleccione los intervalos que desea trabajar.</p>
        
        <img v-if="estado === 'tocar' && modo" class="control" id="play" src="/grafs/play.png" @mousedown="jugar" @mouseup="respuestaTexto = '¿Cuál intervalo sonó?'" />
        <img v-if="estado === 'tocar' && modo" class="control" id="stop" src="/grafs/stop.png" @mousedown="detenerAudio" />
        
        <button id="entrar" @click="alternarEstado">
          {{ estado === 'selector' ? 'ENTRAR' : 'SELECCIONAR' }}
        </button>

        <button v-if="estado === 'tocar' && modo === 'discreto'" class="control" id="repetir" @click="repetirIntervalo">REPETIR</button>
        
        <button v-if="estado === 'tocar'" class="modo" :class="{ active: modo === 'discreto' }" @click="cambiarModo('discreto')">Modo Discreto</button>
        <button v-if="estado === 'tocar'" class="modo" :class="{ active: modo === 'continuum' }" @click="cambiarModo('continuum')">Modo Continuum</button>
      </div>
    </div>

    <div id="reloj">{{ reloj }}</div>
    
    <!-- Audio oculto -->
    <audio ref="audioElement" id="fileInterv"></audio>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// ==================== DATOS ====================
const intervalos = [
  { id: 'uj', nombre: 'Unísono', nombreCorto: 'U', cat: 'J', grupo: null, semitonos: 0, archivos: ['u1.mp3', 'u2.mp3', 'u3.mp3', 'u4.mp3', 'u5.mp3', 'u6.mp3', 'u7.mp3', 'u8.mp3', 'u9.mp3', 'u10.mp3', 'u11.mp3', 'u12.mp3', 'u13.mp3'] },
  { id: 'cuartaj', nombre: 'Cuarta', nombreCorto: '4', cat: 'J', grupo: null, semitonos: 5, archivos: ['4ju1.mp3', '4ju2.mp3', '4ju3.mp3', '4ju4.mp3', '4ju5.mp3', '4ju6.mp3', '4ju7.mp3', '4ju8.mp3', '4ju9.mp3', '4ju10.mp3', '4ju11.mp3', '4ju12.mp3', '4ju13.mp3'] },
  { id: 'quintaj', nombre: 'Quinta', nombreCorto: '5', cat: 'J', grupo: null, semitonos: 7, archivos: ['5ju1.mp3', '5ju2.mp3', '5ju3.mp3', '5ju4.mp3', '5ju5.mp3', '5ju6.mp3', '5ju7.mp3', '5ju8.mp3', '5ju9.mp3', '5ju10.mp3', '5ju11.mp3', '5ju12.mp3', '5ju13.mp3'] },
  { id: 'octava', nombre: 'Octava', nombreCorto: '8', cat: 'J', grupo: null, semitonos: 12, archivos: ['8ju1.mp3', '8ju2.mp3', '8ju3.mp3', '8ju4.mp3', '8ju5.mp3', '8ju6.mp3', '8ju7.mp3', '8ju8.mp3', '8ju9.mp3', '8ju10.mp3', '8ju11.mp3', '8ju12.mp3', '8ju13.mp3'] },
  { id: 'terzame', nombre: 'Tercera menor', nombreCorto: '3m', cat: 'C', grupo: '3', semitonos: 3, archivos: ['3me1.mp3', '3me2.mp3', '3me3.mp3', '3me4.mp3', '3me5.mp3', '3me6.mp3', '3me7.mp3', '3me8.mp3', '3me9.mp3', '3me10.mp3', '3me11.mp3', '3me12.mp3', '3me13.mp3'] },
  { id: 'terzama', nombre: 'Tercera mayor', nombreCorto: '3M', cat: 'C', grupo: '3', semitonos: 4, archivos: ['3ma1.mp3', '3ma2.mp3', '3ma3.mp3', '3ma4.mp3', '3ma5.mp3', '3ma6.mp3', '3ma7.mp3', '3ma8.mp3', '3ma9.mp3', '3ma10.mp3', '3ma11.mp3', '3ma12.mp3', '3ma13.mp3'] },
  { id: 'sextame', nombre: 'Sexta menor', nombreCorto: '6m', cat: 'C', grupo: '6', semitonos: 8, archivos: ['6me1.mp3', '6me2.mp3', '6me3.mp3', '6me4.mp3', '6me5.mp3', '6me6.mp3', '6me7.mp3', '6me8.mp3', '6me9.mp3', '6me10.mp3', '6me11.mp3', '6me12.mp3', '6me13.mp3'] },
  { id: 'sextama', nombre: 'Sexta mayor', nombreCorto: '6M', cat: 'C', grupo: '6', semitonos: 9, archivos: ['6ma1.mp3', '6ma2.mp3', '6ma3.mp3', '6ma4.mp3', '6ma5.mp3', '6ma6.mp3', '6ma7.mp3', '6ma8.mp3', '6ma9.mp3', '6ma10.mp3', '6ma11.mp3', '6ma12.mp3', '6ma13.mp3'] },
  { id: 'segme', nombre: 'Segunda menor', nombreCorto: '2m', cat: 'D', grupo: '2', semitonos: 1, archivos: ['2me1.mp3', '2me2.mp3', '2me3.mp3', '2me4.mp3', '2me5.mp3', '2me6.mp3', '2me7.mp3', '2me8.mp3', '2me9.mp3', '2me10.mp3', '2me11.mp3', '2me12.mp3', '2me13.mp3'] },
  { id: 'segma', nombre: 'Segunda mayor', nombreCorto: '2M', cat: 'D', grupo: '2', semitonos: 2, archivos: ['2ma1.mp3', '2ma2.mp3', '2ma3.mp3', '2ma4.mp3', '2ma5.mp3', '2ma6.mp3', '2ma7.mp3', '2ma8.mp3', '2ma9.mp3', '2ma10.mp3', '2ma11.mp3', '2ma12.mp3', '2ma13.mp3'] },
  { id: 'trit', nombre: 'Tritono', nombreCorto: 'T', cat: 'D', grupo: null, semitonos: 6, archivos: ['trit1.mp3', 'trit2.mp3', 'trit3.mp3', 'trit4.mp3', 'trit5.mp3', 'trit6.mp3', 'trit7.mp3', 'trit8.mp3', 'trit9.mp3', 'trit10.mp3', 'trit11.mp3', 'trit12.mp3', 'trit13.mp3'] },
  { id: 'septme', nombre: 'Séptima menor', nombreCorto: '7m', cat: 'D', grupo: '7', semitonos: 10, archivos: ['7me1.mp3', '7me2.mp3', '7me3.mp3', '7me4.mp3', '7me5.mp3', '7me6.mp3', '7me7.mp3', '7me8.mp3', '7me9.mp3', '7me10.mp3', '7me11.mp3', '7me12.mp3', '7me13.mp3'] },
  { id: 'septma', nombre: 'Séptima mayor', nombreCorto: '7M', cat: 'D', grupo: '7', semitonos: 11, archivos: ['7ma1.mp3', '7ma2.mp3', '7ma3.mp3', '7ma4.mp3', '7ma5.mp3', '7ma6.mp3', '7ma7.mp3', '7ma8.mp3', '7ma9.mp3', '7ma10.mp3', '7ma11.mp3', '7ma12.mp3', '7ma13.mp3'] }
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
const datosInterv = ref({ lista: -1, item: -1, nombre: '', id: '', grupo: null })
const matrizInterv = ref([])
const jugando = ref(false)
const audioElement = ref(null)
let poolDeJuego = []
let intervaloContinuum = null

// ==================== LÓGICA DE SELECCIÓN (ESTRICTA: 2 ESTADOS) ====================

const isGenericActive = (grupoId) => seleccionados.value.includes(grupoId + '_gen')
const isGrupoActive = (grupoId) => isGenericActive(grupoId) || intervalos.some(i => i.grupo === grupoId && seleccionados.value.includes(i.id))

const toggleGenerico = (grupo) => {
  const genId = grupo.idGrupo + '_gen'
  const index = seleccionados.value.indexOf(genId)
  if (index > -1) seleccionados.value.splice(index, 1)
  else seleccionados.value.push(genId)
}

const toggleSubIntervalo = (intervalo) => {
  // 1. Exclusividad: apagar el hermano opuesto
  const otro = intervalos.find(i => i.grupo === intervalo.grupo && i.id !== intervalo.id)
  if (otro) seleccionados.value = seleccionados.value.filter(id => id !== otro.id)

  // 2. Activa o desactiva la letra pulsada
  const index = seleccionados.value.indexOf(intervalo.id)
  if (index > -1) seleccionados.value.splice(index, 1)
  else seleccionados.value.push(intervalo.id)

  // 3. REGLA ESTRICTA: Si el número NO está activo, se activa forzosamente.
  const genId = intervalo.grupo + '_gen'
  if (!seleccionados.value.includes(genId)) seleccionados.value.push(genId)
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
    respuestaTexto.value = intervalo.nombre
    evaluar()
  }
}

const handleGenericClick = (grupo) => {
  if (estado.value === 'tocar') {
    respuestaTexto.value = grupo.miembros[0].nombre.split(' ')[0]
    evaluar()
  } else if (estado.value === 'selector') toggleGenerico(grupo)
}

const estaCategoriaActiva = (cat) => {
  const gruposDeCat = [...new Set(intervalos.filter(i => i.cat === cat && i.grupo).map(i => i.grupo))]
  const singlesDeCat = intervalos.filter(i => i.cat === cat && !i.grupo)
  return gruposDeCat.every(g => isGenericActive(g)) && singlesDeCat.every(s => seleccionados.value.includes(s.id))
}

const toggleCategoria = (cat) => {
  if (estado.value !== 'selector') return
  const gruposDeCat = [...new Set(intervalos.filter(i => i.cat === cat && i.grupo).map(i => i.grupo))]
  const singlesDeCat = intervalos.filter(i => i.cat === cat && !i.grupo)
  const todosActivos = estaCategoriaActiva(cat)
  
  if (todosActivos) {
    gruposDeCat.forEach(g => seleccionados.value = seleccionados.value.filter(id => id !== g + '_gen'))
    singlesDeCat.forEach(s => seleccionados.value = seleccionados.value.filter(id => id !== s.id))
  } else {
    gruposDeCat.forEach(g => { if (!isGenericActive(g)) seleccionados.value.push(g + '_gen') })
    singlesDeCat.forEach(s => { if (!seleccionados.value.includes(s.id)) seleccionados.value.push(s.id) })
  }
}

// Funciones para renderizar el HTML
const getIntervalosPorCategoria = (cat) => intervalos.filter(i => i.cat === cat)

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

// ==================== LÓGICA DE JUEGO ====================

const alternarEstado = () => {
  if (estado.value === 'selector') {
    if (seleccionados.value.length === 0) {
      mostrarTextoI.value = true
      setTimeout(() => mostrarTextoI.value = false, 2000)
      return
    }
    llenarMatriz()
    estado.value = 'tocar'
    modo.value = ''
  } else salir()
}

const salir = () => {
  detenerAudio()
  estado.value = 'selector'
  modo.value = ''
  respuestaTexto.value = ''
}

const cambiarModo = (nuevoModo) => {
  detenerAudio()
  modo.value = nuevoModo
  if (nuevoModo === 'continuum') jugarContinuum()
}

const getIntervalosParaJugar = () => {
  const pool = []
  for (const id of seleccionados.value) {
    if (id.endsWith('_gen')) {
      const grupoId = id.replace('_gen', '')
      intervalos.filter(i => i.grupo === grupoId).forEach(i => {
        if (!pool.find(p => p.id === i.id)) pool.push(i)
      })
    } else {
      const intObj = intervalos.find(i => i.id === id)
      if (intObj && !pool.find(p => p.id === intObj.id)) pool.push(intObj)
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
  const item = lista[g]
  lista.splice(g, 1)
  return item
}

const selectArchivo = () => {
  const indicesDisponibles = []
  matrizInterv.value.forEach((sublista, index) => { if (sublista.length > 0) indicesDisponibles.push(index) })
  if (indicesDisponibles.length === 0) { llenarMatriz(); return selectArchivo() }

  const subIndex = seleccionaItem(indicesDisponibles)
  let listaInterna = matrizInterv.value[subIndex]
  if (listaInterna.length === 0) matrizInterv.value[subIndex] = [0,1,2,3,4,5,6,7,8,9,10,11,12]

  const numItem = seleccionaItem(matrizInterv.value[subIndex])
  const objetoIntervalo = poolDeJuego[subIndex] 

  tocaIntervalo(objetoIntervalo.archivos[numItem])
  datosInterv.value = { lista: subIndex, item: numItem, nombre: objetoIntervalo.nombre, id: objetoIntervalo.id, grupo: objetoIntervalo.grupo }
}

const tocaIntervalo = (archivo) => {
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value.src = "audios/" + archivo
    audioElement.value.currentTime = 0
    audioElement.value.play()
  }
}

const detenerAudio = () => {
  if (audioElement.value) audioElement.value.pause()
  jugando.value = false
  if (intervaloContinuum) clearInterval(intervaloContinuum)
}

const jugar = () => {
  if (modo.value === 'discreto') selectArchivo()
  else if (modo.value === 'continuum') { jugando.value = true; jugarContinuum() }
}

const jugarContinuum = () => {
  if (intervaloContinuum) clearInterval(intervaloContinuum)
  intervaloContinuum = setInterval(() => {
    if (jugando.value) selectArchivo()
    else clearInterval(intervaloContinuum)
  }, 3200)
}

const repetirIntervalo = () => {
  const objetoIntervalo = poolDeJuego[datosInterv.value.lista]
  tocaIntervalo(objetoIntervalo.archivos[datosInterv.value.item])
}

const evaluar = () => {
  mostrarCheck.value = false 
  setTimeout(() => {
    const respuesta = respuestaTexto.value
    const correcta = datosInterv.value.nombre
    const grupoId = datosInterv.value.grupo
    let esCorrecto = false

    if (respuesta === correcta) esCorrecto = true
    else if (correcta.startsWith(respuesta + ' ')) {
      if (grupoId && isGenericActive(grupoId)) esCorrecto = true
    }

    if (esCorrecto) { checkmarkImg.value = '/grafs/acierto.png'; checkmarkScale.value = 'scale(1.0)' }
    else { checkmarkImg.value = '/grafs/error.png'; checkmarkScale.value = 'scale(0.7)' }
    mostrarCheck.value = true
  }, 50)
}

// ==================== RELOJ Y ANIMACIONES ====================
let relojTimer = null

onMounted(() => {
  const textoCompleto = "Seleccione los intervalos que desea trabajar, individualmente o por categorías."
  let pos = 0
  const typeInterval = setInterval(() => {
    textoInstruccion.value = textoCompleto.substring(0, pos)
    pos++
    if (pos > textoCompleto.length) clearInterval(typeInterval)
  }, 50)

  const actualizarReloj = () => {
    const fecha = new Date();
    reloj.value = `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}:${String(fecha.getSeconds()).padStart(2, '0')}`
  }
  relojTimer = setInterval(actualizarReloj, 1000)
  actualizarReloj()
})

onUnmounted(() => {
  if (relojTimer) clearInterval(relojTimer)
  if (intervaloContinuum) clearInterval(intervaloContinuum)
})
</script>

<style scoped>
/* --- CONTENEDOR PRINCIPAL --- */
#panelIzquierdo {
  max-width: 500px; margin: 70px auto 20px auto; background-color: rgb(230,252,230);
  padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); position: relative;
}
#panelSuperior {
  position: fixed; top: 0; left: 0; width: 100%; text-align: center; font-family: futura, sans-serif;
  background-color: green; color: white; font-size: 24px; padding: 15px 0; z-index: 10;
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
#play, #stop { height: 40px; width: 40px; background: transparent; }
#repetir { background: rgba(255,255,255,0.2); padding: 8px; font-size: 14px; margin-left: auto; }
.modo { flex: 1; padding: 10px; font-size: 14px; background: rgba(255,255,255,0.1); transition: all 0.2s; margin-top: 10px;}
.modo:hover { background: rgba(255,255,255,0.3); }
.modo.active { background: rgba(46, 204, 113, 0.6); }

/* --- RESPUESTA Y CHECKMARK --- */
#respuesta {
  width: 100%; height: 35px; background-color: rgb(50,50,50); text-align: center;
  color: rgb(234,247,233); font-family: futura; display: flex; align-items: center;
  justify-content: center; border-radius: 6px; margin-top: 20px; font-size: 18px;
}
#checkmark { position: absolute; right: 20px; top: 20px; width: 35px; height: 35px; }

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