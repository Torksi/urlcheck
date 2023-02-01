/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router } from "express";

export abstract class Route {
  router: Router;

  constructor(router: Router) {
    this.router = router;
    this.registerRoutes();
  }

  registerRoutes() {
    //
  }

  /**
   * This function returns the router object.
   * @returns The router object.
   */
  public getRouter() {
    return this.router;
  }
}
