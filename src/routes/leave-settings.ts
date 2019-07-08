/// <reference path="../../typings.d.ts" />

import { Request, Response, Router } from 'express';
import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';
import * as fse from 'fs-extra';
import * as pdf from 'html-pdf';
import * as rimraf from 'rimraf';
import * as moment from 'moment';

import { LeaveModel } from "../models/leave";
import { LeaveTypeModel } from '../models/leave_type';
import { EmployeeModel } from '../models/employee';
import { LeaveSettingModel } from '../models/leave-setting';

const leaveSettingModel = new LeaveSettingModel();

const router: Router = Router();

router.post('/settings', async (req: Request, res: Response) => {
  try {
    const employeeTypeId = req.body.employeeTypeId;
    const periodId = req.body.periodId;

    const rs: any = await leaveSettingModel.getSetting(req.db, periodId, employeeTypeId);

    res.send({ ok: true, rows: rs[0] });
  } catch (e) {
    console.log(e);
    res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
  }
});

router.post('/save-settings', async (req: Request, res: Response) => {
  const db = req.db;

  try {
    const data = req.body.data;
    const periodId = req.body.periodId;
    const employeeTypeId = req.body.employeeTypeId;

    if (data.length && periodId && employeeTypeId) {
      // clear old data
      await leaveSettingModel.removeSetting(db, periodId, employeeTypeId);
      // save new data
      await leaveSettingModel.saveSetting(db, data);
      res.send({ ok: true });
    } else {
      res.send({ ok: false, error: 'ไม่พบข้อมูลที่ต้องการบันทึก' });
    }

  } catch (e) {
    console.log(e);
    res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
  }
});

export default router;
