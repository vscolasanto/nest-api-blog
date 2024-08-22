import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process'
import { NotFoundError } from '@/shared/errors/not-found-error'
import { PostsPrismaRepository } from './posts-prisma.repository'
import { PostDataBuilder } from '../helpers/post-data-builder'
import { AuthorDataBuilder } from '@/authors/helpers/author-data-builder'
import { getErrorMessage } from '@/shared/constants/messages.constants'

describe('PostsPrismaRepository Integration Tests', () => {
  let module: TestingModule
  let repository: PostsPrismaRepository
  const prisma = new PrismaClient()

  beforeAll(async () => {
    execSync('npm run prisma:migrate:test')
    await prisma.$connect()
    module = await Test.createTestingModule({}).compile()
    repository = new PostsPrismaRepository(prisma as any)
  })

  beforeEach(async () => {
    await prisma.post.deleteMany()
    await prisma.author.deleteMany()
  })

  afterAll(async () => {
    await module.close()
  })

  describe('findById method', () => {
    test('should throw not found error when id is not found', async () => {
      const uuid = '76d94a09-46a7-4cf5-be68-e8528e510f37'
      await expect(repository.findById(uuid)).rejects.toThrow(
        new NotFoundError(getErrorMessage('Post', uuid).notFound),
      )
    })

    test('should find a post by id', async () => {
      const postData = PostDataBuilder({})
      const authorData = AuthorDataBuilder({})
      const author = await prisma.author.create({ data: authorData })
      const post = await prisma.post.create({
        data: {
          ...postData,
          author: {
            connect: { ...author },
          },
        },
      })
      const result = await repository.findById(post.id)
      expect(result).toStrictEqual(post)
    })
  })

  describe('create method', () => {
    it('should create a post', async () => {
      const postData = PostDataBuilder({})
      const authorData = AuthorDataBuilder({})
      const author = await prisma.author.create({ data: authorData })
      const result = await repository.create({
        ...postData,
        authorId: author.id,
      })
      expect(result).toMatchObject(postData)
    })
  })
})
