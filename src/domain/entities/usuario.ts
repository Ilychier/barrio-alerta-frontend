export class Usuario {
  constructor(
    public readonly id: number,
    public readonly nombre: string,
    public readonly email: string,
    public readonly barrio_id: number,
  ) {}
}
