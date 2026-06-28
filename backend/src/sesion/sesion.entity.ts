import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Empleado } from '../empleado/empleado.entity';

@Entity()
export class Sesion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Empleado, { eager: true })
  usuario: Empleado;

  getUsuario(): Empleado {
    return this.usuario;
  }
}