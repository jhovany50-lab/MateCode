
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { getAdminAuth } from './firebaseAdmin.js'

type SummaryTask = {
    title: string
    completed: boolean
}

const ses = new SESClient({
    region: process.env.AWS_REGION || 'us-east-2',
})

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    if (request.method !== 'POST') {
        return response.status(405).json({
            message: 'Método no permitido',
        })
    }

    const authorization = request.headers.authorization

    if (!authorization?.startsWith('Bearer ')) {
        return response.status(401).json({
            message: 'No estás autenticado.',
        })
    }

    const idToken = authorization.slice(7).trim()

    if (!idToken) {
        return response.status(401).json({
            message: 'El token de autenticación está vacío.',
        })
    }

    let decodedToken

    try {
        decodedToken = await getAdminAuth().verifyIdToken(idToken)
    } catch {
        return response.status(401).json({
            message: 'Tu sesión no es válida o ha expirado.',
        })
    }
    const email = decodedToken.email

    if (!email) {
        return response.status(403).json({
            message: 'Tu cuenta no tiene un correo electrónico asociado.',
        })
    }
    const { tasks } = request.body ?? {}

    if (
        typeof email !== 'string' ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        return response.status(400).json({
            message: 'El correo electrónico no es válido.',
        })
    }

    if (
        !Array.isArray(tasks) ||
        !tasks.every(
            (task: unknown) =>
                typeof task === 'object' &&
                task !== null &&
                'title' in task &&
                'completed' in task &&
                typeof task.title === 'string' &&
                task.title.trim().length > 0 &&
                task.title.length <= 200 &&
                typeof task.completed === 'boolean'
        )
    ) {
        return response.status(400).json({
            message: 'La lista de tareas no es válida.',
        })
    }

    const summaryTasks = tasks as SummaryTask[]

    if (summaryTasks.length > 100) {
        return response.status(400).json({
            message: 'El resumen supera el límite de tareas permitido.',
        })
    }

    const pending = summaryTasks.filter((task) => !task.completed)
    const completed = summaryTasks.filter((task) => task.completed)

    const taskList = summaryTasks
        .map(
            (task) =>
                `${task.completed ? '[Completada]' : '[Pendiente]'} ${task.title}`
        )
        .join('\n')

    const htmlTasks = summaryTasks
        .map(
            (task) =>
                `<li>${task.completed ? '✅' : '⏳'} ${escapeHtml(task.title)}</li>`
        )
        .join('')

    const sender = process.env.SES_FROM_EMAIL

    if (!sender) {
        return response.status(500).json({
            message: 'No está configurado el correo remitente.',
        })
    }

    try {
        const command = new SendEmailCommand({
            Source: sender,
            Destination: {
                ToAddresses: [email],
            },
            Message: {
                Subject: {
                    Data: 'Tu resumen de tareas - MateCode',
                    Charset: 'UTF-8',
                },
                Body: {
                    Text: {
                        Data: `Resumen de MateCode

Total de tareas: ${summaryTasks.length}
Pendientes: ${pending.length}
Completadas: ${completed.length}

${taskList}`,
                        Charset: 'UTF-8',
                    },
                    Html: {
                        Data: `
              <h1>Resumen de MateCode</h1>
              <p>Total de tareas: ${summaryTasks.length}</p>
              <p>Pendientes: ${pending.length}</p>
              <p>Completadas: ${completed.length}</p>
              <h2>Mis tareas</h2>
              <ul>${htmlTasks}</ul>
            `,
                        Charset: 'UTF-8',
                    },
                },
            },
        })

        await ses.send(command)

        return response.status(200).json({
            message: 'Resumen enviado correctamente.',
        })
    } catch (error) {
        console.error('Error al enviar el resumen:', error)

        return response.status(500).json({
            message: 'No fue posible enviar el resumen por correo.',
        })
    }
}
