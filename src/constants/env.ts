const REPOSITORY_TYPE_KEY = 'EXPO_PUBLIC_REPOSITORY_TYPE';
const DEFAULT_REPOSITORY = 'memory';

export type RepositoryType = 'memory' | 'api';

export function getRepositoryType(): RepositoryType {
  const value =
    (typeof process !== 'undefined' && (process.env as Record<string, string | undefined>)[REPOSITORY_TYPE_KEY]) ||
    DEFAULT_REPOSITORY;

  if (value !== 'memory' && value !== 'api') {
    return DEFAULT_REPOSITORY;
  }
  return value;
}
