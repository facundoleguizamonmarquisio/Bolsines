import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Estado } from '../estado/estado.entity';
import { Bolsin } from '../bolsin/bolsin.entity';

@Entity()
export class CambioEstadoBolsin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  fechaHoraInicio: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaHoraFin: Date | null;

  @ManyToOne(() => Estado, { eager: true })
  estado: Estado;

  @ManyToOne(() => Bolsin, (bolsin) => bolsin.cambioEstado)
  bolsin: Bolsin;

  sosActual(): boolean {
    return this.fechaHoraFin === null || this.fechaHoraFin === undefined;
  }

  sosEnviado(): boolean {
    return this.sosActual() && this.estado?.esEnviado();
  }
}