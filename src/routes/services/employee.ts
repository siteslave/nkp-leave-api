/// <reference path="../../../typings.d.ts" />

import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import * as moment from 'moment';
import * as fse from 'fs-extra';
import * as multer from 'multer';
import * as ejs from 'ejs';
import * as pdf from 'html-pdf';
import * as rimraf from 'rimraf';

const excel = require('excel4node');

import { Request, Response, Router } from 'express';
import { LeaveTypeModel } from "../../models/leave_type";
import { LeaveModel } from "../../models/leave";
import { EmployeeModel } from "../../models/employee";
import { LineModel } from '../../models/line';

const leaveTypeModel = new LeaveTypeModel();
const leaveModel = new LeaveModel();
const employeeModel = new EmployeeModel();
const lineModel = new LineModel();

const router: Router = Router();

const uploadDir = process.env.UPLOAD_DIR || './uploads';

fse.ensureDirSync(uploadDir);

var storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    let _ext = path.extname(file.originalname);
    cb(null, Date.now() + _ext)
  }
});

let upload = multer({ storage: storage });

// upload file
router.post('/uploads', upload.any(), async (req: Request, res: Response) => {
  const db: any = req.db;
  const employeeId = req.decoded.employee_id;

  var fileName = '';
  var mimeType = '';

  if (req.files.length) {
    fileName = req.files[0].filename || null;
    mimeType = req.files[0].mimetype || null;
  }

  console.log(req.files);
  // save data

  if (fileName) {
    try {
      // remove old image
      await employeeModel.removeImage(db, employeeId);
      // save image
      await employeeModel.saveImage(db, employeeId, fileName, mimeType);

      res.send({ ok: true });

    } catch (error) {
      res.send({ ok: false, error: error.message });
    }
  } else {
    res.send({ ok: false, error: 'File not found!' });
  }
});

// render file
router.get('/image', async (req: Request, res: Response) => {
  const db: any = req.db;
  const employeeId: any = req.decoded.employee_id;

  try {
    const rs: any = await employeeModel.getImage(db, employeeId);

    if (rs.length) {
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const fileName = rs[0].image_path;

      const imagePath = path.join(uploadDir, fileName);
      const mimeType = rs[0].mime_type;

      res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
      res.setHeader('Content-type', mimeType);

      let filestream = fs.createReadStream(imagePath);
      filestream.pipe(res);
    } else {
      res.send({ ok: false, error: 'image not found!', statusCode: 500 });
    }
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, statusCode: 500 });
  }

});

router.get('/leave-types', async (req: Request, res: Response) => {
  try {
    const rs: any = await leaveTypeModel.read(req.db, null, 100, 0);
    res.send({ ok: true, rows: rs });
  } catch (e) {
    console.log(e);
    res.send({ ok: false, error: e.message });
  }

});

// CREATE
router.post('/leaves', async (req: Request, res: Response) => {
  const periodId = req.decoded.period_id;
  const employeeId = req.decoded.employee_id;
  const leaveTypeId = req.body.leaveTypeId;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const leaveDays = req.body.leaveDays;
  const remark = req.body.remark;

  if (leaveTypeId && startDate && endDate && leaveDays) {
    try {
      const data: any = {};
      data.period_id = periodId;
      data.employee_id = employeeId;
      data.leave_type_id = leaveTypeId;
      data.start_date = startDate;
      data.end_date = endDate;
      data.leave_days = leaveDays;
      data.remark = remark;

      await leaveModel.create(req.db, data);
      await lineModel.sendNotify('มีผู้บันทึกวันลาเข้ามาใหม่');
      req.mqttClient.publish('manager/main', 'reload');
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
// :3000/services/users/leaves/xx
router.put('/leaves/:leaveId', async (req: Request, res: Response) => {

  const leaveId = req.params.leaveId;

  const leaveTypeId = req.body.leaveTypeId;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const leaveDays = req.body.leaveDays;
  const remark = req.body.remark;

  if (leaveId && leaveTypeId && startDate && endDate && leaveDays) {
    try {
      const data: any = {};
      data.leave_type_id = leaveTypeId;
      data.start_date = startDate;
      data.end_date = endDate;
      data.leave_days = leaveDays;
      data.remark = remark;

      await leaveModel.update(req.db, leaveId, data);
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
router.delete('/leaves/:leaveId', async (req: Request, res: Response) => {

  const leaveId = req.params.leaveId;
  const employeeId = req.decoded.employee_id;

  if (leaveId) {
    try {
      await leaveModel.delete(req.db, leaveId, employeeId);
      res.send({ ok: true });
    } catch (e) {
      console.log(e);
      res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
    }
  } else {
    res.send({ ok: false, error: 'ข้อมูลไม่ครบ' });
  }
});


router.get('/info', async (req: Request, res: Response) => {

  const employeeId = req.decoded.employee_id;

  if (employeeId) {
    try {
      const rs: any = await employeeModel.getInfo(req.db, employeeId);
      if (rs.length) {
        const info = rs[0];
        res.send({ ok: true, info: info });
      } else {
        res.send({ ok: false, error: 'ไม่พบข้อมูล' });
      }
    } catch (e) {
      console.log(e);
      res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
    }
  } else {
    res.send({ ok: false, error: 'ข้อมูลไม่ครบ' });
  }
});

router.get('/export', async (req: Request, res: Response) => {

  const db = req.db;
  const employeeId = req.decoded.employee_id;
  const periodId = req.decoded.period_id;

  if (employeeId) {
    try {
      const wb = new excel.Workbook();
      const ws1 = wb.addWorksheet('สรุปการลา');
      const ws2 = wb.addWorksheet('ประวัติการลา');

      var myNumber = wb.createStyle({
        numberFormat: '#,##0; (#,##0); -',
      });

      // วันลาล่าสุด	ลาทั้งหมด (วัน)	คงเหลือ (วัน)
      // header สำหรับสรุปการลา
      ws1.cell(1, 1).string('สรุปการลาประจำปีงบประมาณ');
      ws1.cell(2, 1).string('ประเภทการลา');
      ws1.cell(2, 2).string('วันที่ลาล่าสุด');
      ws1.cell(2, 3).string('ลาทั้งหมด (วัน)');
      ws1.cell(2, 4).string('คงเหลือ (วัน)');

      // ประเภทการลา	วันที่ลา	จำนวนวัน	ปีงบประมาณ	สถานะ
      // header สำหรับประวัติ
      ws2.cell(1, 1).string('ประวัติการลาประจำปีงบประมาณ');
      ws2.cell(2, 1).string('ประเภทการลา');
      ws2.cell(2, 2).string('วันที่');
      ws2.cell(2, 3).string('จำนวนวัน');
      ws2.cell(2, 4).string('ปีงบประมาณ');
      ws2.cell(2, 5).string('สถานะ');

      const rs: any = await leaveModel.getLeaveHistoryByEmployee(db, employeeId, periodId);
      const rsLeaveDays = await leaveModel.getCurrentLeaveSummary(db, employeeId, periodId);

      const summary: any = [];

      for (const item of rsLeaveDays) {
        const obj: any = {};
        obj.leave_type_name = item.leave_type_name;
        obj.leave_type_id = item.leave_type_id;
        obj.leave_days_num = item.leave_days_num;
        const total = await leaveModel.getCurrentLeaveTotal(db, employeeId, periodId, item.leave_type_id);
        const lastLeaveDay = await leaveModel.getLastLeaveDay(db, employeeId, periodId, item.leave_type_id);
        obj.current_leave = total;
        obj.last_leave_day = lastLeaveDay ? moment(lastLeaveDay).locale('th').format('DD MMMM YYYY') : '-';

        if (obj.leave_days_num > 0) {
          obj.remain_days = +obj.leave_days_num - +obj.current_leave;
        } else {
          obj.remain_days = 0;
        }

        summary.push(obj);
      }

      let startRow = 3;

      summary.forEach(v => {
        ws1.cell(startRow, 1).string(v.leave_type_name);
        ws1.cell(startRow, 2).string(v.last_leave_day);
        ws1.cell(startRow, 3).number(v.current_leave).style(myNumber);
        ws1.cell(startRow, 4).number(v.remain_days).style(myNumber);

        startRow++;
      });

      const endCell = startRow - 1;
      ws1.cell(startRow, 2).string('รวม');
      ws1.cell(startRow, 3).formula(`SUM(C3:C${endCell})`).style(myNumber);
      ws1.cell(startRow, 4).formula(`SUM(D3:D${endCell})`).style(myNumber);

      // history
      let startRow2 = 3;

      rs.forEach(v => {
        ws2.cell(startRow2, 1).string(v.leave_type_name);

        let startDate = `${moment(v.start_date).locale('th').format('D MMM ')} พ.ศ. ${moment(v.start_date).get('year') + 543}`;
        let endDate = `${moment(v.end_date).locale('th').format('D MMM ')} พ.ศ. ${moment(v.end_date).get('year') + 543}`;
        let leaveDays = `${startDate} - ${endDate}`;

        ws2.cell(startRow2, 2).string(leaveDays);
        ws2.cell(startRow2, 3).number(v.leave_days).style(myNumber);
        ws2.cell(startRow2, 4).string(v.period_name);
        ws2.cell(startRow2, 5).string(v.leave_status);

        startRow2++;
      });

      const endCell2 = startRow2 - 1;
      ws2.cell(startRow2, 2).string('รวม');
      ws2.cell(startRow2, 3).formula(`SUM(C3:C${endCell2})`).style(myNumber);

      const rnd = moment().format('x');
      const exportFile = `สรุปการลา-${rnd}.xlsx`;
      wb.write(exportFile, res);

    } catch (e) {
      console.log(e);
      res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
    }
  } else {
    res.send({ ok: false, error: 'ข้อมูลไม่ครบ' });
  }
});

router.put('/info', async (req: Request, res: Response) => {

  const employeeId = req.decoded.employee_id;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const password = req.body.password || null;

  if (employeeId && firstName && lastName) {
    try {
      let data: any = {};
      data.first_name = firstName;
      data.last_name = lastName;

      if (password) {
        const encPassword = crypto.createHash('md5').update(password).digest('hex');
        data.password = encPassword;
      }

      await employeeModel.update(req.db, employeeId, data);
      res.send({ ok: true });
    } catch (e) {
      console.log(e);
      res.send({ ok: false, code: 500, error: 'เกิดข้อผิดพลาด' });
    }
  } else {
    res.send({ ok: false, error: 'ข้อมูลไม่ครบ' });
  }
});

router.get('/pdf', async (req: Request, res: Response) => {
  const db = req.db;
  const employeeId = req.decoded.employee_id;
  const periodId = req.decoded.period_id;

  const exportPath = path.join(__dirname, '../../../output');
  fse.ensureDirSync(exportPath);

  const fileName = `${moment().format('x')}.pdf`;
  const pdfPath = path.join(exportPath, fileName);

  const _ejsPath = path.join(__dirname, '../../../templates/history.ejs');
  let contents = fs.readFileSync(_ejsPath, 'utf8');

  const rs: any = await leaveModel.getLeaveHistoryByEmployee(db, employeeId, periodId);
  const rsEmployee: any = await employeeModel.getInfo(db, employeeId);

  let data: any = {};

  data.periodName = req.decoded.period_name;
  data.fullname = rsEmployee ? `${rsEmployee[0].first_name} ${rsEmployee[0].last_name}` : '-';
  data.positionName = rsEmployee ? rsEmployee[0].position_name : '-';

  data.items = [];

  rs.forEach(v => {
    let startDate = `${moment(v.start_date).locale('th').format('D MMM ')} พ.ศ. ${moment(v.start_date).get('year') + 543}`;
    let endDate = `${moment(v.end_date).locale('th').format('D MMM ')} พ.ศ. ${moment(v.end_date).get('year') + 543}`;

    const obj: any = {};
    obj.leave_type_name = v.leave_type_name;
    obj.start_date = startDate;
    obj.end_date = endDate;
    obj.leave_days = v.leave_days;
    obj.period_name = v.period_name;
    obj.leave_status = v.leave_status;

    data.items.push(obj);
  });

  // create HTML file
  let html = ejs.render(contents, data);

  // Pdf size
  let options = { format: 'A4', orientation: "landscape" };

  // Create pdf file
  pdf.create(html, options).toFile(pdfPath, function (err, data) {
    if (err) {
      console.log(err);
      res.send({ ok: false, error: err });
    } else {
      fs.readFile(pdfPath, function (err, data) {
        if (err) {
          res.send({ ok: false, error: err });
        } else {

          rimraf.sync(pdfPath);

          res.contentType("application/pdf");
          res.send(data);
        }
      });
    }
  });

});

export default router;
