const DEFAULT_REPOSITORY = 'memory';

export type RepositoryType = 'memory' | 'api';

export function getRepositoryType(): RepositoryType {
  const apiUrl =
    typeof process !== 'undefined' ? process.env.EXPO_PUBLIC_API_URL : undefined;

  // Si hay una API URL configurada, usamos modo api
  if (apiUrl) {
    return 'api';
  }

  return DEFAULT_REPOSITORY;
}
