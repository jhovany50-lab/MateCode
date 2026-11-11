# MateCode

**Aplicación web para organizar y gestionar tareas personales.**

MateCode es una aplicación web de gestión de tareas que permite a los usuarios crear una cuenta, iniciar sesión y administrar sus actividades desde un espacio de trabajo personal.

La aplicación utiliza Firebase para la autenticación y persistencia de datos, y AWS SES para enviar resúmenes de tareas por correo electrónico mediante una función serverless desplegada en Vercel.

## Características principales

- Registro e inicio de sesión con correo electrónico y contraseña.
- Persistencia de sesión mediante Firebase Authentication.
- Gestión de tareas: crear, consultar, completar y eliminar.
- Sincronización de tareas en tiempo real mediante Firestore.
- Panel principal con indicadores de tareas totales, pendientes y completadas.
- Envío de resumen de tareas por correo electrónico.
- Interfaz adaptable a diferentes dispositivos.
- Pruebas automatizadas con Vitest y React Testing Library.

## Tecnologías utilizadas

| Tecnología | Aplicación |
|---|---|
| React | Construcción de interfaces |
| TypeScript | Tipado estático |
| Vite | Entorno de desarrollo y compilación |
| Firebase Authentication | Autenticación de usuarios |
| Cloud Firestore | Persistencia de datos |
| AWS SES | Envío de correos electrónicos |
| Vercel | Despliegue y funciones serverless |
| Vitest | Pruebas automatizadas |
| React Testing Library | Pruebas de componentes |

## Arquitectura del proyecto

```text
MateCode/
├── api/
│   └── send-summary.ts
├── public/
├── src/
│   ├── assets/
│   ├── auth/
│   │   ├── AuthForm.tsx
│   │   ├── AuthForm.test.tsx
│   │   └── authService.ts
│   ├── lib/
│   │   └── firebase.ts
│   ├── tasks/
│   │   └── taskService.ts
│   ├── test/
│   │   └── setup.ts
│   ├── App.tsx
│   ├── App.test.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

## Requisitos previos

- Node.js.
- npm.
- Una cuenta de Firebase.
- Una cuenta de AWS con Amazon SES configurado.
- Una cuenta de Vercel.

## Instalación y ejecución local

1. Clonar el repositorio:

```bash
git clone https://github.com/jhovany50-lab/MateCode.git
```

2. Entrar al directorio:

```bash
cd MateCode
```

3. Instalar dependencias:

```bash
npm install
```

4. Configurar las variables de entorno en un archivo `.env.local`.

5. Iniciar el entorno de desarrollo:

```bash
npm run dev
```

## Variables de entorno

El proyecto incluye un archivo `.env.example` con las variables necesarias para configurar Firebase y AWS SES. Para iniciar el proyecto localmente, crea una copia de este archivo con el nombre `.env.local` y completa los valores correspondientes con tus propias credenciales. Nunca publiques el archivo `.env.local` en el repositorio.

La aplicación requiere las siguientes variables:

### Firebase

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### AWS SES

```env
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-2
SES_FROM_EMAIL=
```

Las variables de Firebase se utilizan en el cliente. Las credenciales de AWS deben permanecer exclusivamente en el entorno del servidor y nunca deben exponerse en el frontend ni subirse al repositorio.

## Base de datos y seguridad

MateCode utiliza Cloud Firestore para almacenar las tareas de cada usuario.

Las tareas se organizan mediante la siguiente estructura:

```text
users/
  {userId}/
    tasks/
      {taskId}
```

Las reglas de seguridad de Firestore restringen el acceso a las tareas para que cada usuario autenticado solamente pueda consultar y modificar sus propios registros.

## Envío de correos electrónicos

El envío de resúmenes se realiza mediante una función serverless ubicada en:

```text
api/send-summary.ts
```

La función utiliza AWS SES para enviar un correo con el resumen de actividades del usuario.

El servicio contempla:

- Validación del correo electrónico.
- Validación de la lista de tareas.
- Límite máximo de 100 tareas.
- Generación de contenido HTML y texto.
- Manejo de respuestas exitosas y errores.

## Pruebas automatizadas

El proyecto utiliza Vitest y React Testing Library.

Ejecutar todas las pruebas:

```bash
npm run test
```

Ejecutar las pruebas en modo observación:

```bash
npm run test:watch
```

Las pruebas verifican funcionalidades de autenticación, visualización del panel, gestión de tareas y envío de resúmenes por correo.

## Compilación y despliegue

Generar la versión de producción:

```bash
npm run build
```

Ejecutar una vista previa de producción:

```bash
npm run preview
```

Para desarrollar y probar las funciones serverless localmente se puede utilizar:

```bash
vercel dev
```

El despliegue de producción se realiza mediante Vercel, conectado al repositorio de GitHub.

## Despliegue

- **Repositorio GitHub:** https://github.com/jhovany50-lab/MateCode
- **Aplicación en producción:** [Agregar aquí la URL pública de Vercel]

## Uso responsable de inteligencia artificial

Durante el desarrollo de MateCode se utilizó inteligencia artificial como herramienta de apoyo para:

- Comprender conceptos de React, TypeScript y Firebase.
- Resolver dudas y analizar errores.
- Orientar la implementación de servicios y funciones.
- Diseñar y mejorar pruebas automatizadas.
- Revisar la documentación del proyecto.

Las propuestas generadas mediante inteligencia artificial fueron revisadas, probadas y adaptadas durante el desarrollo. Se buscó comprender el funcionamiento de cada componente y las decisiones técnicas implementadas.

## Autor

Proyecto Integrador - Módulo 4.

Desarrollado como parte del proceso de formación Full Stack.
