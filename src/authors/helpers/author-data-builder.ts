import { faker } from '@faker-js/faker'
import { Author } from '../graphql/models/author'

export function AuthorDataBuilder(props: Partial<Author>): Omit<Author, 'id'> {
  return {
    name: props.name || faker.person.fullName(),
    email: props.email || faker.internet.email(),
    createdAt: props.createdAt || new Date(),
  }
}
