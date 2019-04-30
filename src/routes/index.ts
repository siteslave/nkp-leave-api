/// <reference path="../../typings.d.ts" />

import * as express from 'express';
import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
// import model
// import { TestModel } from "../models/test";
import { JwtModel } from "../models/jwt";

// const testModel = new TestModel();
const jwtModel = new JwtModel();

const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
  var token = jwtModel.sign({ hello: 'xxx' });
  console.log(token);
  res.send({ ok: true, message: 'Welcome to RESTful api server!', code: HttpStatus.OK });
});

router.get('/verify', async (req: Request, res: Response) => {
  var token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoZWxsbyI6Inh4eCIsImlhdCI6MTU1NjYwODQ4MiwiZXhwIjoxNTU2Njk0ODgyfQ.2iUfTQoyMhleJAGdmyXAgd82i1bPxeUNH8r96O-Cbys`;
  try {
    var decoded = await jwtModel.verify(token);
    console.log(decoded);
    // console.log(message);
    res.send({ ok: true, payload: decoded });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

export default router;
