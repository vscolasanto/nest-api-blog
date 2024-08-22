import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process'
import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository'
import { CreateAuthorUsecase } from './create-author.usecase'
import { AuthorDataBuilder } from '../helpers/author-data-builder'
import { BadRequestError } from '@/shared/errors/bad-request-error'
import { ConflictError } from '@/shared/errors/conflict-error'
import { getErrorMessage } from '@/shared/constants/messages.constants'

describe('CreateAuthorUsecase Integration Tests', () => {
  let module: TestingModule
  let repository: AuthorsPrismaRepository
  let usecase: CreateAuthorUsecase.Usecase
  const prisma = new PrismaClient()

  beforeAll(async () => {
    execSync('npm run prisma:migrate:test')
    await prisma.$connect()
    module = await Test.createTestingModule({}).compile()
    repository = new AuthorsPrismaRepository(prisma as any)
    usecase = new CreateAuthorUsecase.Usecase(repository)
  })

  beforeEach(async () => {
    await prisma.author.deleteMany()
  })

  afterAll(async () => {
    await module.close()
  })

  test('should return BadRequestError if name is not provided', async () => {
    const data = AuthorDataBuilder({})
    const authorWithoutName = { ...data, name: null }

    try {
      await usecase.execute(authorWithoutName)
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError)
      expect(error.message).toBe(getErrorMessage().inputDataInvalid)
    }
  })

  test('should return badRequestError if email is not provided', async () => {
    const data = AuthorDataBuilder({})
    const authorWithourEmail = { ...data, email: null }
    try {
      await usecase.execute(authorWithourEmail)
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError)
      expect(error.message).toBe(getErrorMessage().inputDataInvalid)
    }
  })

  test('should return ConflictError if email provided already exists', async () => {
    const data = AuthorDataBuilder({})
    const author = { ...data, email: 'a@a.com' }
    await usecase.execute(author)

    try {
      const existingAuthor = await repository.findByEmail(author.email)
      expect(existingAuthor).toBeDefined()
      const newData = AuthorDataBuilder({})
      const authorWithSameEmail = { ...newData, email: 'a@a.com' }
      await usecase.execute(authorWithSameEmail)
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictError)
      expect(error.message).toBe(getErrorMessage().emailAlreadyExists)
    }
  })

  test('should create an author', async () => {
    const data = AuthorDataBuilder({})
    expect(data).not.toHaveProperty('id')
    const author = await usecase.execute(data)
    expect(author).toHaveProperty('id')
    expect(author).toMatchObject(data)
    expect(author.id).toBeDefined()
    expect(author.createdAt).toBeInstanceOf(Date)
  })
})
