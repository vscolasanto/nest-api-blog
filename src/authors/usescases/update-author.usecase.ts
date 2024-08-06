import { BadRequestError } from '@/shared/errors/bad-request-error'
import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository'
import { ConflictError } from '@/shared/errors/conflict-error'
import { IUsecase } from '@/shared/interfaces/usecase.interface'
import { AuthorOutput } from '../dt/author-output.dto'
import { Author } from '../graphql/models/author'

export namespace UpdateAuthorUsecase {
  type Input = Partial<Author>
  type Output = AuthorOutput
  export class Usecase implements IUsecase<Input, Output> {
    constructor(private authorsRepository: AuthorsPrismaRepository) {}

    async execute(input: Input): Promise<Output> {
      const { id, name, email } = input
      if (!id) {
        throw new BadRequestError(`Id is not provided`)
      }
      const author = await this.authorsRepository.findById(id)
      if (email) {
        const emailExists = await this.authorsRepository.findByEmail(email)
        if (emailExists && emailExists.id !== id) {
          throw new ConflictError(`Email address already in use`)
        }
        author.email = email
      }
      if (name) {
        author.name = name
      }
      return await this.authorsRepository.update(author)
    }
  }
}
