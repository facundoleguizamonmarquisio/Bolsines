import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ComisionMedica {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  codigo: string;

  @Column()
  direccion: string;

  @Column()
  email: string;

  @Column()
  nombre: string;

  @Column()
  telefono: string;

  getNombre(): string {
    return this.nombre;
  }

  getCodigo(): string {
    return this.codigo;
  }
}