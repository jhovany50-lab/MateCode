import { useState, useEffect, type FormEvent } from 'react'
import type { User } from 'firebase/auth'
import { logoutUser, observeAuthState } from './auth/authService'
import AuthForm from './auth/AuthForm'
import './App.css'
import {
  addTask,
  getTasks,
  updateTask,
  removeTask,
  type Task,
} from './tasks/taskService'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  useEffect(() => {
    if (!user) return

    const unsubscribe = getTasks(user.uid, (updatedTasks) => {
      setTasks(updatedTasks)
    })

    return unsubscribe
  }, [user])

  useEffect(() => {
    const unsubscribe = observeAuthState((currentUser) => {
      setUser(currentUser)
      setCheckingAuth(false)
    })

    return unsubscribe
  }, [])

  const [showTaskForm, setShowTaskForm] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const completedTasks = tasks.filter((task) => task.completed).length
  const pendingTasks = tasks.length - completedTasks

  async function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const title = String(formData.get('title') ?? '').trim()

    if (!title || !user) return

    await addTask(user.uid, title)

    setShowTaskForm(false)
  }

  async function handleToggleTask(taskId: string) {
    if (!user) return

    const task = tasks.find((item) => item.id === taskId)

    if (!task) return

    await updateTask(user.uid, taskId, !task.completed)
  }

  async function handleDeleteTask(taskId: string) {
    if (!user) return

    await removeTask(user.uid, taskId)
  }


  if (checkingAuth) {
    return <p>Comprobando sesión...</p>
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">M</span>
          <span>MateCode</span>
        </div>

        <nav className="navigation">
          <a href="#" className="nav-link active">
            <span>▦</span>
            Panel principal
          </a>

          <a href="#" className="nav-link">
            <span>✓</span>
            Mis tareas
          </a>

          <a href="#" className="nav-link">
            <span>⚙</span>
            Configuración
          </a>
        </nav>

        <div className="sidebar-footer">
          <span className="avatar">U</span>
          <div>
            <strong>Mi cuenta</strong>
            <small>Espacio de trabajo</small>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">GESTIÓN DE TRABAJO</p>
            <h1>Panel principal</h1>
          </div>

          <button
            className="profile-button"
            type="button"
            onClick={async () => {
              await logoutUser()
            }}
          >
            Cerrar sesión
          </button>
        </header>

        <section className="welcome-section">
          <p className="eyebrow">TU ESPACIO DE TRABAJO</p>
          <h2>¡Bienvenido a MateCode!</h2>
          <p>
            Organiza tus tareas y mantén tus proyectos en movimiento.
          </p>
        </section>

        <section className="summary-grid" aria-label="Resumen de tareas">
          <article className="summary-card">
            <span className="summary-label">Total de tareas</span>
            <strong className="summary-number">{tasks.length}</strong>
            <span className="summary-note">Tareas registradas</span>
          </article>

          <article className="summary-card">
            <span className="summary-label">Pendientes</span>
            <strong className="summary-number">{pendingTasks}</strong>
            <span className="summary-note">Por completar</span>
          </article>

          <article className="summary-card">
            <span className="summary-label">Completadas</span>
            <strong className="summary-number">{completedTasks}</strong>
            <span className="summary-note">Trabajo realizado</span>
          </article>
        </section>

        <section className="tasks-section">
          {showTaskForm && (
            <form className="task-form" onSubmit={handleAddTask}>
              <label htmlFor="task-title">Título de la tarea</label>
              <input
                id="task-title"
                name="title"
                type="text"
                placeholder="Ej. Preparar informe"
              />
              <button className="primary-button" type="submit">
                Guardar tarea
              </button>
            </form>
          )}

          <div className="section-heading">
            <div>
              <h2>Mis tareas</h2>
              <p>Aquí podrás consultar y organizar tu trabajo.</p>
            </div>

            <button
              className="primary-button"
              type="button"
              onClick={() => setShowTaskForm(true)}
            >
              + Nueva tarea
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">✓</span>
              <h3>Tu espacio está listo</h3>
              <p>
                Cuando agregues una tarea, aparecerá aquí.
              </p>
            </div>
          ) : (
            <ul className="task-list">
              {tasks.map((task) => (
                <li
                  className={`task-item${task.completed ? ' completed' : ''}`}
                  key={task.id}
                >
                  <div className="task-content">
                    <label className="task-label">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task.id)}
                      />
                      <span>{task.title}</span>
                    </label>

                    <button
                      className="delete-button"
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      Eliminar
                    </button>

                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}

export default App