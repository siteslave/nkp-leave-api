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
}
