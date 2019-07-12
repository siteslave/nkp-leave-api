/// <reference path="../../../typings.d.ts" />

import * as crypto from "crypto";
import * as fs from 'fs';
import * as path from 'path';

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

    const employeeId = req.query.employeeId || null;

    const rs: any = await leaveModel.managerRead(req.db, userId, employeeId, status, limit, offset);
    const rsTotal: any = await leaveModel.mamagerGetTotal(req.db, userId, employeeId, status);
    const total = rsTotal ? rsTotal[0].total : 0;

    res.send({ ok: true, rows: rs, total: total });
  } catch (e) {
    console.log(e);
    res.send({ ok: false, error: e.message });
  }

});

router.get('/search-employee', async (req: Request, res: Response) => {
  try {
    const db = req.db;
    const query = req.query.q;
    const rs: any = await leaveModel.searchEmployeeTypeahead(db, query);
    res.send(rs[0]);

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

// render file
router.get('/employee/:employeeId/image', async (req: Request, res: Response) => {
  const db: any = req.db;
  const employeeId: any = req.params.employeeId;

  try {
    const rs: any = await employeeModel.getImage(db, employeeId);

    if (rs.length) {
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const fileName = rs[0].image_path;

      const imagePath = path.join(uploadDir, fileName);
      const mimeType = rs[0].mime_type;

      res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
      res.setHeader('Content-type', mimeType);

      let filestream = fs.createReadStream(imagePath);
      filestream.pipe(res);
    } else {
      res.send({ ok: false, error: 'image not found!', statusCode: 500 });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, statusCode: 500 });
  }

});

export default router;
