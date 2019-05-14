/// <reference path="../../typings.d.ts" />

import { Request, Response, Router } from 'express';

import { EmployeeTypeModel } from "../models/employee_type";

const employeeTypeModel = new EmployeeTypeModel();

const router: Router = Router();

// READ
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = +req.query.limit || 2; // ?limit=20
    const offset = +req.query.offset || 0; // ?offset=0

    const rs: any = await employeeTypeModel.read(req.db, limit, offset);
    const rsTotal: any = await employeeTypeModel.getTotal(req.db);
    const total = rsTotal[0].total;

    res.send({ok: true, rows: rs, total: total});
  } catch(e) {
    console.log(e);
    res.send({ok: false, code: 500, error: 'เกิดข้อผิดพลาด'});
  }
});

// CREATE
router.post('/', async (req: Request, res: Response) => {
  const employeeTypeName = req.body.employeeTypeName;

  if (employeeTypeName) {
    try {
      const data: any = {};
      data.employee_type_name = employeeTypeName;

      await employeeTypeModel.create(req.db, data);
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
router.put('/:employeeTypeId', async (req: Request, res: Response) => {
  const employeeTypeName = req.body.employeeTypeName;

  const employeeTypeId = req.params.employeeTypeId;

  if (employeeTypeName && employeeTypeId) {
    try {
      const data: any = {};
      data.employee_type_name = employeeTypeName;

      await employeeTypeModel.update(req.db, employeeTypeId, data);
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
router.delete('/:employeeTypeId', async (req: Request, res: Response) => {

  const employeeTypeId = req.params.employeeTypeId;

  if (employeeTypeId) {
    try {
      await employeeTypeModel.delete(req.db, employeeTypeId);
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
