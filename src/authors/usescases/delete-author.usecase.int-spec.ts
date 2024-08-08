import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process'
import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository'
import { DeleteAuthorUsecase } from './delete-author.usecase'
import { AuthorDataBuilder } from '../helpers/author-data-builder'
import { BadRequestError } from '@/shared/errors/bad-request-error'
import { NotFoundError } from '@/shared/errors/not-found-error'

describe('DeleteAuthorUsecase Integration Tests', () => {
  let module: TestingModule
  let repository: AuthorsPrismaRepository
  let usecase: DeleteAuthorUsecase.Usecase
  const prisma = new PrismaClient()

  beforeAll(async () => {
    execSync('npm run prisma:migrate:test')
    await prisma.$connect()
    module = await Test.createTestingModule({}).compile()
    repository = new AuthorsPrismaRepository(prisma as any)
    usecase = new DeleteAuthorUsecase.Usecase(repository)
  })

  beforeEach(async () => {
    await prisma.author.deleteMany()
  })

  afterAll(async () => {
    await module.close()
  })

  test('should throw badRequestError when id is not provided', async () => {
    try {
      const input = { id: null }
      await usecase.execute(input)
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError)
      expect(error.message).toBe('Id should be provided')
    }
  })

  test('should throw badRequestError when id is not found', async () => {
    const input = { id: '2a4cc9bb-2f7a-4698-9045-f72f4a171f19' }
    try {
      await usecase.execute(input)
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError)
      expect(error.message).toBe(`Author not found using ID: ${input.id}`)
    }
  })

  test('should delete an author', async () => {
    const data = AuthorDataBuilder({})
    const author = await prisma.author.create({ data })
    expect(author).toStrictEqual(author)
    expect(author).not.toBeNull()
    await usecase.execute({ id: author.id })
    const authorAfterDeleteFromDb = await prisma.author.findUnique({
      where: { id: author.id },
    })
    expect(authorAfterDeleteFromDb).toBeNull()
    const authors = await prisma.author.findMany()
    expect(authors.length).toBe(0)
  })
})
