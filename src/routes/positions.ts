/// <reference path="../../typings.d.ts" />

import { Request, Response, Router } from 'express';

import { PositionModel } from "../models/positions";

const positionModel = new PositionModel();

const router: Router = Router();

// READ
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = +req.query.limit || 20; // ?limit=20
    const offset = +req.query.offset || 0; // ?offset=0

    const query = req.query.query || null;

    const rs: any = await positionModel.read(req.db, query, limit, offset);
    const rsTotal: any = await positionModel.getTotal(req.db, query);
    const total = rsTotal[0].total;

    res.send({ ok: true, rows: rs, total: total });
  } catch (e) {
    console.log(e);
    res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
  }
});

// CREATE
router.post('/', async (req: Request, res: Response) => {
  const positionName = req.body.positionName;

  if (positionName) {
    try {
      const data: any = {};
      data.position_name = positionName;
      await positionModel.create(req.db, data);
      res.send({ ok: true });
    } catch (e) {
      console.log(e);
      res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
    }
  } else {
    res.send({ ok: false, error: 'ข้อมูลไม่ครบ' });
  }
});

// UPDATE
router.put('/:positionId', async (req: Request, res: Response) => {
  const positionName = req.body.positionName;
  const positionId = req.params.positionId;

  if (positionName && positionId) {
    try {
      const data: any = {};
      data.position_name = positionName;

      await positionModel.update(req.db, positionId, data);
      res.send({ ok: true });
    } catch (e) {
      console.log(e);
      res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
    }
  } else {
    res.send({ ok: false, error: 'ข้อมูลไม่ครบ' });
  }
});

// DELETE
router.delete('/:positionId', async (req: Request, res: Response) => {

  const positionId = req.params.positionId;

  if (positionId) {
    try {
      await positionModel.delete(req.db, positionId);
      res.send({ ok: true });
    } catch (e) {
      console.log(e);
      res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
    }
  } else {
    res.send({ ok: false, error: 'ข้อมูลไม่ครบ' });
  }
});

export default router;
