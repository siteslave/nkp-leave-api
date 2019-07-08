/// <reference path="../../typings.d.ts" />

import { Request, Response, Router } from 'express';

import { SharedModel } from "../models/shared";

const sharedModel = new SharedModel();

const router: Router = Router();

// DELETE
router.get('/periods', async (req: Request, res: Response) => {

  try {
    const rs: any = await sharedModel.getPeriods(req.db);
    res.send({ ok: true, rows: rs });
  } catch (e) {
    console.log(e);
    res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
  }

});

export default router;
