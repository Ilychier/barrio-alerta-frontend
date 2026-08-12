export class Localidad {
  constructor(
    public readonly id: number,
    public readonly nombre: string,
    public readonly municipioId: number,
  ) {}
}
