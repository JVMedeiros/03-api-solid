import fastifyJwt from "@fastify/jwt"
import fastifyCookie from "@fastify/cookie"
import fastify, { FastifyError, FastifyReply, FastifyRequest } from "fastify"
import { ZodError } from "zod"
import { env } from "./env"
import { checkInsRoutes } from "./http/controllers/check-ins/routes"
import { gymsRoutes } from "./http/controllers/gyms/routes"
import { userRoutes } from "./http/controllers/users/routes"

export const app = fastify()

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'refreshToken',
    signed: false
  },
  sign: {
    expiresIn: '10m',
  }
})
app.register(fastifyCookie)

app.register(userRoutes)
app.register(gymsRoutes)
app.register(checkInsRoutes)



app.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error.', issues: error.format })
  }

  if (env.NODE_ENV !== 'production') {
    console.log(error)
  }

  return reply.status(500).send('Internal Server Error')
})