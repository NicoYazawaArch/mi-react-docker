import { useState } from 'react'
import axios from 'axios'

function App() {
  // --- ESTADOS DE AUTENTICACIÓN ---
  const [token, setToken] = useState(null)
  const [currentUser, setCurrentUser] = useState("") // Estado para el nombre del usuario
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [esRegistro, setEsRegistro] = useState(false)

  // --- ESTADOS DE LA APP (Laboratorio) ---
  const [texto, setTexto] = useState("")
  const [tipo, setTipo] = useState("general")
  const [resultado, setResultado] = useState("Aquí aparecerá la magia...")

  // --- FUNCIONES DE SEGURIDAD ---
  const autenticar = async (e) => {
    e.preventDefault();
    const endpoint = esRegistro ? '/register' : '/login';
    
    try {
      const res = await axios.post(`http://localhost:5000/api${endpoint}`, {
        email: email,
        password: password
      });

      if (esRegistro) {
        alert("¡Registro exitoso! Ahora inicia sesión.");
        setEsRegistro(false);
      } else {
        setToken(res.data.access_token);
        setCurrentUser(res.data.usuario); // Guardamos el nombre aquí
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      alert(error.response?.data?.msg || "Ocurrió un error");
    }
  }

  const cerrarSesion = () => {
    setToken(null);
    setResultado("Aquí aparecerá la magia...");
    setCurrentUser(""); // Limpiamos el usuario al salir
  }

  // --- FUNCIONES DE LA APP ---
  const enviarDato = (e) => {
    e.preventDefault();
    if (!texto) return;
    
    axios.post('http://localhost:5000/api/palabras', 
      { contenido: texto, tipo: tipo },
      { headers: { Authorization: `Bearer ${token}` } } 
    ).then(() => {
      setTexto("");
      alert("¡Dato guardado en tu bóveda personal!");
    }).catch(err => alert("Error al guardar"));
  }

  const generarIdentidad = () => {
    axios.get('http://localhost:5000/api/generar/identidad', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setResultado(res.data.resultado))
      .catch(err => setResultado("Error: " + err.response?.data?.msg));
  }

  const generarOracion = () => {
    axios.get('http://localhost:5000/api/generar/oracion', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setResultado(res.data.resultado))
      .catch(err => setResultado("Error: " + err.response?.data?.msg));
  }

  // --- RENDERIZADO CONDICIONAL ---
  
  // 1. SI NO HAY TOKEN (PANTALLA DE LOGIN)
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-5">
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 w-full max-w-sm shadow-2xl">
          <h1 className="text-3xl font-bold text-center mb-6 text-blue-400">
            {esRegistro ? "Crear Cuenta" : "Iniciar Sesión"}
          </h1>
          
          <form onSubmit={autenticar} className="flex flex-col gap-4">
            <input 
              type="email" 
              placeholder="Tu Email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="p-3 rounded bg-slate-900 border border-slate-600 focus:border-blue-500 outline-none"
              required
            />
            <input 
              type="password" 
              placeholder="Contraseña Secreta" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="p-3 rounded bg-slate-900 border border-slate-600 focus:border-blue-500 outline-none"
              required
            />
            
            <button type="submit" className="bg-blue-600 py-3 rounded font-bold hover:bg-blue-500 transition mt-2">
              {esRegistro ? "Registrarse" : "Entrar"}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-400 text-sm">
            {esRegistro ? "¿Ya tienes cuenta?" : "¿Eres nuevo?"}
            <button 
              onClick={() => setEsRegistro(!esRegistro)} 
              className="text-blue-400 hover:underline ml-2"
            >
              {esRegistro ? "Ingresa aquí" : "Regístrate"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // 2. SI HAY TOKEN (PANTALLA PRINCIPAL)
  return (
    <div className="min-h-screen bg-slate-900 text-white p-5 flex flex-col items-center justify-center font-mono relative">
      
      {/* --- AQUÍ PEGAMOS EL NUEVO BLOQUE DE USUARIO (Reemplaza al botón viejo) --- */}
      <div className="absolute top-5 right-5 flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full border border-blue-900 shadow-lg">
          <span className="text-xl">👤</span>
          <span className="text-blue-300 font-bold text-sm">{currentUser}</span>
        </div>

        <button 
          onClick={cerrarSesion}
          className="text-red-400 border border-red-900 px-3 py-1 rounded hover:bg-red-900/30 transition text-xs"
        >
          Salir 🔒
        </button>
      </div>
      {/* ----------------------------------------------------------------------- */}

      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 mb-8">
        🧪 Tu Laboratorio Privado
      </h1>

      {/* 1. INPUT */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-md mb-8 shadow-lg">
        <h2 className="text-xl mb-4 text-blue-300">1. Alimenta tu base de datos</h2>
        <form onSubmit={enviarDato} className="flex flex-col gap-3">
          <input 
            type="text" 
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Palabra secreta..."
            className="p-3 rounded bg-slate-900 border border-slate-600 focus:border-blue-500 outline-none"
          />
          
          <div className="flex gap-2">
            <select 
              value={tipo} 
              onChange={(e) => setTipo(e.target.value)}
              className="p-3 rounded bg-slate-900 border border-slate-600 flex-1"
            >
              <option value="general">Palabra</option>
              <option value="nombre">Nombre</option>
              <option value="apellido">Apellido</option>
            </select>
            
            <button type="submit" className="bg-blue-600 px-6 rounded hover:bg-blue-500 font-bold">
              Guardar
            </button>
          </div>
        </form>
      </div>

      {/* 2. RESULTADOS */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-md text-center shadow-lg">
        <h2 className="text-xl mb-4 text-green-300">2. Crea caos privado</h2>
        
        <div className="flex gap-4 justify-center mb-6">
          <button 
            onClick={generarIdentidad}
            className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded transition shadow-lg shadow-purple-900/50"
          >
            👤 Persona
          </button>
          <button 
            onClick={generarOracion}
            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded transition shadow-lg shadow-green-900/50"
          >
            🎲 Frase
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