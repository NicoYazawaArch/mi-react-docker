import os
import random 
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://nico:mipassword@db:5432/mi_base_de_datos')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


class Palabra(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    contenido = db.Column(db.String(200), nullable=False)
    # tipo puede ser: 'nombre', 'apellido', 'general'
    tipo = db.Column(db.String(50), nullable=False, default='general')

with app.app_context():
    db.create_all()

# --- RUTAS DE GUARDADO ---
@app.route('/api/palabras', methods=['POST'])
def guardar_palabra():
    datos = request.json
    # Recibimos el texto y el tipo (nombre, apellido, o general)
    nueva = Palabra(
        contenido=datos.get('contenido'),
        tipo=datos.get('tipo', 'general')
    )
    db.session.add(nueva)
    db.session.commit()
    return jsonify({"mensaje": "¡Guardado en el laboratorio!"})

# --- RUTAS DE GENERADORES ---

# OPCIÓN 1: GENERAR NOMBRE
@app.route('/api/generar/identidad', methods=['GET'])
def generar_identidad():
    # Buscamos todos los nombres y apellidos disponibles
    nombres = [p.contenido for p in Palabra.query.filter_by(tipo='nombre').all()]
    apellidos = [p.contenido for p in Palabra.query.filter_by(tipo='apellido').all()]

    if not nombres or not apellidos:
        return jsonify({"resultado": "Faltan datos para crear una identidad (agrega nombres y apellidos)"})

    # Lógica: 1 Nombre + 1 Apellido obligatorios
    nombre_final = random.choice(nombres)
    apellido_final = random.choice(apellidos)

    # 30% de probabilidad de tener segundo nombre (si hay suficientes)
    if random.random() > 0.7 and len(nombres) > 1:
        segundo_nombre = random.choice(nombres)
        # Evitamos que se llame "Juan Juan"
        while segundo_nombre == nombre_final:
            segundo_nombre = random.choice(nombres)
        nombre_final += f" {segundo_nombre}"

    return jsonify({"resultado": f"{nombre_final} {apellido_final}"})

# OPCIÓN 2: GENERAR ORACIÓN LOCA
@app.route('/api/generar/oracion', methods=['GET'])
def generar_oracion():
    # Usamos las palabras generales
    palabras = [p.contenido for p in Palabra.query.filter_by(tipo='general').all()]

    if len(palabras) < 3:
        return jsonify({"resultado": "Necesito más palabras para pensar..."})

    # Longitud aleatoria entre 3 y 8 palabras
    longitud = random.randint(3, 8)
    
    # Armamos la frase
    frase = " ".join(random.choices(palabras, k=longitud))
    
    return jsonify({"resultado": frase.capitalize() + "."})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)