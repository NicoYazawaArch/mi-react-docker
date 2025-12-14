import { useState } from 'react'
import axios from 'axios'

function App() {
  // Inputs
  const [texto, setTexto] = useState("")
  const [tipo, setTipo] = useState("general")
  
  // Output del generador
  const [resultado, setResultado] = useState("Aquí aparecerá la magia...")

  // Función para guardar
  const enviarDato = (e) => {
    e.preventDefault();
    if (!texto) return;
    
    axios.post('http://localhost:5000/api/palabras', { contenido: texto, tipo: tipo })
      .then(() => {
        setTexto("");
        alert("¡Dato guardado en el cerebro!");
      });
  }

  // Funciones para generar
  const generarIdentidad = () => {
    axios.get('http://localhost:5000/api/generar/identidad')
      .then(res => setResultado(res.data.resultado));
  }

  const generarOracion = () => {
    axios.get('http://localhost:5000/api/generar/oracion')
      .then(res => setResultado(res.data.resultado));
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-5 flex flex-col items-center justify-center font-mono">
      
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 mb-8">
        🧪 Laboratorio de Palabras
      </h1>

      {/* ZONA DE INPUT (Alimentar la base de datos) */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-md mb-8">
        <h2 className="text-xl mb-4 text-blue-300">1. Alimenta al sistema</h2>
        <form onSubmit={enviarDato} className="flex flex-col gap-3">
          <input 
            type="text" 
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe algo..."
            className="p-3 rounded bg-slate-900 border border-slate-600 focus:border-blue-500 outline-none"
          />
          
          <div className="flex gap-2">
            <select 
              value={tipo} 
              onChange={(e) => setTipo(e.target.value)}
              className="p-3 rounded bg-slate-900 border border-slate-600 flex-1"
            >
              <option value="general">Palabra (para oraciones)</option>
              <option value="nombre">Nombre</option>
              <option value="apellido">Apellido</option>
            </select>
            
            <button type="submit" className="bg-blue-600 px-6 rounded hover:bg-blue-500 font-bold">
              Guardar
            </button>
          </div>
        </form>
      </div>

      {/* ZONA DE RESULTADOS (Jugar) */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-md text-center">
        <h2 className="text-xl mb-4 text-green-300">2. Crea el caos</h2>
        
        <div className="flex gap-4 justify-center mb-6">
          <button 
            onClick={generarIdentidad}
            className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded transition shadow-lg shadow-purple-900/50"
          >
            👤 Crear Persona
          </button>
          <button 
            onClick={generarOracion}
            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded transition shadow-lg shadow-green-900/50"
          >
            🎲 Frase Random
          </button>
        </div>

        <div className="bg-black/30 p-4 rounded-lg border border-slate-600 min-h-[80px] flex items-center justify-center">
          <p className="text-2xl text-yellow-300 font-bold animate-pulse">
            {resultado}
          </p>
        </div>
      </div>

    </div>
  )
}

export default App