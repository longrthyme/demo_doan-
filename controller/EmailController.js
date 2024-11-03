const { connectDb } = require("../dbSetup");
const path = require("path");
const fs = require('fs')

class EmailController {
    index(req, res) {
        const pageNumber = req.params.id;
        return res.render('EmailDetailPage', { page: { pageNumber } });
    }

    async read(req, res) {
        const pageNumber = req.params.id;
        const USERNAME = req.cookies.username;
        const EMAIL = req.cookies.email;
        const totalReceivedEmail = req.cookies.totalReceivedEmail;
        const totalSendedEmail = req.cookies.totalSendedEmail;
        let db;
        try {
            db = await connectDb();
            const sql = `SELECT ID, SUBJECT, MESSAGE, FILE FROM EMAILS WHERE ID = ?`;
            const [rows] = await db.query(sql, pageNumber);
            if (rows.length > 0) {
                return res.status(200).render('EmailDetailPage', { data: rows[0], EMAIL, totalReceivedEmail, totalSendedEmail, USERNAME });
            }
            return res.status(400).json({ message: `Cannot find detail email ${pageNumber}}` })
        } catch (error) {
            return res.status(500).json({ error: `${error}` });
        }
    }



    async downloadFile(req, res, next) {
        let db;
        try {
            const userId = req.params.id;
            console.log(userId);
            db = await connectDb();
            const sql = `SELECT FILE, MIME_TYPE, ORIGINAL_FILENAME FROM EMAILS WHERE IS_DELETED_BY_RECIPIENT=FALSE AND ID=? `;
            const [rows] = await db.query(sql, userId)


            if (rows.length === 0 || !rows[0].FILE) {
                return res.status(404).json({ message: 'File not found!' });
            }

            const fileBuffer = rows[0].FILE;
            const mimeType = rows[0].MIME_TYPE || 'application/octet-stream'; // MIME type được lưu
            const originalFilename = rows[0].ORIGINAL_FILENAME || `file_${userId}`; // Tên file gốc (nếu có)

            // Thiết lập headers cho phản hồi
            res.set({
                'Content-Type': mimeType,
                'Content-Disposition': `attachment; filename="${originalFilename}"`,
                'Content-Length': fileBuffer.length
            });

            res.send(fileBuffer);
        } catch (error) {
            console.error("Error during file download:", error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

}

module.exports = EmailController;