var Imap = require("imap"),
    MailParser = require("mailparser").simpleParser,
    Promise = require("bluebird"),
    fs = require("fs"),
    moment = require("moment"),
    logger = require('./logger.js'),
    authenticate = require("./config.js"),
    _ = require('lodash'),
    mailData = [],
    filterd=[],
    unique = [],
    flags = [],
    totalEmails,
    l=null,
    maxi,
    k=0;

maxi= function() {
    if(k<authenticate.length){
        Promise.longStackTraces();
        var imap = new Imap(authenticate[k]);
        Promise.promisifyAll(imap);
        imap.once("ready", execute);
        imap.once("error", function (err) {
            logger.info("Connection error:" + err.stack);
        });
        imap.connect();
        function execute() {
            imap.openBox("INBOX", false, function (err, mailBox) {
                if (err) {
                    logger.error("err", err);
                    return;
                } else {
                    imap.search(["UNSEEN"], function (err, results) {
                        if (!results || !results.length) {
                            logger.info("No unread mails");
                            imap.end();
                            return;
                        } else {
                            totalEmails = results.length;
                            var arr = _.chunk(results.reverse(), 1000);
                            var unSeenEmails = imap.fetch(arr[0], {bodies: "", markSeen: true});
                            unSeenEmails.on("message", processMessage);
                            unSeenEmails.once("error", function (err) {
                                return Promise.reject(err);
                            });
                            unSeenEmails.once("end", function () {
                                imap.end();
                            });
                        }
                    });
                }
            });
        }
        function processMessage(msg, seqno) {
            msg.on("body", function (stream) {
                MailParser(stream, function (err, data) {
                    if (err)
                        logger.error("error while parsing the data:", err);
                    else {
                        if ((data.subject.indexOf('job') !== -1) || (data.subject.indexOf('skills') !== -1) || (data.text.indexOf('job') !== -1) || (data.text.indexOf('skills') !== -1) || (data.text.indexOf('hire') !== -1))
                            mailData.push({from: data.from.value[0].address, subject: data.subject, body: data.text});

                        logger.info("created file:", totalEmails);
                    }
                });
            });
        }

        k++;
    }
    else{clearInterval();
    }
};
(function(){
    l=setInterval(maxi,110000);
})();
