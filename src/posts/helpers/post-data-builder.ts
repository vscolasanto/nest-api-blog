import { faker } from '@faker-js/faker'
import { Post } from '../graphql/models/post'

export function PostDataBuilder(
  props: Partial<Post>,
): Omit<Post, 'id' | 'authorId'> {
  return {
    title: props.title ?? faker.lorem.sentence(),
    content: props.content ?? faker.lorem.paragraph(),
    slug: props.slug ?? faker.lorem.slug(),
    published: props.published ?? false,
    createdAt: props.createdAt ?? new Date(),
  }
}
