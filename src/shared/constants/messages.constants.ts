export const getErrorMessage = (object?: string, id?: string) => ({
  create: `${object} successfully created`,
  notFound: id ? `${object} ${id} not found` : `${object} not found`,
  notProvided: `${object} is not provided`,
  emailAlreadyExists: 'Email already in use',
  inputDataInvalid: `Input data is not provided or invalid`,
})
