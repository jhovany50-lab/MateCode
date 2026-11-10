
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

vi.mock('./auth/authService', () => ({
    observeAuthState: vi.fn(),
    logoutUser: vi.fn(),
}))

vi.mock('./tasks/taskService', () => ({
    getTasks: vi.fn(),
    addTask: vi.fn(),
    updateTask: vi.fn(),
    removeTask: vi.fn(),
}))

import { observeAuthState } from './auth/authService'
import { getTasks } from './tasks/taskService'
import {
    addTask,
    updateTask,
    removeTask,
} from './tasks/taskService'

import userEvent from '@testing-library/user-event'

beforeEach(() => {
    vi.clearAllMocks()
})

describe('App', () => {
    it('muestra el formulario cuando no hay un usuario autenticado', () => {
        vi.mocked(observeAuthState).mockImplementation((callback) => {
            callback(null)
            return vi.fn()
        })

        render(<App />)

        expect(screen.getByText('Iniciar sesión')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument()
    })

    it('muestra el dashboard cuando existe un usuario autenticado', () => {
        const mockUser = {
            uid: 'usuario-prueba-123',
        }

        vi.mocked(observeAuthState).mockImplementation((callback) => {
            callback(mockUser as never)
            return vi.fn()
        })

        vi.mocked(getTasks).mockReturnValue(vi.fn())

        render(<App />)

        expect(
            screen.getByRole('heading', {
                name: 'Panel principal',
                level: 1,
            })
        ).toBeInTheDocument()
        expect(screen.getByText('¡Bienvenido a MateCode!')).toBeInTheDocument()
        expect(getTasks).toHaveBeenCalledWith(
            'usuario-prueba-123',
            expect.any(Function)
        )
    })
    it('agrega una nueva tarea', async () => {
        const user = userEvent.setup()

        vi.mocked(observeAuthState).mockImplementation((callback) => {
            callback({ uid: 'usuario-prueba-123' } as never)
            return vi.fn()
        })

        vi.mocked(getTasks).mockReturnValue(vi.fn())

        render(<App />)

        await user.click(screen.getByRole('button', { name: /nueva tarea/i }))

        const input = screen.getByPlaceholderText('Ej. Preparar informe')

        await user.type(input, 'Estudiar JavaScript')

        await user.click(screen.getByRole('button', { name: /guardar tarea/i }))

        expect(addTask).toHaveBeenCalledWith(
            'usuario-prueba-123',
            'Estudiar JavaScript'
        )
    })

    it('marca una tarea como completada', async () => {
        const user = userEvent.setup()

        vi.mocked(observeAuthState).mockImplementation((callback) => {
            callback({ uid: 'usuario-prueba-123' } as never)
            return vi.fn()
        })

        vi.mocked(getTasks).mockImplementation((_userId, callback) => {
            callback([
                {
                    id: 'tarea-123',
                    title: 'Estudiar JavaScript',
                    completed: false,
                },
            ])
            return vi.fn()
        })

        render(<App />)

        const checkbox = screen.getByRole('checkbox')

        await user.click(checkbox)

        expect(updateTask).toHaveBeenCalledWith(
            'usuario-prueba-123',
            'tarea-123',
            true
        )
    })

    it('elimina una tarea', async () => {
        const user = userEvent.setup()

        vi.mocked(observeAuthState).mockImplementation((callback) => {
            callback({ uid: 'usuario-prueba-123' } as never)
            return vi.fn()
        })

        vi.mocked(getTasks).mockImplementation((_userId, callback) => {
            callback([
                {
                    id: 'tarea-123',
                    title: 'Estudiar JavaScript',
                    completed: false,
                },
            ])
            return vi.fn()
        })

        render(<App />)

        await user.click(screen.getByRole('button', { name: /eliminar/i }))

        expect(removeTask).toHaveBeenCalledWith(
            'usuario-prueba-123',
            'tarea-123'
        )
    })
})