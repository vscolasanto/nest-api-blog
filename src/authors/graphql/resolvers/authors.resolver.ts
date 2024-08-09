import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Author } from '../models/author'
import { ListAuthorsUsecase } from '@/authors/usescases/list-authors.usecase'
import { Inject } from '@nestjs/common'
import { SearchParamsArgs } from '../args/search-params.args'
import { SearchAuthorResult } from '../models/search-author-result'
import { CreateAuthorUsecase } from '@/authors/usescases/create-author.usecase'
import { CreateAuthorInput } from '../inputs/create-author.input'
import { GetAuthorUsecase } from '@/authors/usescases/get-author.usecase'
import { AuthorIdArgs } from '../args/author-id.args'
import { UpdateAuthorUsecase } from '@/authors/usescases/update-author.usecase'
import { UpdateAuthorInput } from '../inputs/update-author.input'
import { DeleteAuthorUsecase } from '@/authors/usescases/delete-author.usecase'

@Resolver(() => Author)
export class AuthorsResolver {
  @Inject(ListAuthorsUsecase.Usecase)
  private listAuthorsUsecase: ListAuthorsUsecase.Usecase

  @Inject(GetAuthorUsecase.Usecase)
  private getAuthorUsecase: GetAuthorUsecase.Usecase

  @Inject(CreateAuthorUsecase.Usecase)
  private createAuthorUsecase: CreateAuthorUsecase.Usecase

  @Inject(UpdateAuthorUsecase.Usecase)
  private updateAuthorUsecase: UpdateAuthorUsecase.Usecase

  @Inject(DeleteAuthorUsecase.Usecase)
  private deleteAuthorUsecase: DeleteAuthorUsecase.Usecase

  @Query(() => SearchAuthorResult)
  async authors(
    @Args() { page, perPage, filter, sort, sortDir }: SearchParamsArgs,
  ) {
    return await this.listAuthorsUsecase.execute({
      page,
      perPage,
      filter,
      sort,
      sortDir,
    })
  }

  @Query(() => Author)
  async getAuthorById(@Args() { id }: AuthorIdArgs) {
    return this.getAuthorUsecase.execute({ id })
  }

  @Mutation(() => Author)
  async createAuthor(@Args('data') data: CreateAuthorInput) {
    return this.createAuthorUsecase.execute(data)
  }

  @Mutation(() => Author)
  async UpdateAuthor(
    @Args() { id }: AuthorIdArgs,
    @Args('data') data: UpdateAuthorInput,
  ) {
    return this.updateAuthorUsecase.execute({ id, ...data })
  }

  @Mutation(() => Author)
  async deleteAuthor(@Args() { id }: AuthorIdArgs) {
    return this.deleteAuthorUsecase.execute({ id })
  }
}
