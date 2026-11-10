
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    if (request.method !== 'POST') {
        return response.status(405).json({
            message: 'Método no permitido',
        })
    }

    return response.status(200).json({
        message: 'Función de envío preparada correctamente',
    })
}
