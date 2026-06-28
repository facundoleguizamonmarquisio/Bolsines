import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Bolsin } from '../bolsin/bolsin.entity';

@Entity()
export class UbicacionBolsin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  numeroBolsin: number;

  @Column({ type: 'float' })
  latitud: number;

  @Column({ type: 'float' })
  longitud: number;

  @Column({ type: 'timestamp' })
  fechaHoraActualizacion: Date;

  @Column()
  codigoCMOrigen: string;

  @ManyToOne(() => Bolsin, { eager: true })
  bolsin: Bolsin;
}