/// <reference path="../../typings.d.ts" />

import * as express from 'express';
import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
// import model
// import { TestModel } from "../models/test";
// import { JwtModel } from "../models/jwt";

// const testModel = new TestModel();
// const jwtModel = new JwtModel();

const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
  // var message = testModel.testMessage();
  // var token = await jwtModel.sign({hello: 'xxx'});

  // console.log(token);
  // console.log(message);

  res.send({ ok: true, message: 'Welcome to RESTful api server!', code: HttpStatus.OK });
});

export default router;
