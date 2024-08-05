export interface IUsecase<Input, Output> {
  execute(input: Input): Promise<Output>
}
