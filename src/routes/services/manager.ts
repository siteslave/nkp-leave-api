/// <reference path="../../../typings.d.ts" />

import { Request, Response, Router } from 'express';
import { LeaveTypeModel } from "../../models/leave_type";
import { LeaveModel } from "../../models/leave";

const leaveTypeModel = new LeaveTypeModel();
const leaveModel = new LeaveModel();

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

    res.send({ok: true, rows: rs, total: total});
  } catch (e) {
    console.log(e);
    res.send({ok: false, error: e.message});
  }

});

// UPDATE
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


export default router;
