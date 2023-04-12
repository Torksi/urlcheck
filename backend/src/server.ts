import "reflect-metadata";
import { LessThan } from "typeorm";

import app from "./app";
import appDataSource from "./app-datasource";
import { WebScan } from "./entity/WebScan.entity";

const removeOldScans = async () => {
  console.log("Removing expired scans...");
  const cutoffDate = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const entities = await appDataSource.getRepository(WebScan).find({
    where: { createdAt: LessThan(cutoffDate) },
  });
  console.log(`Found ${entities.length} expired scans.`);
  await appDataSource.getRepository(WebScan).remove(entities);
  console.log("Expired scans removed.");
};

appDataSource
  .initialize()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(
        `🚀 urlcheck backend is running on port ${process.env.PORT}.`
      );
      removeOldScans();
      setInterval(function () {
        removeOldScans();
      }, 1000 * 60 * 60);
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });
