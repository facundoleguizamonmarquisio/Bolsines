import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Rol } from '../rol/rol.entity';
import { ComisionMedica } from '../comision-medica/comision-medica.entity';

@Entity()
export class Empleado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  apellido: string;

  @Column()
  email: string;

  @Column()
  nombre: string;

  @ManyToOne(() => Rol, { eager: true })
  rol: Rol;

  @ManyToOne(() => ComisionMedica, { eager: true, nullable: true })
  asignadoA: ComisionMedica;

  esTuCM(cm: ComisionMedica): boolean {
    return this.asignadoA?.id === cm.id;
  }

  mostrarCM(): { nombre: string; codigo: string } {
    return {
      nombre: this.asignadoA?.getNombre(),
      codigo: this.asignadoA?.getCodigo(),
    };
  }

  sosGCM(): boolean {
    return this.rol?.esGCM();
  }

  getEmail(): string {
    return this.email;
  }
}