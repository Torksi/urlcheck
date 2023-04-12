import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { WebScan } from "./WebScan.entity";

@Entity({ name: "web_scan_redirects" })
export class WebScanRedirect extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ default: "" })
  urlFrom: string;

  @Column({ default: "" })
  urlTo: string;

  @Column({ default: "" })
  geoCountry: string;

  @Column({ default: "" })
  geoCity: string;

  @Column({ default: "" })
  geoIp: string;

  @Column({ default: "" })
  geoAs: string;

  @Column()
  webScanId: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: false })
  failed: boolean;

  @ManyToOne(() => WebScan, (scan) => scan.networkRequests, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "webScanId", referencedColumnName: "id" })
  webScan: WebScan;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}
