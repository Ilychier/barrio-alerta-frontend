/** Resultado paginado genérico de los repositorios (KISS: un solo tipo compartido). */
export interface PaginatedResult<T> {
  items: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
