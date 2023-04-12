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
import { WebScanNetRequest } from "./WebScanNetRequest.entity";

@Entity({ name: "web_scan_alerts" })
export class WebScanAlert extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ default: "" })
  url: string;

  @Column({ default: "Analysis" })
  method: string;

  @Column({ default: "" })
  description: string;

  @Column({ default: "" })
  data: string;

  @Column()
  webScanId: string;

  @Column()
  webScanRequestId: string;

  @Column({ default: 0 })
  suspicionLevel: number;

  @Column({ default: false })
  fullyDeobfuscated: boolean;

  @ManyToOne(() => WebScan, (scan) => scan.alerts, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "webScanId", referencedColumnName: "id" })
  webScan: WebScan;

  @ManyToOne(() => WebScanNetRequest, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "webScanRequestId", referencedColumnName: "id" })
  webScanRequest: WebScanNetRequest;

  @Column({ type: "timestamptz", default: null })
  foundAt: Date;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}
