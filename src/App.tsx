import { useState, useEffect, type FormEvent } from 'react'
import { type User } from 'firebase/auth'
import { logoutUser, observeAuthState } from './auth/authService'
import AuthForm from './auth/AuthForm'
import './App.css'
import {
  addTask,
  getTasks,
  updateTask,
  editTask,
  removeTask,
  type Task,
} from './tasks/taskService'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [activeSection, setActiveSection] = useState<'dashboard' | 'tasks'>('dashboard')
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  useEffect(() => {
    if (!user) return

    const unsubscribe = getTasks(user.uid, (updatedTasks) => {
      setTasks(updatedTasks)
    })

    return unsubscribe
  }, [user, setTasks])

  useEffect(() => {
    const unsubscribe = observeAuthState((currentUser) => {
      setUser(currentUser)
      setSummaryMessage('')
      setSummaryError(false)
      setSendingSummary(false)
      setCheckingAuth(false)
    })

    return unsubscribe
  }, [])

  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingDescription, setEditingDescription] = useState('')
  const [sendingSummary, setSendingSummary] = useState(false)
  const [summaryMessage, setSummaryMessage] = useState('')
  const [summaryError, setSummaryError] = useState(false)
  const completedTasks = tasks.filter((task) => task.completed).length
  const pendingTasks = tasks.length - completedTasks

  async function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const title = String(formData.get('title') ?? '').trim()
    const description = String(formData.get('description') ?? '').trim()

    if (!title || !user) return

    await addTask(user.uid, title, description)

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

  async function handleSaveEdit() {
    if (!user || !editingTaskId) return

    const title = editingTitle.trim()
    const description = editingDescription.trim()

    if (!title) return

    await editTask(user.uid, editingTaskId, title, description)

    setEditingTaskId(null)
    setEditingTitle('')
    setEditingDescription('')
  }

  async function handleSendSummary() {
    if (!user) return

    setSendingSummary(true)
    setSummaryMessage('')
    setSummaryError(false)

    try {
      const idToken = await user.getIdToken()

      const response = await fetch('/api/send-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          tasks: tasks.map((task) => ({
            title: task.title,
            completed: task.completed,
          })),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'No fue posible enviar el resumen.')
      }

      setSummaryMessage('¡Resumen enviado correctamente a tu correo!')
    } catch (error) {
      setSummaryError(true)
      setSummaryMessage(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al enviar el resumen.'
      )
    } finally {
      setSendingSummary(false)
    }
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
          <a
            href="#dashboard"
            className={`nav-link ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={(event) => {
              event.preventDefault()
              setActiveSection('dashboard')
            }}
          >
            <span>▦</span>
            Panel principal
          </a>

          <a
            href="#tasks"
            className={`nav-link ${activeSection === 'tasks' ? 'active' : ''}`}
            onClick={(event) => {
              event.preventDefault()
              setActiveSection('tasks')
            }}
          >
            <span>✓</span>
            Mis tareas
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

      <main id="dashboard" className="main-content">
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

        {activeSection === 'dashboard' && (
          <>
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
          </>
        )}

        {activeSection === 'tasks' && (

          <section id="tasks" className="tasks-section">
            {showTaskForm && (
              <form className="task-form" onSubmit={handleAddTask}>
                <label htmlFor="task-title">Título de la tarea</label>
                <input
                  id="task-title"
                  name="title"
                  type="text"
                  placeholder="Ej. Preparar informe"
                  required
                />

                <label htmlFor="task-description">Descripción</label>
                <textarea
                  id="task-description"
                  name="description"
                  placeholder="Describe brevemente qué necesitas hacer..."
                  rows={3}
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

              <div className="section-actions">
                <button
                  className="primary-button"
                  type="button"
                  onClick={handleSendSummary}
                  disabled={sendingSummary}
                >
                  {sendingSummary ? 'Enviando...' : 'Enviar resumen por correo'}
                </button>

                <button
                  className="primary-button"
                  type="button"
                  onClick={() => setShowTaskForm(true)}
                >
                  + Nueva tarea
                </button>
              </div>
            </div>

            {summaryMessage && (
              <p
                role="status"
                aria-live="polite"
                style={{ color: summaryError ? 'red' : 'green' }}
              >
                {summaryMessage}
              </p>
            )}


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
                        {editingTaskId === task.id ? (
                          <div className="edit-task-fields">
                            <input
                              type="text"
                              className="edit-task-input"
                              value={editingTitle}
                              onChange={(event) => setEditingTitle(event.target.value)}
                              autoFocus
                              onFocus={(event) => {
                                event.currentTarget.setSelectionRange(0, 0)
                                event.currentTarget.scrollLeft = 0
                              }}
                            />

                            <textarea
                              className="edit-task-description"
                              value={editingDescription}
                              onChange={(event) => setEditingDescription(event.target.value)}
                              placeholder="Descripción de la tarea"
                              rows={3}
                            />
                          </div>
                        ) : (
                          <div className="task-display">
                            <strong>{task.title}</strong>
                            {task.description && (
                              <p>{task.description}</p>
                            )}
                          </div>
                        )}
                      </label>

                      {editingTaskId === task.id ? (
                        <>
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                          >
                            Guardar
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingTaskId(null)
                              setEditingTitle('')
                            }}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTaskId(task.id)
                            setEditingTitle(task.title)
                            setEditingDescription(task.description ?? '')
                          }}
                        >
                          Editar
                        </button>
                      )}

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
        )}
      </main>
    </div>
  )
}

export default App