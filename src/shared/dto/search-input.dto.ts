export type SearchInput = {
  page?: number | null
  perPage?: number | null
  filter?: string | null
  sort?: string | null
  sortDir?: 'asc' | 'desc' | null
}
