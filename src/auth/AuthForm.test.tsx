
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import AuthForm from './AuthForm'

import { registerUser, loginUser } from './authService'

vi.mock('./authService', () => ({
    registerUser: vi.fn(),
    loginUser: vi.fn(),
}))

beforeEach(() => {
    vi.clearAllMocks()
})

describe('AuthForm', () => {
    it('muestra correctamente el formulario de inicio de sesión', () => {
        render(<AuthForm />)

        expect(screen.getByText('MateCode')).toBeInTheDocument()
        expect(screen.getByText('Iniciar sesión')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Crear una cuenta' })).toBeInTheDocument()
    })

    it('permite cambiar al formulario de registro', async () => {
        const { default: userEvent } = await import('@testing-library/user-event')
        const user = userEvent.setup()

        render(<AuthForm />)

        await user.click(
            screen.getByRole('button', { name: 'Crear una cuenta' })
        )

        expect(screen.getByText('Crear cuenta')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Registrarme' })).toBeInTheDocument()
    })

    it('registra un usuario con su correo y contraseña', async () => {
        const { default: userEvent } = await import('@testing-library/user-event')
        const user = userEvent.setup()

        render(<AuthForm />)

        await user.click(
            screen.getByRole('button', { name: 'Crear una cuenta' })
        )

        await user.type(
            screen.getByPlaceholderText('Correo electrónico'),
            'prueba@matecode.com'
        )

        await user.type(
            screen.getByPlaceholderText('Contraseña'),
            '123456'
        )

        await user.click(
            screen.getByRole('button', { name: 'Registrarme' })
        )

        expect(registerUser).toHaveBeenCalledWith(
            'prueba@matecode.com',
            '123456'
        )
    })

    it('inicia sesión con correo y contraseña', async () => {
        const { default: userEvent } = await import('@testing-library/user-event')
        const user = userEvent.setup()

        render(<AuthForm />)

        await user.type(
            screen.getByPlaceholderText('Correo electrónico'),
            'prueba@matecode.com'
        )

        await user.type(
            screen.getByPlaceholderText('Contraseña'),
            '123456'
        )

        await user.click(
            screen.getByRole('button', { name: 'Entrar' })
        )

        expect(loginUser).toHaveBeenCalledWith(
            'prueba@matecode.com',
            '123456'
        )
    })

    it('muestra un mensaje cuando falla el inicio de sesión', async () => {
        const { default: userEvent } = await import('@testing-library/user-event')
        const user = userEvent.setup()

        vi.mocked(loginUser).mockRejectedValueOnce(
            new Error('Credenciales incorrectas')
        )

        render(<AuthForm />)

        await user.type(
            screen.getByPlaceholderText('Correo electrónico'),
            'prueba@matecode.com'
        )

        await user.type(
            screen.getByPlaceholderText('Contraseña'),
            '123456'
        )

        await user.click(
            screen.getByRole('button', { name: 'Entrar' })
        )

        expect(
            await screen.findByRole('alert')
        ).toHaveTextContent(
            'No fue posible completar la operación. Verifica tus datos.'
        )
    })
})
