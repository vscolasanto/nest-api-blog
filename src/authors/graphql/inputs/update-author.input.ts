import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsOptional, IsString } from 'class-validator'

@InputType()
export class UpdateAuthorInput {
  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  name: string

  @IsString()
  @IsOptional()
  @IsEmail()
  @Field({ nullable: true })
  email: string
}
