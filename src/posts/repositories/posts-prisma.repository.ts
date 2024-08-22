import { PrismaService } from '@/database/prisma/prisma.service'
import { Post } from '../graphql/models/post'
import { PostsRepository } from '../interfaces/posts.repository'
import { NotFoundError } from '@/shared/errors/not-found-error'
import { getErrorMessage } from '@/shared/constants/messages.constants'

export class PostsPrismaRepository implements PostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Omit<Post, 'id'>): Promise<Post> {
    return await this.prisma.post.create({ data })
  }

  update(post: Post): Promise<Post> {
    throw new Error('Method not implemented.')
  }

  async findById(id: string): Promise<Post> {
    return this.get(id)
  }

  findBySlug(slug: string): Promise<Post> {
    throw new Error('Method not implemented.')
  }

  async get(id: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({ where: { id } })
    if (!post) {
      throw new NotFoundError(getErrorMessage('Post', id).notFound)
    }
    return post
  }
}
