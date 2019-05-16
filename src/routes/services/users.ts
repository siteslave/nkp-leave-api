/// <reference path="../../../typings.d.ts" />

import { Router, Request, Response } from 'express';
import { LeaveTypeModel } from "../../models/leave_type";

const leaveTypeModel = new LeaveTypeModel();

const router: Router = Router();

router.get('/leave-types', async (req: Request, res: Response) => {
  try {
    const rs: any = await leaveTypeModel.read(req.db, null, 100, 0);
    res.send({ok: true, rows: rs});
  } catch(e) {
    console.log(e);
    res.send({ok: false, error: e.message});
  }

});


export default router;
