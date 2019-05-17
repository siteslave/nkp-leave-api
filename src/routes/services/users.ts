/// <reference path="../../../typings.d.ts" />

import { Request, Response, Router } from 'express';
import { LeaveTypeModel } from "../../models/leave_type";
import { LeaveModel } from "../../models/leave";

const leaveTypeModel = new LeaveTypeModel();
const leaveModel = new LeaveModel();

const router: Router = Router();

router.get('/leave-types', async (req: Request, res: Response) => {
  try {
    const rs: any = await leaveTypeModel.read(req.db, null, 100, 0);
    res.send({ok: true, rows: rs});
  } catch (e) {
    console.log(e);
    res.send({ok: false, error: e.message});
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
      res.send({ok: true});
    } catch (e) {
      console.log(e);
      res.send({ok: false, code: 500, error: 'เกิดข้อผิดพลาด'});
    }
  } else {
    res.send({ok: false, error: 'ข้อมูลไม่ครบ'});
  }
});

// UPDATE
// localhost:3000/services/users/leaves/xx
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
      res.send({ok: true});
    } catch (e) {
      console.log(e);
      res.send({ok: false, code: 500, error: 'เกิดข้อผิดพลาด'});
    }
  } else {
    res.send({ok: false, error: 'ข้อมูลไม่ครบ'});
  }
});

// DELETE
router.delete('/leaves/:leaveId', async (req: Request, res: Response) => {

  const leaveId = req.params.leaveId;
  const employeeId = req.decoded.employee_id;

  if (leaveId) {
    try {
      await leaveModel.delete(req.db, leaveId, employeeId);
      res.send({ok: true});
    } catch (e) {
      console.log(e);
      res.send({ok: false, code: 500, error: 'เกิดข้อผิดพลาด'});
    }
  } else {
    res.send({ok: false, error: 'ข้อมูลไม่ครบ'});
  }
});


export default router;
