/// <reference path="../../typings.d.ts" />

import { Request, Response, Router } from 'express';

import * as _ from 'lodash';

import { LeaveSettingModel } from '../models/leave-setting';

const leaveSettingModel = new LeaveSettingModel();

const router: Router = Router();

router.post('/settings', async (req: Request, res: Response) => {
  try {
    const employeeTypeId = req.body.employeeTypeId;
    const periodId = req.body.periodId;

    const rs: any = await leaveSettingModel.getSetting(req.db, periodId, employeeTypeId);

    res.send({ ok: true, rows: rs[0] });
  } catch (e) {
    console.log(e);
    res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
  }
});

router.post('/copy-leave-settings', async (req: Request, res: Response) => {
  try {
    const oldPeriodId = req.body.oldPeriodId;
    const nextPeriodId = req.body.nextPeriodId;
    const db = req.db;

    const rs: any = await leaveSettingModel.getCurrentLeaveDaysSetting(req.db, oldPeriodId);

    let data = [];

    rs.forEach(v => {
      let obj: any = {};
      obj.employee_type_id = v.employee_type_id;
      obj.leave_type_id = v.leave_type_id;
      obj.leave_days = v.leave_days;
      obj.period_id = nextPeriodId;
      obj.is_collect = v.is_collect;

      data.push(obj);
    });

    // remove old setting
    await leaveSettingModel.removeOldLeaveDaysSetting(db, nextPeriodId);
    // save new setting
    await leaveSettingModel.saveNewLeaveDaysSetting(db, data);

    res.send({ ok: true });
  } catch (e) {
    console.log(e);
    res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
  }
});

router.post('/save-settings', async (req: Request, res: Response) => {
  const db = req.db;

  try {
    const data = req.body.data;
    const periodId = req.body.periodId;
    const employeeTypeId = req.body.employeeTypeId;

    if (data.length && periodId && employeeTypeId) {
      // clear old data
      await leaveSettingModel.removeSetting(db, periodId, employeeTypeId);
      // save new data
      await leaveSettingModel.saveSetting(db, data);
      res.send({ ok: true });
    } else {
      res.send({ ok: false, error: 'ไม่พบข้อมูลที่ต้องการบันทึก' });
    }

  } catch (e) {
    console.log(e);
    res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
  }
});

router.post('/initial-leave', async (req: Request, res: Response) => {
  const db = req.db;
  const oldPeriodId = req.body.oldPeriodId;
  const nextPeriodId = req.body.nextPeriodId;

  try {
    // TODO: Initial leave days
    // get summary for this period
    const rsSummary = await leaveSettingModel.getAllLeaveSummary(db, oldPeriodId);

    // console.log(rsSummary[0]);
    // calculate new leave days for new period
    let leaveDaysData = [];
    const summary = rsSummary[0];

    summary.forEach(v => {
      let obj: any = {};

      // leave_days = สิทธิ์ที่ได้รับกี่วัน, 0 = ไม่จำกัด
      // max_leave_days สะสมได้ไม่เกินกี่วัน

      obj.employee_id = +v.employee_id;
      obj.period_id = +nextPeriodId;
      obj.leave_type_id = +v.leave_type_id; // ประเภทการลา

      const leaveDays = +v.leave_days

      obj.leave_days_num = leaveDays; // โค้วต้าในการลาทั้งหมดของปีงบประมาณ ค่าปกติได้จาก

      if (v.is_collect === 'Y') { // สามารถสะสมวันลาได้ (สำหรับประเภทนั้นเท่านั้น)
        // วันลาคงเหลือของปีงบปัจจุบัน
        let remainDays = +v.collected_leave_days - +v.total_leave_days;
        // วันลาที่มีสิทธิ์ลาได้ทั้งหมดในปีงบประมาณถัดไป
        let totalLeaveDays = remainDays + leaveDays;
        // โควต้าสูงสุดในการสะสม ในกรณีที่สะสมได้
        const maxCollectedLeaveDays = +v.max_leave_days || 0;

        if (totalLeaveDays > maxCollectedLeaveDays) { // วันลาคงเหลือ + สะสม เกินกว่าโควต้าที่ได้รับ
          obj.leave_days_num = maxCollectedLeaveDays; // โควต้าสูงสุดในการสะสม 
        } else {
          obj.leave_days_num = totalLeaveDays; // ใช้วันลารวมสะสมทั้งหมด
        }
      }

      leaveDaysData.push(obj);

    });
    // save new leave days for new period
    console.log(leaveDaysData);

    // remove old data
    await leaveSettingModel.removeLeaveDaysForNextPeriod(db, nextPeriodId);
    await leaveSettingModel.saveLeaveDaysNewPeriod(db, leaveDaysData);

    res.send({ ok: true });

  } catch (e) {
    console.log(e);
    res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
  }
});

export default router;
