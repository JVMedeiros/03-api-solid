import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'
import { ResourceNotFoundError } from './errors/resource-not-found'
import { GetUserProfileUseCase } from './get-user-profile'

let usersRepository: InMemoryUsersRepository
let sut: GetUserProfileUseCase

describe('Get User Profile Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new GetUserProfileUseCase(usersRepository)
  })
  it('Should be able to get user Profile', async () => {
    const createdUser = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6)
    })
    const { user } = await sut.execute({
      userId: createdUser.id
    })

    expect(user.id).toEqual(expect.any(String))
    expect(user.name).toEqual('John Doe')

  })

  it('Should not be able to get user profile with wrong ID', async () => {
    expect(() => sut.execute({
      userId: 'non-existing-id'
    })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})