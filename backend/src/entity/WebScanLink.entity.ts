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

@Entity({ name: "web_scan_links" })
export class WebScanLink extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ default: "" })
  url: string;

  @Column({ default: "" })
  target: string;

  @Column({ default: "Other" })
  type: string;

  @Column()
  webScanId: string;

  @ManyToOne(() => WebScan, (scan) => scan.links, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "webScanId", referencedColumnName: "id" })
  webScan: WebScan;

  @Column()
  requestId: string;

  @ManyToOne(() => WebScanNetRequest, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "requestId", referencedColumnName: "id" })
  request: WebScanNetRequest;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}
