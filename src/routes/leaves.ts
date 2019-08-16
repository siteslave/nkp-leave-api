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

const leaveModel = new LeaveModel();
const employeeModel = new EmployeeModel();

const router: Router = Router();

// READ
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = +req.query.limit || 20;
    const offset = +req.query.offset || 0;

    const status = req.query.status || null;
    const employeeId = req.decoded.employee_id;

    const rs: any = await leaveModel.read(req.db, employeeId, status, limit, offset);
    const rsTotal: any = await leaveModel.getTotal(req.db, employeeId, status);
    const total = rsTotal[0].total;

    res.send({ ok: true, rows: rs, total: total });
  } catch (e) {
    console.log(e);
    res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
  }
});

// CREATE
router.post('/', async (req: Request, res: Response) => {
  const db = req.db;

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

      await leaveModel.create(db, data);

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
router.put('/:leaveId', async (req: Request, res: Response) => {

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
router.delete('/:leaveId', async (req: Request, res: Response) => {

  const leaveId = req.params.leaveId;

  if (leaveId) {
    try {
      await leaveModel.delete(req.db, leaveId);
      res.send({ ok: true });
    } catch (e) {
      console.log(e);
      res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
    }
  } else {
    res.send({ ok: false, error: 'ข้อมูลไม่ครบ' });
  }
});

// router.get('/:employeeId/history', async (req: Request, res: Response) => {
//   const db = req.db;

//   const periodId = req.decoded.period_id;
//   const employeeId = req.params.employeeId;

//   if (employeeId && periodId) {
//     try {
//       const rs: any = await leaveModel.getLeaveHistoryByEmployee(db, employeeId, periodId);
//       res.send({ ok: true, rows: rs });
//     } catch (e) {
//       console.log(e);
//       res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
//     }
//   } else {
//     res.send({ ok: false, error: 'ข้อมูลไม่ครบ' });
//   }
// });

router.get('/:employeeId/history', async (req: Request, res: Response) => {
  const db = req.db;

  const periodId = req.decoded.period_id;
  const employeeId = req.params.employeeId;

  if (employeeId && periodId) {
    try {
      const rs: any = await leaveModel.getLeaveHistoryByEmployee(db, employeeId, periodId);
      const rsLeaveDays = await leaveModel.getCurrentLeaveSummary(db, employeeId, periodId);

      const rsInfo = await employeeModel.getInfo(db, employeeId);
      const info = rsInfo.length ? rsInfo[0] : {};

      const summary: any = [];

      for (const item of rsLeaveDays) {
        const obj: any = {};
        obj.leave_type_name = item.leave_type_name;
        obj.leave_type_id = item.leave_type_id;
        obj.leave_days_num = item.leave_days_num;
        const total = await leaveModel.getCurrentLeaveTotal(db, employeeId, periodId, item.leave_type_id);
        const lastLeaveDay = await leaveModel.getLastLeaveDay(db, employeeId, periodId, item.leave_type_id);
        obj.current_leave = total;
        obj.last_leave_day = lastLeaveDay;
        summary.push(obj);
      }


      res.send({ ok: true, rows: rs, summary: summary, info: info });
    } catch (e) {
      console.log(e);
      res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
    }
  } else {
    res.send({ ok: false, error: 'ข้อมูลไม่ครบ' });
  }
});

router.get('/pdf/:leaveId', async (req: Request, res: Response) => {
  const db = req.db;
  const leaveId = req.params.leaveId;
  const periodId = req.decoded.period_id;
  const employeeId = req.decoded.employee_id;

  try {
    const exportPath = path.join(__dirname, '../../output');
    fse.ensureDirSync(exportPath);

    const fileName = `${moment().format('x')}.pdf`;
    const pdfPath = path.join(exportPath, fileName);

    const _ejsPath = path.join(__dirname, '../../templates/leave.ejs');

    var contents = fs.readFileSync(_ejsPath, 'utf8');

    // get leave info
    const info = await leaveModel.getLeaveInfoForPrint(db, leaveId);
    const rsHistory: any = await leaveModel.getLeaveHistoryByEmployee(db, employeeId, periodId);

    console.log(rsHistory);

    console.log(employeeId);
    console.log(periodId);

    const data: any = {};

    data.lastStartDate = '-';
    data.lastEndDate = '-';

    data.lastLeaveDays = 0;
    data.leaveDays = 0;

    rsHistory.forEach((v: any) => {
      if (v.leave_type_id === info.leave_type_id) {
        data.lastStartDate = `${moment(v.start_date).locale('th').format('D MMMM ')} พ.ศ. ${moment(v.start_date).get('year') + 543}`;
        data.lastEndDate = `${moment(v.start_date).locale('th').format('D MMMM ')} พ.ศ. ${moment(v.start_date).get('year') + 543}`;
        data.lastLeaveDays = v.leave_days;
      }
    });

    data.currentDate = `${moment().locale('th').format('D MMMM')} พ.ศ.​ ${moment().get('year') + 543}`;
    data.leaveTypeName = info.leave_type_name;
    data.positionName = info.position_name;
    data.employeeName = `${info.first_name} ${info.last_name}`;
    data.departmentName = info.department_name;
    data.subDepartmentName = info.sub_department_name;
    data.startDate = `${moment(info.start_date).locale('th').format('D MMMM ')} พ.ศ. ${moment(info.start_date).get('year') + 543}`;
    data.endDate = `${moment(info.end_date).locale('th').format('D MMMM ')} พ.ศ. ${moment(info.end_date).get('year') + 543}`;
    data.leaveDays = info.leave_days;

    var html = ejs.render(contents, data);

    var options = { format: 'A4' };

    pdf.create(html, options).toFile(pdfPath, function (err, data) {
      if (err) {
        console.log(err);
        res.send({ ok: false, error: err });
      } else {
        fs.readFile(pdfPath, function (err, data) {
          if (err) {
            res.send({ ok: false, error: err });
          } else {

            rimraf.sync(pdfPath);

            res.contentType("application/pdf");
            res.send(data);
          }
        });
      }
    });
  } catch (error) {
    res.send({ ok: false, error: error.message });
  }

});

export default router;
