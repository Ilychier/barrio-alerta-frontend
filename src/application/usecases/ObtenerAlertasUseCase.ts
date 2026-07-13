import { Alerta } from '../../domain/entities/alerta';
import { Categoria } from '../../domain/entities/categoria';
import { Evidencia } from '../../domain/entities/evidencia';
import { Usuario } from '../../domain/entities/usuario';
import { IAlertaRepository } from '../../domain/ports/IAlertaRepository';
import { IConfiguracionRepository } from '../../domain/ports/IConfiguracionRepository';
import { IReferenciaRepository } from '../../domain/ports/IReferenciaRepository';

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

  async execute(usuarioId: number, fecha?: string): Promise<ObtenerAlertasResponse> {
    const userRes = await this.referenciaRepo.getUsuarioById(usuarioId);
    const barrioId = userRes?.barrio_id;

    const [config, todas] = await Promise.all([
      this.configRepo.obtenerPorUsuarioId(usuarioId),
      this.alertaRepo.obtenerTodas(fecha, barrioId),
    ]);

    const filtradas = todas.filter((a) => {
      // Las alertas SOS siempre se muestran
      if (a.es_sos) return true;
      
      // Si el modo silencioso está activado (Filtro S.O.S), ocultar las que no son SOS
      if (config?.modo_silencioso === true) return false;

      // Si el usuario desactivó explícitamente recibir notificaciones de vecinos, ocultar las que no son SOS
      if (config?.recibir_notificaciones === false) return false;

      return true;
    });

    // Ordenar descendente por fecha_hora (más reciente primero)
    const ordenadas = [...filtradas].sort(
      (a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime(),
    );

    const alertasConDatos: AlertaConDatos[] = await Promise.all(
      ordenadas.map(async (a) => {
        const [categoria, usuario, evidencias] = await Promise.all([
          a.categoria_id !== undefined ? this.referenciaRepo.getCategoriaById(a.categoria_id) : Promise.resolve(undefined),
          this.referenciaRepo.getUsuarioById(a.usuario_id),
          this.alertaRepo.obtenerEvidencias(a.id),
        ]);
        return {
          alerta: a,
          categoria,
          usuario,
          evidencias,
        };
      })
    );

    return { alertas: alertasConDatos };
  }
}
