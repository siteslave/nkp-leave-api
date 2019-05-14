/// <reference path="../../typings.d.ts" />

import { Request, Response, Router } from 'express';

import { DepartmentModel } from "../models/department";

const departmentModel = new DepartmentModel();

const router: Router = Router();

// READ
router.get('/', async (req: Request, res: Response) => {
  try {
    const rs: any = await departmentModel.read(req.db);
    res.send({ok: true, rows: rs});
  } catch(e) {
    console.log(e);
    res.send({ok: false, code: 500, error: 'เกิดข้อผิดพลาด'});
  }
});

// CREATE
router.post('/', async (req: Request, res: Response) => {
  res.send({ok: true, message: 'POST'});
});

// UPDATE
router.put('/', async (req: Request, res: Response) => {
  res.send({ok: true, message: 'PUT'});
});

// DELETE
router.delete('/', async (req: Request, res: Response) => {
  res.send({ok: true, message: 'DELETE'});
});

export default router;
