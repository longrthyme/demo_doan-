const { connectDb } = require("../dbSetup");
const fs = require('fs')
const multer = require('multer');
const upload = multer();

class ComposeController {
    index(req, res) {
        const userId = req.cookies.userId;
        const USERNAME = req.cookies.username;
        const EMAIL = req.cookies.email;
        const totalReceivedEmail = req.cookies.totalReceivedEmail;
        const totalSendedEmail = req.cookies.totalSendedEmail;
        console.log("email" + USERNAME + " totalReceive " + totalReceivedEmail  + " totalSent " + totalSendedEmail)
        res.render('ComposePage', { data: userId, USERNAME, EMAIL, totalReceivedEmail, totalSendedEmail, errors: {} });
    }

    async create(req, res) {
        const userId = req.cookies.userId;
        const USERNAME = req.cookies.username;
        const EMAIL = req.cookies.email;
        const totalReceivedEmail = req.cookies.totalReceivedEmail;
        const totalSendedEmail = req.cookies.totalSendedEmail;
        const notification = [
            {
                type: "success",
                message: 'Email sent successfully',
            },
            {
                type: "failure",
                message: 'Email sending failed',
            }
        ];

        let db;
        const sender_id = req.cookies.userId;
        const { recipient, subject, message, myFile } = req.body;
        const fileData = req.file; // Lấy nội dung file

        const errors = {};

        if (!recipient) {
            errors.recipient = `Please enter a recipient`;
        }
        if (!subject) {
            errors.subject = `Please enter a subject`;
        }
        if (Object.keys(errors).length > 0) {
            // return res.status(400).json({ errors });
            res.status(400).render('ComposePage', { 
                errors: errors
            });
        }

        try {
            db = await connectDb();
            const sql1 = `SELECT ID FROM user WHERE USERNAME= ?`;
            const [rows] = await db.query(sql1, recipient);
            if (!rows.length) {
                return res.status(400).json({ message: `Cannot find username ${recipient}` });
            }

            const values = [
                sender_id,
                rows[0].ID,
                subject,
                message,
                fileData.buffer,  // Lưu file dưới dạng Buffer
                fileData.mimetype, // MIME type của file
                fileData.originalname // Tên file gốc
            ];

            const sql2 = `INSERT INTO emails (SENDER_ID, RECIPIENT_ID, SUBJECT, MESSAGE, FILE, MIME_TYPE, ORIGINAL_FILENAME) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            const [data] = await db.query(sql2, values);
            if (data.affectedRows > 0) {
                return res.status(200).render('ComposePage', { notification: true, type: notification[0].type, message: notification[0].message, data: userId, USERNAME, EMAIL, totalReceivedEmail, totalSendedEmail, errors: {} });
            }
            return res.status(400).render('ComposePage', { notification: true, type: notification[1].type, message: notification[1].message, data: userId, USERNAME, EMAIL, totalReceivedEmail, totalSendedEmail, errors: {} });
        } catch (error) {
            // return res.status(500).json({ message: `${error}` });
            res.status(500).render('ComposePage', { 
                errors: error
            });
        } finally {
            if (db) await db.end();
        }
    }

    async getRecipient(req, res) {
        const current_username = req.cookies.username;
        let db;
        try {
            db = await connectDb();
            const sql = `SELECT USERNAME FROM user WHERE USERNAME != ?`;
            const [rows] = await db.query(sql, [current_username]);
            if (rows) {
                return res.status(200).json([rows]);
            }
            return res.status(400).json({ message: `Cannot get the datd` });
        } catch (error) {
            return res.status(500).json({ error: `${error}` })
        }
    }




}

module.exports = ComposeController;