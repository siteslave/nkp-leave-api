/// <reference path="../../typings.d.ts" />

import * as crypto from "crypto";
import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';

import { JwtModel } from "../models/jwt";
import { LineModel } from '../models/line';
import { LoginModel } from '../models/login';
import { LeaveModel } from '../models/leave';

const jwtModel = new JwtModel();
const lineModel = new LineModel();
const loginModel = new LoginModel();
const leaveModel = new LeaveModel();
const router: Router = Router();

router.get('/id/:id', async (req: Request, res: Response) => {
  const lineId = req.params.id;
  const db = req.db;
  try {
    const rs = await lineModel.getLineId(db, lineId);
    if (rs.length) {
      res.send({ ok: true, rows: rs[0] });
    } else {
      res.send({ ok: false });
    }
  } catch (error) {
    res.send({ ok: false, error: error });
  }
});

router.post('/webhook', async (req: Request, res: Response) => {
  if (req.body.events.length) {
    const db = req.db;
    const event = req.body.events[0];
    const replyToken = event.replyToken;
    const userId = event.source.userId;
    const type = event.type;
    const message = event.message;

    const register: any = {
      "type": "template",
      "altText": "This is a buttons template",
      "template": {
        "type": "buttons",
        "title": "ลงทะเบียน",
        "text": "กรุณาคลิกลงทะเบียน",
        "actions": [
          {
            "type": "uri",
            "label": "ลงทะเบียน",
            "uri": `${process.env.SERVER_URL}/line/register?userId=${userId}`
          }]
      }
    };
    if (type === 'follow') {
      const data = [];
      data.push({ type: 'text', text: 'สวัสดีครับ ยินดีต้องรับเข้าสู่ระบบลาราชการ' });
      data.push(register)
      await lineModel.replyMessage(replyToken, data);
    } else if (type === 'message') {
      const rs = await lineModel.getLineId(req.db, userId);
      const employeeId = rs[0].employee_id;
      if (rs.length) {
        if (message.type === 'text') {
          // ------------------ code here ------------------


          // ------------------------------------------------

          // if (message.text === 'สถานะใบลา') {
          //   const flex = await statusLeave(db, employeeId);
          //    await lineModel.replyMessage(replyToken, flex);
          // } else if (message.text === 'ประวัติการลา') {
          //   const flex = await historyLeave(db, employeeId);
          //    await lineModel.replyMessage(replyToken, flex);
          // } else if (message.text === 'วันลาคงเหลือ') {
          //   const flex = await balanceLeave(db, employeeId);
          //   await lineModel.replyMessage(replyToken, flex);
          // }
        }
      } else {
        await lineModel.replyMessage(replyToken, [register]);
      }
    }
  }
  console.log(req.body.events);

  res.sendStatus(200);
});

router.post('/register', async (req: Request, res: Response) => {
  const username = req.body.username;
  const password = req.body.password;
  const userId = req.body.userId;

  if (username && password && userId) {
    try {
      const encPassword = crypto.createHash('md5').update(password).digest('hex');
      let rs: any = await loginModel.login(req.db, username, encPassword);
      if (rs.length) {
        await loginModel.register(req.db, userId, rs[0].employee_id);
        await lineModel.pushMessage(userId, [{ type: 'text', text: 'ลงทะเบียนเสร็จสิ้น ' }]);
        res.send({ ok: true, rows: rs[0] });
      } else {
        res.send({ ok: false, error: 'ชื่อผู้ใช้งาน หรือ รหัสผ่าน ไม่ถูกต้อง' });
      }
    } catch (error) {
      res.send({ ok: false, error: error.message });
    }
  } else {
    res.send({ ok: false, error: 'ข้อมูลไม่ครบ' });
  }
});

async function statusLeave(db, employeeId) {
  const rs = await leaveModel.leaveLast(db, employeeId);
  console.log(rs[0]);
  const flex = {
    "type": "flex",
    "altText": "this is a flex message",
    "contents": {
      "type": "bubble",
      "head": {},
      "hero": {},
      "body": {},
      "footer": {}
    }
  }
  return flex;
}

async function historyLeave(db, employeeId) {
  const rs = await leaveModel.leaveLast(db, employeeId, 5);
  console.log(rs);
  const flex = {

  }
  return flex;
}

async function balanceLeave(db, employeeId) {
  const period = await lineModel.getPeriod(db);
  const rsLeaveDays: any = await leaveModel.getCurrentLeaveSummary(db, employeeId, period[0].period_id);
  for (const i of rsLeaveDays) {
    i.total = await leaveModel.getCurrentLeaveTotal(db, employeeId, period[0].period_id, i.leave_type_id);
  }
  console.log(rsLeaveDays);
  const flex = {

  }
  return flex;
}

export default router;
