import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

const appDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  port: parseInt(process.env.DB_PORT!, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities:
    process.env.NODE_ENV === "production"
      ? ["build/entity/*.entity.js"]
      : ["src/entity/*.entity.ts"],
  logging: false,
  synchronize: true,
});

export default appDataSource;
