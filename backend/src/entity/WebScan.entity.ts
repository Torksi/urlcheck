import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { WebScanAlert } from "./WebScanAlert.entity";
import { WebScanLink } from "./WebScanLink.entity";
import { WebScanNetRequest } from "./WebScanNetRequest.entity";
import { WebScanRedirect } from "./WebScanRedirect.entity";
import { WebScanRender } from "./WebScanRender.entity";

@Entity({ name: "web_scans" })
export class WebScan extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  url: string;

  @Column({ default: "0.0.0.0" })
  ip: string;

  @Column()
  urlCountry: string;

  @Column()
  urlCity: string;

  @Column({ default: "Unknown" })
  urlIsp: string;

  @Column({ default: "Unknown" })
  urlAs: string;

  @Column({ default: "0.0.0.0" })
  createdBy: string;

  @Column({ default: "XX" })
  createdFrom: string;

  @OneToMany(
    () => WebScanNetRequest,
    (networkRequest) => networkRequest.webScan,
    {
      cascade: true,
      eager: false,
      onDelete: "CASCADE",
    }
  )
  networkRequests: WebScanNetRequest[];

  @OneToMany(() => WebScanRedirect, (redirect) => redirect.webScan, {
    cascade: true,
    eager: false,
    onDelete: "CASCADE",
  })
  redirects: WebScanRedirect[];

  @OneToMany(() => WebScanAlert, (alert) => alert.webScan, {
    cascade: true,
    eager: false,
    onDelete: "CASCADE",
  })
  alerts: WebScanAlert[];

  @OneToMany(() => WebScanLink, (link) => link.webScan, {
    cascade: true,
    eager: false,
    onDelete: "CASCADE",
  })
  links: WebScanLink[];

  @OneToMany(() => WebScanRender, (render) => render.webScan, {
    cascade: true,
    eager: false,
    onDelete: "CASCADE",
  })
  fullDom: WebScanRender[];

  @Column({ type: "text", nullable: true })
  screenshot: string;

  @Column({ default: 0 })
  ipsContacted: number;

  @Column({ default: 0 })
  countriesContacted: number;

  @Column({ default: 0 })
  domainsContacted: number;

  @Column({ default: 0 })
  requestsSent: number;

  @Column({ default: 0 })
  redirectCount: number;

  @Column({ type: "jsonb", default: {} })
  globalVariables: Record<string, string>;

  @Column({ type: "text", default: "" })
  whois: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}
