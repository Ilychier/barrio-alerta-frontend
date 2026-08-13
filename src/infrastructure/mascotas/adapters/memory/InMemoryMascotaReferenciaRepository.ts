import { Ciudad } from '../../../../domain/mascotas/entities/Ciudad';
import { TipoMascota } from '../../../../domain/mascotas/entities/TipoMascota';
import { IMascotaReferenciaRepository } from '../../../../domain/mascotas/ports/IMascotaReferenciaRepository';
import { PaginatedResult } from '../../../../domain/ports/PaginatedResult';

const CIUDADES: Ciudad[] = [
  new Ciudad(1, 'Bogotá', 'Bogotá', 'Colombia'),
  new Ciudad(2, 'Medellín', 'Antioquia', 'Colombia'),
  new Ciudad(3, 'Cali', 'Valle del Cauca', 'Colombia'),
  new Ciudad(4, 'Quibdó', 'Chocó', 'Colombia'),
  new Ciudad(5, 'Barranquilla', 'Atlántico', 'Colombia'),
  new Ciudad(6, 'Cartagena', 'Bolívar', 'Colombia'),
];

const TIPOS: TipoMascota[] = [
  new TipoMascota(1, 'Perro', true),
  new TipoMascota(2, 'Gato', true),
  new TipoMascota(3, 'Otro', true),
];

export class InMemoryMascotaReferenciaRepository implements IMascotaReferenciaRepository {
  async getCiudades(page: number, size: number): Promise<PaginatedResult<Ciudad>> {
    const start = page * size;
    return {
      items: CIUDADES.slice(start, start + size),
      totalElements: CIUDADES.length,
      totalPages: Math.max(1, Math.ceil(CIUDADES.length / size)),
      page,
      size,
    };
  }

  async getCiudadesTodas(): Promise<Ciudad[]> {
    return CIUDADES;
  }

  async getTiposMascota(): Promise<TipoMascota[]> {
    return TIPOS;
  }
}
