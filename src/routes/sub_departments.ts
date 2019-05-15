/// <reference path="../../typings.d.ts" />

import { Request, Response, Router } from 'express';

import { SubDepartmentModel } from "../models/sub_department";

const subDepartmentModel = new SubDepartmentModel();

const router: Router = Router();

// READ
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = +req.query.limit || 2; // ?limit=20
    const offset = +req.query.offset || 0; // ?offset=0

    const query = req.query.query || null;
    const departmentId = req.query.departmentId || null;

    const rs: any = await subDepartmentModel.read(req.db, query, departmentId, limit, offset);
    const rsTotal: any = await subDepartmentModel.getTotal(req.db, query, departmentId);
    const total = rsTotal[0].total;

    res.send({ok: true, rows: rs, total: total});
  } catch(e) {
    console.log(e);
    res.send({ok: false, code: 500, error: 'เกิดข้อผิดพลาด'});
  }
});

// CREATE
router.post('/', async (req: Request, res: Response) => {
  const subDepartmentName = req.body.subDepartmentName;
  const departmentId = req.body.departmentId;

  if (subDepartmentName && departmentId) {
    try {
      const data: any = {};
      data.sub_department_name = subDepartmentName;
      data.department_id = departmentId;

      await subDepartmentModel.create(req.db, data);
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
router.put('/:subDepartmentId', async (req: Request, res: Response) => {
  const subDepartmentName = req.body.subDepartmentName;
  const departmentId = req.body.departmentId;

  const subDepartmentId = req.params.subDepartmentId;

  if (subDepartmentName && subDepartmentId) {
    try {
      const data: any = {};
      data.sub_department_name = subDepartmentName;
      data.department_id = departmentId;

      await subDepartmentModel.update(req.db, subDepartmentId, data);
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
router.delete('/:subDepartmentId', async (req: Request, res: Response) => {

  const subDepartmentId = req.params.subDepartmentId;

  if (subDepartmentId) {
    try {
      await subDepartmentModel.delete(req.db, subDepartmentId);
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
