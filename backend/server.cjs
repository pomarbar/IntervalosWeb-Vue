const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const filePath = path.join(__dirname, 'resultados_intervalos.csv');
const TEACHER_PASSWORD = 'Intervalos2024*'; // ¡CAMBIA ESTO POR TU CLAVE REAL!
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 Megabytes

// --- MOTOR DE EVALUACIÓN SEGURO (Ejecutado en el servidor) ---
function evaluarRespuesta(sonado, respondido) {
  if (respondido === 'TA') return false; 
  if (respondido === sonado) return true; 

  const genericMatch = respondido.match(/^(\d)$/); 
  if (genericMatch) {
    if (sonado.startsWith(genericMatch[1])) return true; 
  }

  const catJ = ['U', '4', '5', '8'];
  const catC = ['3m', '3M', '6m', '6M'];
  const catD = ['2m', '2M', 'T', '7m', '7M'];

  if (respondido === 'J' && catJ.includes(sonado)) return true;
  if (respondido === 'C' && catC.includes(sonado)) return true;
  if (respondido === 'D' && catD.includes(sonado)) return true;

  return false; 
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-teacher-password');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // =====================================================================
  // ENDPOINT 1: GUARDAR DATOS (App del Alumno)
  // =====================================================================
  if (req.method === 'POST' && req.url === '/guardar') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const timestamp = new Date().toLocaleString('es-AR', { hour12: false });
        
        const headers = `"Fecha_Hora_24h","Nombre_Usuario","Sesion_ID","Num_Pregunta","Intervalo_App_Sonado","Respuesta_Usuario","Veredicto_Servidor"\n`;
        const esCorrecto = evaluarRespuesta(data.sonado, data.respondido);
        const veredicto = esCorrecto ? "Correcto" : "Incorrecto";
        const line = `"${timestamp}","${data.usuario}","${data.sessionId}","${data.pregunta}","${data.sonado}","${data.respondido}","${veredicto}"\n`;
        
        // --- LÓGICA DE ROTACIÓN DE ARCHIVOS ---
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            if (stats.size >= MAX_FILE_SIZE_BYTES) {
                const now = new Date();
                const dateStr = `${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()}_${now.getHours()}-${now.getMinutes()}`;
                const archivedPath = path.join(__dirname, `resultados_${dateStr}.csv`);
                fs.renameSync(filePath, archivedPath); 
            }
        }
        
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, headers);
        }
        
        fs.appendFileSync(filePath, line);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error' }));
      }
    });
  } 
  
  // =====================================================================
  // ENDPOINT 2: LEER DATOS (Widget Profesor)
  // =====================================================================
  else if (req.method === 'GET' && req.url.startsWith('/resultados')) {
    const reqPassword = req.headers['x-teacher-password'];
    if (reqPassword !== TEACHER_PASSWORD) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'error', message: 'Clave incorrecta' }));
      return;
    }

    try {
      const urlObj = new URL(req.url, `http://${req.headers.host}`);
      const targetFileName = urlObj.searchParams.get('file') || 'resultados_intervalos.csv';
      const targetFilePath = path.join(__dirname, targetFileName);

      if (!fs.existsSync(targetFilePath)) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([]));
        return;
      }
      
      const fileContent = fs.readFileSync(targetFilePath, 'utf8');
      const lines = fileContent.trim().split('\n');
      
      if (lines.length <= 1) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([]));
        return;
      }

      const data = lines.slice(1).map(line => {
        const match = line.match(/"([^"]*)"/g);
        if (!match || match.length < 7) return null;
        const vals = match.map(v => v.replace(/"/g, ''));
        return {
          timestamp: vals[0],
          usuario: vals[1],
          sessionId: vals[2],
          pregunta: vals[3],
          sonado: vals[4],
          respondido: vals[5],
          veredicto: vals[6]
        };
      }).filter(Boolean);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'error' }));
    }
  } 

  // =====================================================================
  // ENDPOINT 3: LISTAR ARCHIVOS HISTÓRICOS
  // =====================================================================
  else if (req.method === 'GET' && req.url === '/historial') {
    const reqPassword = req.headers['x-teacher-password'];
    if (reqPassword !== TEACHER_PASSWORD) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'error' }));
      return;
    }

    try {
      const files = fs.readdirSync(__dirname);
      const csvFiles = files.filter(f => f.startsWith('resultados') && f.endsWith('.csv'))
                            .sort().reverse();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(csvFiles));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'error' }));
    }
  }

  // =====================================================================
  // RUTA NO ENCONTRADA
  // =====================================================================
  else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`✅ Servidor backend escuchando en http://localhost:${PORT}`);
  console.log(`📄 Guardando resultados en: ${filePath}`);
  console.log(`🔒 Clave del profesor configurada.`);
});