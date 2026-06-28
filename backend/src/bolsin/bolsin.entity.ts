import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ComisionMedica } from '../comision-medica/comision-medica.entity';
import { CambioEstadoBolsin } from '../cambio-estado-bolsin/cambio-estado-bolsin.entity';

@Entity()
export class Bolsin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column()
  numeroBolsin: number;

  @Column()
  numeroPrecinto: string;

  @Column({ type: 'float' })
  peso: number;

  @ManyToOne(() => ComisionMedica, { eager: true })
  origen: ComisionMedica;

  @ManyToOne(() => ComisionMedica, { eager: true })
  destino: ComisionMedica;

  @OneToMany(() => CambioEstadoBolsin, (cambio) => cambio.bolsin, {
    eager: true,
  })
  cambioEstado: CambioEstadoBolsin[];

  esTuCMOrigen(codigoCM: string): boolean {
    // msg 12
    return this.origen?.getCodigo() === codigoCM;
  }

  sosEnviado(): boolean {
    // msg 13: delega en CambioEstadoBolsin
    // busca el cambio actual y llama sosEnviado()
    // msg 14: bolsin a CambioEstadoBolsin sosEnviado()
    // msg 15: CambioEstadoBolsin sosActual()
    // msg 16: Estado esEnviado()
    const actual = this.cambioEstado?.find((c) => c.sosActual());
    return actual?.sosEnviado() ?? false;
  }

  getNumeroBolsin(): number {
    // msg 18
    return this.numeroBolsin;
  }

  obtenerCMDestino(): ComisionMedica {
    // msg 37
    return this.destino;
  }

  new(): void {}
  darDeBaja(): void {}
  reabrir(): void {}
  cerrar(): void {}
  enviar(): void {}
  recibir(): void {}
}