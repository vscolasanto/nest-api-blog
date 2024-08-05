import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process'
import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository'
import { ListAuthorsUsecase } from './list-authors.usecase'
import { AuthorDataBuilder } from '../helpers/author-data-builder'

describe('ListAuthorsUsecase Integration Tests', () => {
  let module: TestingModule
  let repository: AuthorsPrismaRepository
  let usecase: ListAuthorsUsecase.Usecase
  const prisma = new PrismaClient()

  beforeAll(async () => {
    execSync('npm run prisma:migrate:test')
    await prisma.$connect()
    module = await Test.createTestingModule({}).compile()
    repository = new AuthorsPrismaRepository(prisma as any)
    usecase = new ListAuthorsUsecase.Usecase(repository)
  })

  beforeEach(async () => {
    await prisma.author.deleteMany()
  })

  afterAll(async () => {
    await module.close()
  })

  test('should apply default params when params are not provided', async () => {
    const createAt = new Date()
    const data = []
    const arrange = Array(3).fill(AuthorDataBuilder({}))
    arrange.forEach((element, index) => {
      const timestamp = createAt.getTime() + index
      data.push({
        ...element,
        email: `a${index}@a.com`,
        createdAt: new Date(timestamp),
      })
    })

    await prisma.author.createMany({ data })

    const result = await usecase.execute({})

    // Não inverta a ordem dos dados
    expect(result).toMatchObject({
      items: data.reverse(),
      total: 3,
      currentPage: 1,
      perPage: 15,
      lastPage: 1,
    })
  })

  test('should apply pagination, filtering and ordering', async () => {
    const createAt = new Date()
    const data = []
    const arrange = ['test', 'a', 'TEST', 'b', 'Test']
    arrange.forEach((element, index) => {
      const timestamp = createAt.getTime() + index
      data.push({
        ...AuthorDataBuilder({ name: element }),
        email: `author${index}@a.com`,
        createdAt: new Date(timestamp),
      })
    })

    await prisma.author.createMany({ data })
    const page1 = await usecase.execute({
      page: 1,
      perPage: 2,
      sort: 'name',
      sortDir: 'asc',
      filter: 'TEST',
    })
    expect(page1.items[0]).toMatchObject(data[0])
    expect(page1.items[1]).toMatchObject(data[4])
    expect(page1).toMatchObject({
      items: [data[0], data[4]],
      total: 3,
      currentPage: 1,
      perPage: 2,
      lastPage: 2,
    })

    const page2 = await usecase.execute({
      page: 2,
      perPage: 2,
      sort: 'name',
      sortDir: 'asc',
      filter: 'TEST',
    })
    expect(page2.items[0]).toMatchObject(data[2])
    expect(page2.items.length).toBe(1)
    expect(page2).toMatchObject({
      items: [data[2]],
      total: 3,
      currentPage: 2,
      perPage: 2,
      lastPage: 2,
    })
  })
})
