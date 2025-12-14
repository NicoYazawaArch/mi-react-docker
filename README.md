# 🧪 Laboratorio de Palabras - Full Stack Docker

Una aplicación web interactiva que permite a los usuarios alimentar una base de datos con palabras y generar identidades falsas o frases aleatorias ("caos") utilizando esos datos.

## 🚀 Tecnologías Usadas
Este proyecto corre 100% en contenedores **Docker**.

* **Frontend:** React + Vite + Tailwind CSS v3
* **Backend:** Python 3.11 + Flask
* **Base de Datos:** PostgreSQL
* **Administración DB:** PgAdmin 4
* **Infraestructura:** Docker Compose

## 🛠️ Instalación y Uso

No necesitas instalar Node, Python ni Postgres en tu PC. Solo necesitas **Docker**.

1.  Clona este repositorio.
2.  Crea el entorno:
    ```bash
    docker-compose up --build
    ```
3.  Accede a la aplicación:
    * **Web App:** http://localhost:5173
    * **API:** http://localhost:5000
    * **PgAdmin (DB Manager):** http://localhost:5050
        * *Email:* admin@admin.com
        * *Pass:* admin

## 🎮 Cómo funciona
1.  **Alimenta al sistema:** Ingresa Nombres, Apellidos o Palabras generales.
2.  **Crea el caos:** Usa los botones para generar combinaciones aleatorias persistentes.