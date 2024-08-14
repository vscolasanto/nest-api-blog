import { Field } from '@nestjs/graphql'

export class Post {
  @Field()
  id: string

  @Field()
  title: string

  @Field()
  content: string

  @Field()
  slug: string

  @Field()
  authorId: string

  @Field(() => Boolean)
  published: boolean

  @Field()
  createdAt: Date
}
