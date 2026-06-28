import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Rol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  descripcion: string;

  @Column()
  nombre: string;

  esGCM(): boolean {
    return this.nombre === 'GCM';
  }
}