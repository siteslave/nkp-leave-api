/// <reference path="../../../typings.d.ts" />

import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import * as moment from 'moment';
import * as fse from 'fs-extra';
import * as multer from 'multer';

import { Request, Response, Router } from 'express';
import { LeaveTypeModel } from "../../models/leave_type";
import { LeaveModel } from "../../models/leave";
import { EmployeeModel } from "../../models/employee";
import { LineModel } from '../../models/line';

const leaveTypeModel = new LeaveTypeModel();
const leaveModel = new LeaveModel();
const employeeModel = new EmployeeModel();
const lineModel = new LineModel();

const router: Router = Router();

const uploadDir = process.env.UPLOAD_DIR || './uploads';

fse.ensureDirSync(uploadDir);

var storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    let _ext = path.extname(file.originalname);
    cb(null, Date.now() + _ext)
  }
});

let upload = multer({ storage: storage });

// upload file
router.post('/uploads', upload.any(), async (req: Request, res: Response) => {
  const db: any = req.db;
  const employeeId = req.decoded.employee_id;

  var fileName = '';
  var mimeType = '';

  if (req.files.length) {
    fileName = req.files[0].filename || null;
    mimeType = req.files[0].mimetype || null;
  }

  console.log(req.files);
  // save data

  if (fileName) {
    try {
      // remove old image
      await employeeModel.removeImage(db, employeeId);
      // save image
      await employeeModel.saveImage(db, employeeId, fileName, mimeType);

      res.send({ ok: true });

    } catch (error) {
      res.send({ ok: false, error: error.message });
    }
  } else {
    res.send({ ok: false, error: 'File not found!' });
  }
});

// render file
router.get('/image', async (req: Request, res: Response) => {
  const db: any = req.db;
  const employeeId: any = req.decoded.employee_id;

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

router.get('/leave-types', async (req: Request, res: Response) => {
  try {
    const rs: any = await leaveTypeModel.read(req.db, null, 100, 0);
    res.send({ ok: true, rows: rs });
  } catch (e) {
    console.log(e);
    res.send({ ok: false, error: e.message });
  }

});

// CREATE
router.post('/leaves', async (req: Request, res: Response) => {
  const periodId = req.decoded.period_id;
  const employeeId = req.decoded.employee_id;
  const leaveTypeId = req.body.leaveTypeId;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const leaveDays = req.body.leaveDays;
  const remark = req.body.remark;

  if (leaveTypeId && startDate && endDate && leaveDays) {
    try {
      const data: any = {};
      data.period_id = periodId;
      data.employee_id = employeeId;
      data.leave_type_id = leaveTypeId;
      data.start_date = startDate;
      data.end_date = endDate;
      data.leave_days = leaveDays;
      data.remark = remark;

      await leaveModel.create(req.db, data);
      await lineModel.sendNotify('มีผู้บันทึกวันลาเข้ามาใหม่');
      req.mqttClient.publish('manager/main', 'reload');
      res.send({ ok: true });
    } catch (e) {
      console.log(e);
      res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
    }
  } else {
    res.send({ ok: false, error: 'ข้อมูลไม่ครบ' });
  }
});

// UPDATE
// :3000/services/users/leaves/xx
router.put('/leaves/:leaveId', async (req: Request, res: Response) => {

  const leaveId = req.params.leaveId;

  const leaveTypeId = req.body.leaveTypeId;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const leaveDays = req.body.leaveDays;
  const remark = req.body.remark;

  if (leaveId && leaveTypeId && startDate && endDate && leaveDays) {
    try {
      const data: any = {};
      data.leave_type_id = leaveTypeId;
      data.start_date = startDate;
      data.end_date = endDate;
      data.leave_days = leaveDays;
      data.remark = remark;

      await leaveModel.update(req.db, leaveId, data);
      res.send({ ok: true });
    } catch (e) {
      console.log(e);
      res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
    }
  } else {
    res.send({ ok: false, error: 'ข้อมูลไม่ครบ' });
  }
});

// DELETE
router.delete('/leaves/:leaveId', async (req: Request, res: Response) => {

  const leaveId = req.params.leaveId;
  const employeeId = req.decoded.employee_id;

  if (leaveId) {
    try {
      await leaveModel.delete(req.db, leaveId, employeeId);
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

  const employeeId = req.decoded.employee_id;

  if (employeeId) {
    try {
      const rs: any = await employeeModel.getInfo(req.db, employeeId);
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

  const employeeId = req.decoded.employee_id;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const password = req.body.password || null;

  if (employeeId && firstName && lastName) {
    try {
      let data: any = {};
      data.first_name = firstName;
      data.last_name = lastName;

      if (password) {
        const encPassword = crypto.createHash('md5').update(password).digest('hex');
        data.password = encPassword;
      }

      await employeeModel.update(req.db, employeeId, data);
      res.send({ ok: true });
    } catch (e) {
      console.log(e);
      res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
    }
  } else {
    res.send({ ok: false, error: 'ข้อมูลไม่ครบ' });
  }
});

export default router;
