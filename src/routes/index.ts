/// <reference path="../../typings.d.ts" />

import * as express from 'express';
import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
// import model
import { TestModel } from "../models/test";

const testModel = new TestModel();
const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
  var message = testModel.testMessage();
  console.log(message);

  res.send({ ok: true, message: 'Welcome to RESTful api server!', code: HttpStatus.OK });
});

export default router;
