import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Estado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  descripcion: string;

  @Column()
  ambito: string;

  esEnviado(): boolean {
    return this.nombre === 'Enviado';
  }

  getNombre(): string {
    return this.nombre;
  }

  getDescripcion(): string {
    return this.descripcion;
  }

  getAmbito(): string {
    return this.ambito;
  }

  setNombre(nombre: string): void {
    this.nombre = nombre;
  }

  setDescripcion(descripcion: string): void {
    this.descripcion = descripcion;
  }

  setAmbito(ambito: string): void {
    this.ambito = ambito;
  }
}