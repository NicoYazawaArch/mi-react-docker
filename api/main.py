import os
import random
from datetime import timedelta 
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt  
from flask_jwt_extended import create_access_token, jwt_required, JWTManager, get_jwt_identity 

app = Flask(__name__)
CORS(app)

# --- CONFIGURACIÓN DE SEGURIDAD ---
app.config["JWT_SECRET_KEY"] = "super-secreto-y-largo" # En producción esto va en variable de entorno
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

jwt = JWTManager(app)
bcrypt = Bcrypt(app) 

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://nico:mipassword@db:5432/mi_base_de_datos')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- NUEVO MODELO: USUARIOS ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

# --- MODELO PALABRAS (Ahora con dueño) ---
class Palabra(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    contenido = db.Column(db.String(200), nullable=False)
    tipo = db.Column(db.String(50), nullable=False, default='general')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) # ¡NUEVO!

with app.app_context():
    db.create_all()

# --- RUTAS DE AUTENTICACIÓN ---

@app.route('/api/register', methods=['POST'])
def register():
    datos = request.json
    email = datos.get('email')
    password = datos.get('password')
    
    if not email or not password:
        return jsonify({"msg": "Faltan datos"}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Ese email ya existe"}), 409

    # Encriptar password
    hashed = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(email=email, password=hashed)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"msg": "Usuario creado"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    datos = request.json
    user = User.query.filter_by(email=datos.get('email')).first()

    if user and bcrypt.check_password_hash(user.password, datos.get('password')):
        token = create_access_token(identity=str(user.id))
        
        # --- CAMBIO AQUÍ: Agregamos "usuario": user.email ---
        return jsonify(access_token=token, usuario=user.email), 200
    else:
        return jsonify({"msg": "Credenciales incorrectas"}), 401

# --- RUTAS PROTEGIDAS (Requieren Token) ---

@app.route('/api/palabras', methods=['POST'])
@jwt_required()
def guardar_palabra():
    current_user_id = get_jwt_identity()
    datos = request.json
    nueva = Palabra(
        contenido=datos.get('contenido'),
        tipo=datos.get('tipo', 'general'),
        user_id=current_user_id # Se guarda con tu ID
    )
    db.session.add(nueva)
    db.session.commit()
    return jsonify({"mensaje": "Guardado"})

@app.route('/api/generar/identidad', methods=['GET'])
@jwt_required()
def generar_identidad():
    user_id = get_jwt_identity()
    # Solo busca en TUS palabras
    nombres = [p.contenido for p in Palabra.query.filter_by(tipo='nombre', user_id=user_id).all()]
    apellidos = [p.contenido for p in Palabra.query.filter_by(tipo='apellido', user_id=user_id).all()]

    if not nombres or not apellidos:
        return jsonify({"resultado": "Faltan datos (agrega nombres y apellidos)"})

    nombre = random.choice(nombres)
    apellido = random.choice(apellidos)
    return jsonify({"resultado": f"{nombre} {apellido}"})

@app.route('/api/generar/oracion', methods=['GET'])
@jwt_required()
def generar_oracion():
    user_id = get_jwt_identity()
    palabras = [p.contenido for p in Palabra.query.filter_by(tipo='general', user_id=user_id).all()]

    if len(palabras) < 3:
        return jsonify({"resultado": "Necesito más palabras..."})

    frase = " ".join(random.choices(palabras, k=random.randint(3, 8)))
    return jsonify({"resultado": frase.capitalize() + "."})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)