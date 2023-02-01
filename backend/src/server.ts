import "reflect-metadata";

import app from "./app";
import appDataSource from "./app-datasource";

appDataSource
  .initialize()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(
        `🚀 urlcheck backend is running on port ${process.env.PORT}.`
      );
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });
