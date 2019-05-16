/// <reference path="../../typings.d.ts" />

import * as crypto from "crypto";

import * as express from 'express';
import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';

import { JwtModel } from "../models/jwt";
import { LoginModel } from "../models/login";


// const testModel = new TestModel();
const jwtModel = new JwtModel();
const loginModel = new LoginModel();

const router: Router = Router();

router.post('/', async (req: Request, res: Response) => {

  const username = req.body.username;
  const password = req.body.password;
  const userType = req.body.userType; // ADMIN, USER

  if (username && password && userType) {
    const encPassword = crypto.createHash('md5').update(password).digest('hex');
    let rs: any;

    if (userType === 'ADMIN') {
      rs = await loginModel.adminLogin(req.db, username, encPassword);
    } else {
      rs = await loginModel.userLogin(req.db, username, encPassword);
    }

    if (rs.length) {
      const data = rs[0];
      const payload = {
        first_name: data.first_name,
        last_name: data.last_name,
        user_type: data.user_type,
        user_id: data.user_id
      };

      console.log(payload);

      const token = jwtModel.sign(payload);
      res.send({ok: true, token: token});
    } else {
      res.send({ok: false, error: 'ชื่อผู้ใช้งาน หรือ รหัสผ่าน ไม่ถูกต้อง'});
    }

  } else {
    res.send({ok: false, error: 'ข้อมูลไม่ครบ'});
  }
});

export default router;
