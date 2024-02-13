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

        if (sessionId) {
            const userPreviousVoteOnPoll = await prisma.vote.findUnique({
                where: {
                    sessionId_pollId: {
                        sessionId,
                        pollId,
                    },
                }
            })
            //se usuário quer mudar o voto
            if (userPreviousVoteOnPoll && userPreviousVoteOnPoll.pollOptionId != pollOptionId) {
                //apagar o voto
                await prisma.vote.delete({
                    where: {
                        id: userPreviousVoteOnPoll.id,
                    }
                })
            } else if (userPreviousVoteOnPoll){
                return res.status(400).send({ message: "You already voted on this poll!"})
            }
        }


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
        // cria o voto
        await prisma.vote.create({
            data: {
                sessionId,
                pollId,
                pollOptionId
            }
        })

        return res.status(201).send()
    })
}


