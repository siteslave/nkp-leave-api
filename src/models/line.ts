import knex = require("knex");

var request = require("request");
export class LineModel {

    sendNotify(message) {
        var options = {
            method: 'POST',
            url: 'https://notify-api.line.me/api/notify',
            headers:
            {
                'Postman-Token': 'da447963-1647-4dd7-8ce9-8b659a8be7ea',
                'cache-control': 'no-cache',
                'Authorization': `Bearer ${process.env.LINE_NOTIFY_TOKEN}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            form:
            {
                message: message
            }
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            console.log(body);
        });

    }

    replyMessage(replyToken, messages) {
        var options = {
            method: 'POST',
            url: 'https://api.line.me/v2/bot/message/reply',
            headers:
            {
                'cache-control': 'no-cache',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.LINE_BOT_TOKEN}`,
            },
            body:
            {
                replyToken: replyToken,
                messages: messages
            },
            json: true
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            console.log(body);
        });
    }

    pushMessage(userId, messages) {
        var options = {
            method: 'POST',
            url: 'https://api.line.me/v2/bot/message/push',
            headers:
            {
                'cache-control': 'no-cache',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.LINE_BOT_TOKEN}`,
            },
            body:
            {
                to: userId,
                messages: messages
            },
            json: true
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            console.log(body);
        });
    }

    getLineId(db: knex, lineId) {
        return db('employee_line')
            .where('line_id', lineId)
    }

    getPeriod(db: knex) {
        return db('periods')
            .select('period_id')
            .where('is_current', 'Y')
            .limit(1)
            .as('period_id');
    }
}
