import fastify, { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { randomUUID } from 'node:crypto'

const app = fastify()

// voto em uma enquete
export async function voteOnPoll(app: FastifyInstance) {

    app.post('/polls/:pollId/votes', async (req, res) => {
        // opção de voto do usuário - '/votes'
        const voteOnPollBody = z.object({
            pollOptionId: z.string().uuid(),
        })
        // url da enquete - '/:pollId'
        const voteOnPollParams = z.object({
            pollId: z.string().uuid()
        })

        const { pollOptionId } = voteOnPollBody.parse(req.body)
        const { pollId } = voteOnPollParams.parse(req.params)

        // buscando a session ID do usuário nos cookies
        let sessionId = req.cookies.sessionId

        // caso não exista - criamos uma
        if (!sessionId) {
            sessionId = randomUUID()

            // definindo o cookie para o usuário
            res.setCookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 30,
                signed: true,
                httpOnly: true,
            })
        }

        return res.status(201).send({ sessionId })
    })
}


