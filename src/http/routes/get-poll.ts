import fastify, { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'

const app = fastify()

// busca de uma enquete
export async function getPoll(app: FastifyInstance) {
    // validação do ID com o zod
    app.get('/polls/:pollId', async (req, res) => {
        const getPollParams = z.object({
            pollId: z.string().uuid()
        })

        const { pollId } = getPollParams.parse(req.params)
        // retornando a enquete buscada
        const poll = await prisma.poll.findUnique({
           where: {
            id: pollId,
           },
           // incluindo as opções de voto da enquete
           include: {
            options: {
                select: {
                    id: true,
                    title: true
                }
            }
           }
        })

        return res.status(200).send({ poll })
    })
}


