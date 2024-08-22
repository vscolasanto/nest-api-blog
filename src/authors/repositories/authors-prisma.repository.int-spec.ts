import { Test, TestingModule } from '@nestjs/testing'
import { AuthorsPrismaRepository } from './authors-prisma.repository'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process'
import { NotFoundError } from '@/shared/errors/not-found-error'
import { AuthorDataBuilder } from '../helpers/author-data-builder'
import { getErrorMessage } from '@/shared/constants/messages.constants'

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
        new NotFoundError(getErrorMessage('Author', uuid).notFound),
      )
    })

    test('should find an author by id', async () => {
      const data = AuthorDataBuilder({})
      const author = await prisma.author.create({ data })
      const result = await repository.findById(author.id)
      expect(result).toStrictEqual(author)
    })
  })

  describe('create method', () => {
    test('should create an author', async () => {
      const data = AuthorDataBuilder({})
      const author = await repository.create(data)
      expect(author).toMatchObject(data)
    })
  })

  describe('update method', () => {
    test('should throw not found error when trying to update an author that is not found', async () => {
      const data = AuthorDataBuilder({})
      const author = {
        id: '76d94a09-46a7-4cf5-be68-e8528e510f37',
        ...data,
      }
      await expect(repository.update(author)).rejects.toThrow(
        new NotFoundError(getErrorMessage('Author', author.id).notFound),
      )
    })

    test('should update an author', async () => {
      const data = AuthorDataBuilder({})
      const author = await prisma.author.create({ data })
      await repository.update({ ...author, name: 'new name' })
      const filteredAuthor = await prisma.author.findUnique({
        where: { id: author.id },
      })
      expect(filteredAuthor.name).toBe('new name')
    })
  })

  describe('delete method', () => {
    test('should throw not found error when trying to delete an author that is not found', async () => {
      const uuid = '76d94a09-46a7-4cf5-be68-e8528e510f37'
      await expect(repository.delete(uuid)).rejects.toThrow(
        new NotFoundError(getErrorMessage('Author', uuid).notFound),
      )
    })

    test('should delete an author', async () => {
      const data = AuthorDataBuilder({})
      const author = await prisma.author.create({ data })
      const foundAuthor = await prisma.author.findUnique({
        where: { id: author.id },
      })
      expect(foundAuthor).not.toBeNull()
      await repository.delete(author.id)
      const deletedAuthor = await prisma.author.findUnique({
        where: { id: author.id },
      })
      expect(deletedAuthor).toBeNull()
    })
  })

  describe('findByEmail method', () => {
    test('should return null when an author is not found by email', async () => {
      const author = await repository.findByEmail('author@a.com')
      expect(author).toBeNull()
    })

    test('should return an author by email', async () => {
      const data = {
        ...AuthorDataBuilder({}),
        email: 'author@a.com',
      }
      const authorBeforeCreate = await repository.findByEmail('author@a.com')
      expect(authorBeforeCreate).toBeNull()
      await prisma.author.create({ data })
      const authorAfterCreate = await repository.findByEmail('author@a.com')
      expect(authorAfterCreate).not.toBeNull()
    })
  })

  describe('search method', () => {
    test('should apply default params when params are not provided', async () => {
      const createdAt = new Date()
      const data = []
      const arrange = Array(16).fill(AuthorDataBuilder({}))
      arrange.forEach((element, index) => {
        const timestamp = createdAt.getTime() + index
        data.push({
          ...element,
          email: `author${index}@a.com`,
          createdAt: new Date(timestamp),
        })
      })

      await prisma.author.createMany({ data })
      const result = await repository.search({})
      expect(result.total).toBe(16)
      expect(result.items.length).toBe(15)
      result.items.forEach(item => {
        expect(item.id).toBeDefined()
      })
      result.items.reverse().forEach((item, index) => {
        expect(item.email).toEqual(`author${index + 1}@a.com`)
      })
    })

    test('should apply pagination and ordering', async () => {
      const createdAt = new Date()
      const data = []
      const arrange = 'gbafecd'
      arrange.split('').forEach((element, index) => {
        const timestamp = createdAt.getTime() + index
        data.push({
          ...AuthorDataBuilder({ name: element }),
          email: `author${index}@a.com`,
          createdAt: new Date(timestamp),
        })
      })

      await prisma.author.createMany({ data })
      const page1 = await repository.search({
        page: 1,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
      })
      expect(page1.items[0]).toMatchObject(data[2])
      expect(page1.items[1]).toMatchObject(data[1])

      const page2 = await repository.search({
        page: 2,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
      })
      expect(page2.items[0]).toMatchObject(data[5])
      expect(page2.items[1]).toMatchObject(data[6])

      const page3 = await repository.search({
        page: 3,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
      })
      expect(page3.items[0]).toMatchObject(data[4])
      expect(page3.items[1]).toMatchObject(data[3])

      const page4 = await repository.search({
        page: 4,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
      })
      expect(page4.items[0]).toMatchObject(data[0])
    })

    test('should apply pagination, filtering and ordering', async () => {
      const createdAt = new Date()
      const data = []
      const arrange = ['test', 'a', 'TEST', 'b', 'Test']
      arrange.forEach((element, index) => {
        const timestamp = createdAt.getTime() + index
        data.push({
          ...AuthorDataBuilder({ name: element }),
          email: `author${index}@a.com`,
          createdAt: new Date(timestamp),
        })
      })

      await prisma.author.createMany({ data })
      const page1 = await repository.search({
        page: 1,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
        filter: 'TEST',
      })
      expect(page1.items[0]).toMatchObject(data[0])
      expect(page1.items[1]).toMatchObject(data[4])

      const page2 = await repository.search({
        page: 2,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
        filter: 'TEST',
      })
      expect(page2.items[0]).toMatchObject(data[2])
      expect(page2.items.length).toBe(1)
    })
  })
})
