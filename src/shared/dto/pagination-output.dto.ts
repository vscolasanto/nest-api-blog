export type PaginationOutput<Items = any> = {
  items?: Items[]
  total?: number
  currentPage?: number
  perPage?: number
  lastPage?: number
}
