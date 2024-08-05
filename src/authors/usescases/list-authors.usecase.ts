import { BadRequestError } from '@/shared/errors/bad-request-error'
import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository'
import { IUsecase } from '@/shared/interfaces/usecase.interface'
import { AuthorOutput } from '../dt/author-output.dto'
import { SearchInput } from '@/shared/dto/search-input.dto'
import { PaginationOutput } from '@/shared/dto/pagination-output.dto'

export namespace ListAuthorsUsecase {
  type Input = SearchInput

  export type Output = PaginationOutput<AuthorOutput>

  export class Usecase implements IUsecase<Input, Output> {
    constructor(private authorsRepository: AuthorsPrismaRepository) {}

    async execute(input: Input): Promise<Output> {
      const searchResult = await this.authorsRepository.search(input)
      const { items, total, perPage, currentPage, lastPage } = searchResult
      return { items, total, currentPage, perPage, lastPage }
    }
  }
}
