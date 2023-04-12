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

@Entity({ name: "web_scan_network_requests" })
export class WebScanNetRequest extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  statusCode: number;

  @Column()
  requestUrl: string;

  @Column({ default: "GET" })
  requestMethod: string;

  @Column({ type: "jsonb" })
  responseHeaders: Record<string, string>;

  @Column({ default: null })
  responseSize: string;

  @Column({ default: null })
  responseType: string;

  @Column({ default: null })
  responseBody: string;

  @Column({ default: null })
  geoCountry: string;

  @Column({ default: null })
  geoCity: string;

  @Column({ default: null })
  geoIp: string;

  @Column({ default: null })
  geoAs: string;

  @Column()
  webScanId: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: false })
  failed: boolean;

  @ManyToOne(() => WebScan, (scan) => scan.networkRequests, {
    onDelete: "CASCADE",
    eager: false,
  })
  @JoinColumn({ name: "webScanId", referencedColumnName: "id" })
  webScan: WebScan;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}
