import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { Decimal } from '@prisma/client/runtime/library'
import { compare } from 'bcryptjs'
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest'
import { CheckInUseCase } from './check-in'
import { MaxDistanceError } from './errors/max-distance-error'
import { MaxNumberOfCheckInsError } from './errors/max-number-of-check-ins-error'

let checkInsRepository: InMemoryCheckInsRepository
let gymsRepository: InMemoryGymsRepository
let sut: CheckInUseCase

describe('Check In Use Case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    sut = new CheckInUseCase(checkInsRepository, gymsRepository)

    vi.useFakeTimers()

    await gymsRepository.create({
      id: 'gym-01',
      title: 'JavaScript Academy',
      description: '',
      phone: '',
      latitude: -23.1782073,
      longitude: -45.8184834
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('Should be able to check in', async () => {
    const { checkIn } = await sut.execute({
      userId: 'user-01',
      gymId: 'gym-01',
      userLatitude: -23.1782073,
      userLongitude: -45.8184834
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('Should not be able to check in twice in the same day', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))

    await sut.execute({
      userId: 'user-o1',
      gymId: 'gym-01',
      userLatitude: -23.1782073,
      userLongitude: -45.8184834
    })

    expect(() => sut.execute({
      userId: 'user-o1',
      gymId: 'gym-01',
      userLatitude: -23.1782073,
      userLongitude: -45.8184834
    })).rejects.toBeInstanceOf(MaxNumberOfCheckInsError)
  })

  it('Should be able to check in twice but in different days', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))

    await sut.execute({
      userId: 'user-o1',
      gymId: 'gym-01',
      userLatitude: -23.1782073,
      userLongitude: -45.8184834
    })

    vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0))
    const { checkIn } = await sut.execute({
      userId: 'user-o1',
      gymId: 'gym-01',
      userLatitude: -23.1782073,
      userLongitude: -45.8184834
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('Should not be able to check in on a distant gym', async () => {
    gymsRepository.items.push({
      id: 'gym-02',
      title: 'JavaScript Gym',
      description: '',
      phone: '',
      latitude: new Decimal(-23.1764729),
      longitude: new Decimal(-45.82812),
    })

    await expect(() =>
      sut.execute({
        gymId: 'gym-02',
        userId: 'user-01',
        userLatitude: -23.1782073,
        userLongitude: -45.8184834
      }),
    ).rejects.toBeInstanceOf(MaxDistanceError)


  })

})