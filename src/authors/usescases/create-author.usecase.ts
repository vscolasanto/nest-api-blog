import { BadRequestError } from '@/shared/errors/bad-request-error'
import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository'
import { ConflictError } from '@/shared/errors/conflict-error'
import { IUsecase } from '@/shared/interfaces/usecase.interface'

export namespace CreateAuthorUsecase {
  type Base = {
    name: string
    email: string
  }

  export type Input = Base

  export type Output = Base & {
    id: string
    createdAt: Date
  }

  export class Usecase implements IUsecase<Input, Output> {
    constructor(private authorsRepository: AuthorsPrismaRepository) {}

    async execute(input: Input): Promise<Output> {
      const { name, email } = input
      if (
        !name ||
        !email ||
        typeof name !== 'string' ||
        typeof email !== 'string'
      ) {
        throw new BadRequestError(`Input data is not provided or invalid`)
      }
      const emailExists = await this.authorsRepository.findByEmail(email)
      if (emailExists) {
        throw new ConflictError(`Email address already in use`)
      }
      const author = await this.authorsRepository.create(input)
      return author
    }
  }
}
