import { Ciudad } from '../../../domain/mascotas/entities/Ciudad';
import { TipoMascota } from '../../../domain/mascotas/entities/TipoMascota';
import { IMascotaReferenciaRepository } from '../../../domain/mascotas/ports/IMascotaReferenciaRepository';
import { buildCiudadMap, buildDepartamentoMap, buildTipoMascotaMap } from '../services/catalogos';

export interface ReferenciasMascota {
  ciudades: Ciudad[];
  tiposMascota: TipoMascota[];
  /** ciudadId → nombre (ej: "Cali") */
  ciudadMap: Map<number, string>;
  /** ciudadId → departamento (ej: "Valle del Cauca") */
  departamentoMap: Map<number, string>;
  /** tipoMascotaId → nombre (ej: "Perro") */
  tipoMascotaMap: Map<number, string>;
}

/**
 * Carga los catálogos del BC Mascotas (ciudades + tipos) y construye
 * los mapas de lookup para resolver nombres en el feed (KISS — evita N+1).
 * Los datos geográficos cambian muy rara vez; el controller cachea el resultado.
 */
export class ObtenerReferenciasMascotaUseCase {
  constructor(private readonly referenciaRepo: IMascotaReferenciaRepository) {}

  async execute(): Promise<ReferenciasMascota> {
    const [ciudades, tiposMascota] = await Promise.all([
      this.referenciaRepo.getCiudadesTodas(),
      this.referenciaRepo.getTiposMascota(),
    ]);

    return {
      ciudades,
      tiposMascota,
      ciudadMap: buildCiudadMap(ciudades),
      departamentoMap: buildDepartamentoMap(ciudades),
      tipoMascotaMap: buildTipoMascotaMap(tiposMascota),
    };
  }
}
