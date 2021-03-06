/// <reference path="../../typings.d.ts" />

import { Request, Response, Router } from 'express';

import { DepartmentModel } from "../models/department";

const departmentModel = new DepartmentModel();

const router: Router = Router();

// READ
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = +req.query.limit || 20; // ?limit=20
    const offset = +req.query.offset || 0; // ?offset=0

    const query = req.query.query || null;

    const rs: any = await departmentModel.read(req.db, query, limit, offset);
    const rsTotal: any = await departmentModel.getTotal(req.db, query);
    const total = rsTotal[0].total;

    res.send({ok: true, rows: rs, total: total});
  } catch(e) {
    console.log(e);
    res.send({ok: false, code: 500, error: 'เกิดข้อผิดพลาด'});
  }
});

// CREATE
router.post('/', async (req: Request, res: Response) => {
  const departmentName = req.body.departmentName;
  const isEnabled = req.body.isEnabled;

  if (departmentName) {
    try {
      const data: any = {};
      data.department_name = departmentName;
      data.is_enabled = isEnabled;

      await departmentModel.create(req.db, data);
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
router.put('/:departmentId', async (req: Request, res: Response) => {
  const departmentName = req.body.departmentName;
  const isEnabled = req.body.isEnabled;

  const departmentId = req.params.departmentId;

  if (departmentName && departmentId) {
    try {
      const data: any = {};
      data.department_name = departmentName;
      data.is_enabled = isEnabled;

      await departmentModel.update(req.db, departmentId, data);
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
router.delete('/:departmentId', async (req: Request, res: Response) => {

  const departmentId = req.params.departmentId;

  if (departmentId) {
    try {
      await departmentModel.delete(req.db, departmentId);
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
