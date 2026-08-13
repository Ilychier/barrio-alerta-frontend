export class TipoMascota {
  constructor(
    public readonly id: number,
    public readonly nombre: string,
    public readonly activo: boolean = true,
  ) {}
}
