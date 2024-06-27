export class InvalidCredentialsError extends Error {
  constructor() {
    super('Email e/ou senha inválidos.')
  }
}