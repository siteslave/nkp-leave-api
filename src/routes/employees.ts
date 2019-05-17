/// <reference path="../../typings.d.ts" />
import * as crypto from "crypto";

import { Request, Response, Router } from 'express';

import { EmployeeModel } from "../models/employee";

const employeeModel = new EmployeeModel();

const router: Router = Router();

// READ
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = +req.query.limit || 2; // ?limit=20
    const offset = +req.query.offset || 0; // ?offset=0

    const query = req.query.query || null;
    const employeeTypeId = req.query.employeeTypeId || null;
    const departmentId = req.query.departmentId || null;
    const subDepartmentId = req.query.subDepartmentId || null;

    const rs: any = await employeeModel.read(
      req.db,
      query,
      employeeTypeId,
      departmentId,
      subDepartmentId,
      limit,
      offset);

    const rsTotal: any = await employeeModel.getTotal(req.db, query, employeeTypeId, departmentId, subDepartmentId);
    const total = rsTotal[0].total;

    res.send({ok: true, rows: rs, total: total});
  } catch(e) {
    console.log(e);
    res.send({ok: false, code: 500, error: 'เกิดข้อผิดพลาด'});
  }
});

// CREATE
router.post('/', async (req: Request, res: Response) => {
  const username = req.body.username;
  const password = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const employeeTypeId = req.body.employeeTypeId;
  const departmentId = req.body.departmentId;
  const subDepartmentId = req.body.subDepartmentId;
  const isEnabled = req.body.isEnabled;

  if (username && password && firstName && lastName && employeeTypeId && departmentId && subDepartmentId) {
    try {
      const encPassword = crypto.createHash('md5').update(password).digest('hex');
      const data: any = {};
      data.username = username;
      data.password = encPassword;
      data.first_name = firstName;
      data.last_name = lastName;
      data.employee_type_id = employeeTypeId;
      data.department_id = departmentId;
      data.sub_department_id = subDepartmentId;
      data.is_enabled = isEnabled;

      await employeeModel.create(req.db, data);
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
router.put('/:employeeId', async (req: Request, res: Response) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const employeeTypeId = req.body.employeeTypeId;
  const departmentId = req.body.departmentId;
  const subDepartmentId = req.body.subDepartmentId;
  const isEnabled = req.body.isEnabled;

  const employeeId = req.params.employeeId;

  if (firstName && lastName && employeeTypeId && employeeId && departmentId && subDepartmentId) {
    try {
      const data: any = {};
      data.first_name = firstName;
      data.last_name = lastName;
      data.employee_type_id = employeeTypeId;
      data.department_id = departmentId;
      data.sub_department_id = subDepartmentId;
      data.is_enabled = isEnabled;
      
      await employeeModel.update(req.db, employeeId, data);
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
router.delete('/:employeeId', async (req: Request, res: Response) => {

  const employeeId = req.params.employeeId;

  if (employeeId) {
    try {
      await employeeModel.delete(req.db, employeeId);
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
