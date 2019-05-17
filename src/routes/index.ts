/// <reference path="../../typings.d.ts" />

import * as express from 'express';
import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';
import * as fse from 'fs-extra';
import * as pdf from 'html-pdf';
import * as rimraf from 'rimraf';

import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';

import { JwtModel } from "../models/jwt";
import moment = require("moment");

// const testModel = new TestModel();
const jwtModel = new JwtModel();

const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
  var token = jwtModel.sign({ hello: 'xxx' });
  console.log(token);
  res.send({ ok: true, message: 'Welcome to RESTful api server!', code: HttpStatus.OK });
});

router.get('/pdf', async (req: Request, res: Response) => {
  const exportPath = path.join(__dirname, '../../output');

  fse.ensureDirSync(exportPath);

  const fileName = `${moment().format('x')}.pdf`;
  const pdfPath = path.join(exportPath, fileName);

  const _ejsPath = path.join(__dirname, '../../templates/test.ejs');

  var contents = fs.readFileSync(_ejsPath, 'utf8');
  var html = ejs.render(contents, {name: 'Satit Rianpit'});

  pdf.create(html).toFile(pdfPath, function (err, data) {
    if (err) {
      console.log(err);
      res.send({ok: false, error: err});
    } else {
      fs.readFile(pdfPath , function (err, data){
        if (err) {
          res.send({ok: false, error: err});
        } else {

          rimraf.sync(pdfPath);

          res.contentType("application/pdf");
          res.send(data);
        }
      });
    }
  });

});

export default router;
