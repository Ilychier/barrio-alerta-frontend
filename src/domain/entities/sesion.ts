import { Usuario } from './usuario';
import { Barrio } from './barrio';
import { Cuadrante } from './cuadrante';
import { Configuracion } from './configuracion';

export interface SesionDTO {
  token: string | null;
  user: Usuario;
  barrio: Barrio | null;
  cuadrante: Cuadrante | null;
  configuracion: Configuracion | null;
}
