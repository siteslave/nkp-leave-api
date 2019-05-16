/// <reference path="../../typings.d.ts" />

import { Request, Response, Router } from 'express';

import { LeaveTypeModel } from "../models/leave_type";

const leaveTypeModel = new LeaveTypeModel();

const router: Router = Router();

// READ
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = +req.query.limit || 20; // ?limit=20
    const offset = +req.query.offset || 0; // ?offset=0

    const query = req.query.query || null;

    const rs: any = await leaveTypeModel.read(req.db, query, limit, offset);
    const rsTotal: any = await leaveTypeModel.getTotal(req.db, query);
    const total = rsTotal[0].total;

    res.send({ok: true, rows: rs, total: total});
  } catch(e) {
    console.log(e);
    res.send({ok: false, code: 500, error: 'เกิดข้อผิดพลาด'});
  }
});

// CREATE
router.post('/', async (req: Request, res: Response) => {
  const leaveTypeName = req.body.leaveTypeName;

  if (leaveTypeName) {
    try {
      const data: any = {};
      data.leave_type_name = leaveTypeName;

      await leaveTypeModel.create(req.db, data);
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
router.put('/:leaveTypeId', async (req: Request, res: Response) => {
  const leaveTypeName = req.body.leaveTypeName;

  const leaveTypeId = req.params.leaveTypeId;

  if (leaveTypeName && leaveTypeId) {
    try {
      const data: any = {};
      data.leave_type_name = leaveTypeName;

      await leaveTypeModel.update(req.db, leaveTypeId, data);
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
router.delete('/:leaveTypeId', async (req: Request, res: Response) => {

  const leaveTypeId = req.params.leaveTypeId;

  if (leaveTypeId) {
    try {
      await leaveTypeModel.delete(req.db, leaveTypeId);
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
