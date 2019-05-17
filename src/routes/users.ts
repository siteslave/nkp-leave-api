/// <reference path="../../typings.d.ts" />
import * as crypto from "crypto";

import { Request, Response, Router } from 'express';

import { UserModel } from "../models/user";

const userModel = new UserModel();

const router: Router = Router();

// READ
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = +req.query.limit || 2; // ?limit=20
    const offset = +req.query.offset || 0; // ?offset=0

    const query = req.query.query || null;
    const userType = req.query.userType || null;

    const rs: any = await userModel.read(req.db, query, userType, limit, offset);
    const rsTotal: any = await userModel.getTotal(req.db, query, userType);
    const total = rsTotal[0].total;

    res.send({ok: true, rows: rs, total: total});
  } catch(e) {
    console.log(e);
    res.send({ok: false, code: 500, error: 'เกิดข้อผิดพลาด'});
  }
});

// CREATE
router.post('/', async (req: Request, res: Response) => {
  const username = req.body.username;
  const password = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const userType = req.body.userType;
  const isEnabled = req.body.isEnabled;

  if (username && password && firstName && lastName && userType) {
    try {
      const encPassword = crypto.createHash('md5').update(password).digest('hex');
      const data: any = {};
      data.username = username;
      data.password = encPassword;
      data.first_name = firstName;
      data.last_name = lastName;
      data.user_type = userType;
      data.is_enabled = isEnabled;

      await userModel.create(req.db, data);
      res.send({ok: true});
    } catch(e) {
      console.log(e);
      res.send({ok: false, code: 500, error: 'เกิดข้อผิดพลาด'});
    }
  } else {
    res.send({ok: false, error: 'ข้อมูลไม่ครบ'});
  }
});

// UPDATE
router.put('/:userId', async (req: Request, res: Response) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const userType = req.body.userType;
  const isEnabled = req.body.isEnabled;

  const userId = req.params.userId;

  if (firstName && lastName && userType && userId) {
    try {
      const data: any = {};
      data.first_name = firstName;
      data.last_name = lastName;
      data.user_type = userType;
      data.is_enabled = isEnabled;
      
      await userModel.update(req.db, userId, data);
      res.send({ok: true});
    } catch(e) {
      console.log(e);
      res.send({ok: false, code: 500, error: 'เกิดข้อผิดพลาด'});
    }
  } else {
    res.send({ok: false, error: 'ข้อมูลไม่ครบ'});
  }
});

// DELETE
router.delete('/:userId', async (req: Request, res: Response) => {

  const userId = req.params.userId;

  if (userId) {
    try {
      await userModel.delete(req.db, userId);
      res.send({ok: true});
    } catch(e) {
      console.log(e);
      res.send({ok: false, code: 500, error: 'เกิดข้อผิดพลาด'});
    }
  } else {
    res.send({ok: false, error: 'ข้อมูลไม่ครบ'});
  }
});

export default router;
