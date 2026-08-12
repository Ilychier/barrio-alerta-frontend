import { IReferenciaRepository, PaginatedResult } from '../../../domain/ports/IReferenciaRepository';
import { Usuario } from '../../../domain/entities/usuario';
import { Barrio } from '../../../domain/entities/barrio';
import { Cuadrante } from '../../../domain/entities/cuadrante';
import { Categoria } from '../../../domain/entities/categoria';
import { CategoriaDescripcion } from '../../../domain/entities/categoriaDescripcion';
import { Localidad } from '../../../domain/entities/localidad';

const INITIAL_CUADRANTES: Cuadrante[] = [
  new Cuadrante(101, 'CAI Soacha Centro', '+57 310 555 0123', 'cai.soacha.centro@test.com'),
  new Cuadrante(102, 'CAI Compartir', '+57 312 444 9876', 'cai.compartir@test.com'),
];

const INITIAL_LOCALIDADES: Localidad[] = [
  new Localidad(1, 'Castilla', 2),
  new Localidad(2, 'El Poblado', 2),
  new Localidad(3, 'Usaquén', 5),
];

const INITIAL_BARRIOS: Barrio[] = [
  new Barrio(1, 'Soacha Centro', 101, 1),
  new Barrio(2, 'Compartir', 102, 2),
];

const INITIAL_USUARIOS: Usuario[] = [
  new Usuario(32, 'Carlos Mendoza', 'carlos.mendoza@email.com', 1),
  new Usuario(502, 'Ana María Silva', 'ana.silva@email.com', 1),
];

const INITIAL_CATEGORIAS: Categoria[] = [
  new Categoria(10, 'Sospechoso', 'AlertTriangle'),
  new Categoria(11, 'Robo', 'ShieldAlert'),
  new Categoria(12, 'Urgencia Médica', 'Activity'),
  new Categoria(13, 'Incendio', 'Flame'),
];

export class InMemoryReferenciaRepository implements IReferenciaRepository {
  private readonly cuadrantes: Cuadrante[] = INITIAL_CUADRANTES;
  private readonly localidades: Localidad[] = INITIAL_LOCALIDADES;
  private readonly barrios: Barrio[] = INITIAL_BARRIOS;
  private readonly usuarios: Usuario[] = INITIAL_USUARIOS;
  private readonly categorias: Categoria[] = INITIAL_CATEGORIAS;

  async getUsuarioById(id: number): Promise<Usuario | undefined> {
    return this.usuarios.find((u) => u.id === id);
  }

  async getBarrioById(id: number): Promise<Barrio | undefined> {
    return this.barrios.find((b) => b.id === id);
  }

  async getBarrios(): Promise<Barrio[]> {
    return this.barrios;
  }

  async getLocalidadesByMunicipio(municipioId: number): Promise<Localidad[]> {
    return this.localidades.filter((l) => l.municipioId === municipioId);
  }

  async getBarriosPaginated(page: number, size: number, localidadId?: number): Promise<PaginatedResult<Barrio>> {
    const filtrados = localidadId ? this.barrios.filter((b) => b.localidadId === localidadId) : this.barrios;
    const start = page * size;
    const items = filtrados.slice(start, start + size);
    return {
      items,
      totalElements: filtrados.length,
      totalPages: Math.ceil(filtrados.length / size),
      page,
      size,
    };
  }

  async getCuadranteById(id: number): Promise<Cuadrante | undefined> {
    return this.cuadrantes.find((c) => c.id === id);
  }

  async getCategorias(): Promise<Categoria[]> {
    return this.categorias;
  }

  async getCategoriaById(id: number): Promise<Categoria | undefined> {
    return this.categorias.find((c) => c.id === id);
  }

  async getDescripcionesPorCategoria(categoriaId: number): Promise<CategoriaDescripcion[]> {
    const presets: Record<number, { descripciones: string[]; imagen: string }> = {
      10: {
        descripciones: ['Persona merodeando negocios', 'Vehículo sin placas sospechoso', 'Intento de intrusión vecinal'],
        imagen: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&auto=format&fit=crop',
      },
      11: {
        descripciones: ['Asalto a mano armada', 'Hurto de autopartes', 'Robo a vivienda en proceso'],
        imagen: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=500&auto=format&fit=crop',
      },
      12: {
        descripciones: ['Accidente de tránsito grave', 'Persona inconsciente', 'Crisis de salud en vía pública'],
        imagen: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=500&auto=format&fit=crop',
      },
      13: {
        descripciones: ['Fuego en vivienda vecinal', 'Cortocircuito de cableado público', 'Fuga de gas con llamas'],
        imagen: 'https://images.unsplash.com/photo-1508873699372-7aeab60b44ab?w=500&auto=format&fit=crop',
      },
    };

    const preset = presets[categoriaId];
    if (!preset) return [];

    return preset.descripciones.map((desc, idx) => ({
      id: categoriaId * 100 + idx,
      descripcion: desc,
      categoriaId,
      imagenUrl: preset.imagen,
    }));
  }
}
