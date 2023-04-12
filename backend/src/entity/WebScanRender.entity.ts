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

@Entity({ name: "web_scan_renders" })
export class WebScanRender extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ default: null })
  body: string;

  @Column()
  webScanId: string;

  @ManyToOne(() => WebScan, (scan) => scan.fullDom, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "webScanId", referencedColumnName: "id" })
  webScan: WebScan;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}
