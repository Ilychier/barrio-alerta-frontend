export class Ciudad {
  constructor(
    public readonly id: number,
    public readonly nombre: string,
    public readonly departamento: string,
    public readonly pais: string,
    public readonly esCapital: boolean = false,
  ) {}
}
