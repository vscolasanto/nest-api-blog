import { Test, TestingModule } from '@nestjs/testing'
import { AuthorsPrismaRepository } from './authors-prisma.repository'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process'
import { NotFoundError } from '@/shared/errors/not-found-error'
import { AuthorDataBuilder } from '../helpers/author-data-builder'

describe('AuthorsPrismaRepository Integration Tests', () => {
  let module: TestingModule
  let repository: AuthorsPrismaRepository
  const prisma = new PrismaClient()

  beforeAll(async () => {
    execSync('npm run prisma:migrate:test')
    await prisma.$connect()
    module = await Test.createTestingModule({}).compile()
    repository = new AuthorsPrismaRepository(prisma as any)
  })

  beforeEach(async () => {
    await prisma.author.deleteMany()
  })

  afterAll(async () => {
    await module.close()
  })

  describe('should test findById method', () => {
    test('should throws not found error when id is not found', async () => {
      const uuid = '76d94a09-46a7-4cf5-be68-e8528e510f37'
      expect(repository.findById(uuid)).rejects.toThrow(
        new NotFoundError(`Author not found using ID: ${uuid}`),
      )
    })

    test('should find an author by id', async () => {
      const data = AuthorDataBuilder({})
      const author = await prisma.author.create({ data })
      const result = await repository.findById(author.id)
      expect(result).toStrictEqual(author)
    })
  })

  describe('should test create method', () => {
    test('should create an author', async () => {
      const data = AuthorDataBuilder({})
      const author = await repository.create(data)
      expect(author).toMatchObject(data)
    })
  })
})
