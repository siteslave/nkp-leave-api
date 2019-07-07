/// <reference path="../../../typings.d.ts" />

import * as crypto from "crypto";

import { Request, Response, Router } from 'express';
import { LeaveModel } from "../../models/leave";
import { UserModel } from "../../models/user";
import { EmployeeModel } from '../../models/employee';

const leaveModel = new LeaveModel();
const userModel = new UserModel();
const employeeModel = new EmployeeModel();

const router: Router = Router();

router.get('/leaves', async (req: Request, res: Response) => {
  try {
    const userId = req.decoded.user_id;

    const limit = +req.query.limit || 20;
    const offset = +req.query.offset || 0;
    const status = req.query.status || null;

    const rs: any = await leaveModel.managerRead(req.db, userId, status, limit, offset);
    const rsTotal: any = await leaveModel.mamagerGetTotal(req.db, userId, status);
    const total = rsTotal ? rsTotal[0].total : 0;

    res.send({ ok: true, rows: rs, total: total });
  } catch (e) {
    console.log(e);
    res.send({ ok: false, error: e.message });
  }

});

// UPDATE
router.post('/leaves/status', async (req: Request, res: Response) => {

  const leaveId = req.body.leaveId;
  const status = req.body.status;
  const userId = req.decoded.user_id;

  if (leaveId) {
    try {
      const data: any = {};
      data.leave_status = status;
      await leaveModel.update(req.db, leaveId, data);
      // save log
      await leaveModel.createLog(req.db, leaveId, userId, status);
      res.send({ ok: true });
    } catch (e) {
      console.log(e);
      res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
    }
  } else {
    res.send({ ok: false, error: 'ข้อมูลไม่ครบ' });
  }
});

router.get('/info', async (req: Request, res: Response) => {

  const userId = req.decoded.user_id;

  if (userId) {
    try {
      const rs: any = await userModel.getInfo(req.db, userId);
      if (rs.length) {
        const info = rs[0];
        res.send({ ok: true, info: info });
      } else {
        res.send({ ok: false, error: 'ไม่พบข้อมูล' });
      }
    } catch (e) {
      console.log(e);
      res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
    }
  } else {
    res.send({ ok: false, error: 'ข้อมูลไม่ครบ' });
  }
});

router.put('/info', async (req: Request, res: Response) => {

  const userId = req.decoded.user_id;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const password = req.body.password || null;

  if (userId && firstName && lastName) {
    try {
      let data: any = {};
      data.first_name = firstName;
      data.last_name = lastName;

      if (password) {
        const encPassword = crypto.createHash('md5').update(password).digest('hex');
        data.password = encPassword;
      }

      await userModel.update(req.db, userId, data);
      res.send({ ok: true });
    } catch (e) {
      console.log(e);
      res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
    }
  } else {
    res.send({ ok: false, error: 'ข้อมูลไม่ครบ' });
  }
});


router.get('/employees', async (req: Request, res: Response) => {

  const userId = req.decoded.user_id;
  const limit = +req.query.limit || 20;
  const offset = +req.query.offset || 0;

  const query = req.query.query || null;

  if (userId) {
    try {
      const rs: any = await employeeModel.readManagerEmployee(req.db, query, userId, limit, offset);
      const rsTotal: any = await employeeModel.readTotalManagerEmployee(req.db, query, userId);

      if (rs.length) {
        const total = rsTotal[0].total;
        res.send({ ok: true, rows: rs, total: total });
      } else {
        res.send({ ok: false, error: 'ไม่พบข้อมูล' });
      }
    } catch (e) {
      console.log(e);
      res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
    }
  } else {
    res.send({ ok: false, error: 'ข้อมูลไม่ครบ' });
  }
});

export default router;
