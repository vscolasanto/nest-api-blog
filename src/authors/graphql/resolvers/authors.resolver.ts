import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Author } from '../models/author'
import { ListAuthorsUsecase } from '@/authors/usescases/list-authors.usecase'
import { Inject } from '@nestjs/common'
import { SearchParamsArgs } from '../args/search-params.args'
import { SearchAuthorResult } from '../models/search-author-result'
import { CreateAuthorUsecase } from '@/authors/usescases/create-author.usecase'
import { CreateAuthorInput } from '../inputs/create-author.input'

@Resolver(() => Author)
export class AuthorsResolver {
  @Inject(ListAuthorsUsecase.Usecase)
  private listAuthorsUsecase: ListAuthorsUsecase.Usecase

  @Inject(CreateAuthorUsecase.Usecase)
  private createAuthorUsecase: CreateAuthorUsecase.Usecase

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

  @Mutation(() => Author)
  createAuthor(@Args('data') data: CreateAuthorInput) {
    return this.createAuthorUsecase.execute(data)
  }
}
