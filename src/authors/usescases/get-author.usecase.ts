import { BadRequestError } from '@/shared/errors/bad-request-error'
import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository'
import { IUsecase } from '@/shared/interfaces/usecase.interface'
import { AuthorOutput } from '../dt/author-output.dto'

export namespace GetAuthorUsecase {
  type Input = {
    id: string
  }

  export type Output = AuthorOutput

  export class Usecase implements IUsecase<Input, Output> {
    constructor(private authorsRepository: AuthorsPrismaRepository) {}

    async execute(input: Input): Promise<Output> {
      const { id } = input
      if (!id) throw new BadRequestError('Id should be provided')
      const author = await this.authorsRepository.findById(id)
      return author
    }
  }
}
