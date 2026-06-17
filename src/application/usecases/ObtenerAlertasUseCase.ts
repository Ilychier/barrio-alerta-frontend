import { IAlertaRepository } from '../../domain/ports/IAlertaRepository';
import { IConfiguracionRepository } from '../../domain/ports/IConfiguracionRepository';
import { IReferenciaRepository } from '../../domain/ports/IReferenciaRepository';
import { Alerta } from '../../domain/entities/alerta';
import { Categoria } from '../../domain/entities/categoria';
import { Usuario } from '../../domain/entities/usuario';
import { Evidencia } from '../../domain/entities/evidencia';

export interface AlertaConDatos {
  alerta: Alerta;
  categoria?: Categoria;
  usuario?: Usuario;
  evidencias: Evidencia[];
}

export interface ObtenerAlertasResponse {
  alertas: AlertaConDatos[];
}

export class ObtenerAlertasUseCase {
  constructor(
    private readonly alertaRepo: IAlertaRepository,
    private readonly configRepo: IConfiguracionRepository,
    private readonly referenciaRepo: IReferenciaRepository,
  ) {}

  execute(usuarioId: number): ObtenerAlertasResponse {
    const config = this.configRepo.obtenerPorUsuarioId(usuarioId);
    const todas = this.alertaRepo.obtenerTodas();

    const filtradas = todas.filter((a) => {
      // Las alertas SOS siempre se muestran
      if (a.es_sos) return true;
      // Si el usuario desactivó notificaciones, ocultar las que no son SOS
      if (!config?.recibir_notificaciones) return false;
      return true;
    });

    // Ordenar descendente por fecha_hora (más reciente primero)
    const ordenadas = [...filtradas].sort(
      (a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime(),
    );

    const alertasConDatos: AlertaConDatos[] = ordenadas.map((a) => ({
      alerta: a,
      categoria: this.referenciaRepo.getCategoriaById(a.categoria_id),
      usuario: this.referenciaRepo.getUsuarioById(a.usuario_id),
      evidencias: this.alertaRepo.obtenerEvidencias(a.id),
    }));

    return { alertas: alertasConDatos };
  }
}
