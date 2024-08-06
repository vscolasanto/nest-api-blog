import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process'
import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository'
import { UpdateAuthorUsecase } from './update-author.usecase'
import { AuthorDataBuilder } from '../helpers/author-data-builder'
import { BadRequestError } from '@/shared/errors/bad-request-error'
import { ConflictError } from '@/shared/errors/conflict-error'

describe('UpdateAuthorUsecase Integration Tests', () => {
  let module: TestingModule
  let repository: AuthorsPrismaRepository
  let usecase: UpdateAuthorUsecase.Usecase
  const prisma = new PrismaClient()

  beforeAll(async () => {
    execSync('npm run prisma:migrate:test')
    await prisma.$connect()
    module = await Test.createTestingModule({}).compile()
    repository = new AuthorsPrismaRepository(prisma as any)
    usecase = new UpdateAuthorUsecase.Usecase(repository)
  })

  beforeEach(async () => {
    await prisma.author.deleteMany()
  })

  afterAll(async () => {
    await module.close()
  })

  test('should return BadRequestError if id is not provided', async () => {
    const data = AuthorDataBuilder({})
    const authorWithoutName = { ...data, id: null }

    try {
      await usecase.execute(authorWithoutName)
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError)
      expect(error.message).toBe('Id is not provided')
    }
  })

  test('should return ConflictError if email provided already exists', async () => {
    const data = AuthorDataBuilder({ email: 'a@a.com' })
    await prisma.author.create({ data })
    const secondAuthor = await prisma.author.create({
      data: AuthorDataBuilder({}),
    })
    secondAuthor.email = 'a@a.com'

    try {
      await usecase.execute(secondAuthor)
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictError)
      expect(error.message).toBe('Email address already in use')
    }
  })

  test('should update an author', async () => {
    const data = AuthorDataBuilder({})
    expect(data).not.toHaveProperty('id')
    const author = await prisma.author.create({ data })
    const result = await usecase.execute({
      ...author,
      name: 'edited name',
      email: 'editedemail@a.com',
    })
    expect(result.name).toBe('edited name')
    expect(result.email).toBe('editedemail@a.com')
  })
})
