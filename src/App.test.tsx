
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
        expect(screen.getByText('Tu espacio está listo')).toBeInTheDocument()
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
            'Estudiar JavaScript',
            ''
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
                    description: 'Practicar funciones y arreglos',
                    completed: false,
                }
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
                    description: 'Practicar funciones y arreglos',
                    completed: false,
                }
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

    it('muestra un mensaje cuando falla el envío del resumen', async () => {
        const user = userEvent.setup()

        vi.mocked(observeAuthState).mockImplementation((callback) => {
            callback({
                uid: 'usuario-prueba-123',
                email: 'prueba@matecode.com',
                getIdToken: vi.fn().mockResolvedValue('token-prueba'),
            } as never)
            return vi.fn()
        })

        vi.mocked(getTasks).mockReturnValue(vi.fn())

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                json: async () => ({
                    message: 'No fue posible enviar el resumen por correo.',
                }),
            })
        )

        render(<App />)

        await user.click(
            screen.getByRole('button', {
                name: /enviar resumen por correo/i,
            })
        )

        expect(
            await screen.findByRole('status')
        ).toHaveTextContent(
            'No fue posible enviar el resumen por correo.'
        )

        expect(fetch).toHaveBeenCalledWith(
            '/api/send-summary',
            expect.objectContaining({
                method: 'POST',
            })
        )

        vi.unstubAllGlobals()

    })

    it('muestra un mensaje cuando el resumen se envía correctamente', async () => {
        const user = userEvent.setup()

        vi.mocked(observeAuthState).mockImplementation((callback) => {
            callback({
                uid: 'usuario-prueba-123',
                email: 'prueba@matecode.com',
                getIdToken: vi.fn().mockResolvedValue('token-prueba'),
            } as never)
            return vi.fn()
        })

        vi.mocked(getTasks).mockReturnValue(vi.fn())

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    message: 'Resumen enviado correctamente.',
                }),
            })
        )

        render(<App />)

        await user.click(
            screen.getByRole('button', {
                name: /enviar resumen por correo/i,
            })
        )

        expect(await screen.findByRole('status')).toHaveTextContent(
            '¡Resumen enviado correctamente a tu correo!'
        )

        vi.unstubAllGlobals()
    })

    it('muestra el estado de carga mientras envía el resumen', async () => {
        const user = userEvent.setup()

        vi.mocked(observeAuthState).mockImplementation((callback) => {
            callback({
                uid: 'usuario-prueba-123',
                email: 'prueba@matecode.com',
                getIdToken: vi.fn().mockResolvedValue('token-prueba'),
            } as never)
            return vi.fn()
        })

        vi.mocked(getTasks).mockReturnValue(vi.fn())

        let resolveFetch!: (value: unknown) => void

        vi.stubGlobal(
            'fetch',
            vi.fn().mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolveFetch = resolve
                    })
            )
        )

        render(<App />)

        const sendButton = screen.getByRole('button', {
            name: /enviar resumen por correo/i,
        })

        await user.click(sendButton)

        expect(screen.getByRole('button', {
            name: /enviando/i,
        })).toBeDisabled()

        resolveFetch({
            ok: true,
            json: async () => ({
                message: 'Resumen enviado correctamente.',
            }),
        })

        expect(await screen.findByRole('status')).toHaveTextContent(
            '¡Resumen enviado correctamente a tu correo!'
        )

        vi.unstubAllGlobals()
    })
})