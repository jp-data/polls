import fastify, { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'

const app = fastify()

// criação de uma enquete
export async function createPoll(app: FastifyInstance) {
    
    app.post('/polls', async (req, res) => {
        // validação dos dados com o zod
        const createPollBody = z.object({
            title: z.string(),
            options: z.array(z.string()),
        })

        const { title, options } = createPollBody.parse(req.body)
        // criação da enquete
        const poll = await prisma.poll.create({
            data: {
                title,
                options: {
                    createMany: {
                        data: options.map(option => {
                            return { title: option }
                        }),
                    }
                },
            }
        })

        return res.status(201).send({ pollId: poll.id })
    })
}


