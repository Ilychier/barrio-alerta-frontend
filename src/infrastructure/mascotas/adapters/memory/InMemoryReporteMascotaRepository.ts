import { ReporteMascota } from '../../../../domain/mascotas/entities/ReporteMascota';
import { EstadoReporte } from '../../../../domain/mascotas/entities/EstadoReporte';
import { TipoReporte } from '../../../../domain/mascotas/entities/TipoReporte';
import {
  IReporteMascotaRepository,
  CrearReporteMascotaCommand,
  ActualizarReporteMascotaCommand,
  FiltrosReporteMascota,
} from '../../../../domain/mascotas/ports/IReporteMascotaRepository';
import { PaginatedResult } from '../../../../domain/ports/PaginatedResult';

/**
 * Repositorio en memoria para desarrollo/demo (modo sin API).
 * Replica los estados del backend: ACTIVE/RESCUED/DELETED, soft delete,
 * feed público con filtros, historias de rescate, mis reportes.
 */
export class InMemoryReporteMascotaRepository implements IReporteMascotaRepository {
  private reportes: ReporteMascota[];
  private nextId = 100;

  constructor() {
    this.reportes = [
      new ReporteMascota(1, TipoReporte.LOST, 1, null, null, 1, 'Barrio La Soledad, cerca al parque', '+573173784522', 'Perro criollo, collar rojo, responde al nombre Toby', EstadoReporte.ACTIVE, '2026-08-10T09:30:00', '2026-08-10T09:30:00', 32),
      new ReporteMascota(2, TipoReporte.FOUND, 1, null, null, 1, 'Calle 5 con carrera 10, junto al CAI', '+573173784522', 'Perro adulto color miel, sin collar', EstadoReporte.ACTIVE, '2026-08-10T11:00:00', '2026-08-10T11:00:00', 502),
      new ReporteMascota(3, TipoReporte.LOST, 2, null, null, 1, 'Conjunto Villa del Prado, torre 3', '+573173784522', 'Gata negra de ojos verdes, esterilizada', EstadoReporte.RESCUED, '2026-08-09T14:00:00', '2026-08-10T08:00:00', 32),
      new ReporteMascota(4, TipoReporte.FOUND, 2, null, null, 1, 'Parque Central, banca junto al kiosco', '+573173784522', 'Gato gris atigrado, muy manso', EstadoReporte.RESCUED, '2026-08-08T16:30:00', '2026-08-09T10:00:00', 502),
      new ReporteMascota(5, TipoReporte.LOST, 1, null, null, 2, 'El Poblado, avenida Las Vegas', '+573173784522', 'Golden retriever, collar azul', EstadoReporte.ACTIVE, '2026-08-11T07:00:00', '2026-08-11T07:00:00', 32),
    ];
  }

  // ============ PÚBLICOS ============

  async listarPublico(
    filtros: FiltrosReporteMascota,
    page: number,
    size: number,
  ): Promise<PaginatedResult<ReporteMascota>> {
    let items = this.reportes.filter((r) => r.estado !== EstadoReporte.DELETED);
    if (filtros.estado) items = items.filter((r) => r.estado === filtros.estado);
    if (filtros.tipoReporte) items = items.filter((r) => r.tipoReporte === filtros.tipoReporte);
    if (filtros.ciudadId) items = items.filter((r) => r.ciudadId === filtros.ciudadId);
    items = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return this.paginate(items, page, size);
  }

  async listarRescatados(page: number, size: number): Promise<PaginatedResult<ReporteMascota>> {
    const items = this.reportes
      .filter((r) => r.estado === EstadoReporte.RESCUED)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return this.paginate(items, page, size);
  }

  async obtenerPublico(id: number): Promise<ReporteMascota | undefined> {
    const reporte = this.reportes.find((r) => r.id === id);
    return reporte && reporte.estado !== EstadoReporte.DELETED ? reporte : undefined;
  }

  // ============ AUTENTICADOS ============

  async crear(command: CrearReporteMascotaCommand): Promise<ReporteMascota> {
    const now = new Date().toISOString();
    const nuevo = new ReporteMascota(
      this.nextId++,
      command.tipoReporte,
      command.tipoMascotaId,
      command.otroTipoMascota ?? null,
      command.fotoUri ?? null,
      command.ciudadId,
      command.ubicacion,
      command.telefono,
      command.descripcion ?? null,
      EstadoReporte.ACTIVE,
      now,
      now,
      command.usuarioId,
    );
    this.reportes.push(nuevo);
    return nuevo;
  }

  async listarMios(usuarioId: number, page: number, size: number): Promise<PaginatedResult<ReporteMascota>> {
    const items = this.reportes
      .filter((r) => r.usuarioId === usuarioId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return this.paginate(items, page, size);
  }

  async obtenerPorId(id: number): Promise<ReporteMascota | undefined> {
    return this.reportes.find((r) => r.id === id);
  }

  async actualizar(id: number, command: ActualizarReporteMascotaCommand): Promise<ReporteMascota> {
    const index = this.reportes.findIndex((r) => r.id === id);
    if (index === -1) throw new Error(`ReporteMascota not found with id: ${id}`);
    const actual = this.reportes[index];
    const actualizado = new ReporteMascota(
      actual.id,
      actual.tipoReporte,
      actual.tipoMascotaId,
      actual.otroTipoMascota,
      actual.fotoUrl,
      actual.ciudadId,
      command.ubicacion,
      command.telefono,
      command.descripcion ?? actual.descripcion,
      actual.estado,
      actual.createdAt,
      new Date().toISOString(),
      actual.usuarioId,
    );
    this.reportes[index] = actualizado;
    return actualizado;
  }

  async cambiarEstado(id: number, estado: EstadoReporte): Promise<ReporteMascota> {
    const index = this.reportes.findIndex((r) => r.id === id);
    if (index === -1) throw new Error(`ReporteMascota not found with id: ${id}`);
    if (this.reportes[index].estado === EstadoReporte.DELETED) {
      throw new Error('No se puede cambiar el estado de un reporte eliminado');
    }
    const actual = this.reportes[index];
    const actualizado = new ReporteMascota(
      actual.id,
      actual.tipoReporte,
      actual.tipoMascotaId,
      actual.otroTipoMascota,
      actual.fotoUrl,
      actual.ciudadId,
      actual.ubicacion,
      actual.telefono,
      actual.descripcion,
      estado,
      actual.createdAt,
      new Date().toISOString(),
      actual.usuarioId,
    );
    this.reportes[index] = actualizado;
    return actualizado;
  }

  async eliminar(id: number): Promise<void> {
    await this.cambiarEstado(id, EstadoReporte.DELETED);
  }

  // ============ helpers ============

  private paginate(items: ReporteMascota[], page: number, size: number): PaginatedResult<ReporteMascota> {
    const start = page * size;
    return {
      items: items.slice(start, start + size),
      totalElements: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / size)),
      page,
      size,
    };
  }
}
