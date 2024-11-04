const { decryptText } = require('../config/crypto');
const { connectDb } = require('../dbSetup');
const keyCrypto = "myPassword123456";


class HomeController {
    index(req, res) {
        const userId = req.cookies.userId;
        const USERNAME = req.cookies.username;
        const EMAIL = req.cookies.email
        res.render('HomePage', { userId, USERNAME, EMAIL });
    }

    async login(req, res) {

        const notification = [
            {
                type: "success",
                message: 'Login successful',
            },
            {
                type: "failure",
                message: 'Login failed',
            },
            {
                type: "failure",
                message: 'Username and Password is required',
            }

        ]
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).render('HomePage', {notification: true ,type: notification[2].type, message: notification[2].message })
            }

            let db;
            db = await connectDb();
            const sql = 'SELECT ID, USERNAME, PASSWORD, EMAIL FROM user WHERE USERNAME=?';
            const [rows] = await db.query(sql, [username]);
            console.log("username " + rows[0].USERNAME + " pass " + decryptText(rows[0].PASSWORD, keyCrypto));
            

            if (rows[0].USERNAME === username && decryptText(rows[0].PASSWORD, keyCrypto) === password) {
                res.cookie('userId', rows[0].ID);
                res.cookie('username', rows[0].USERNAME);
                res.cookie('email', rows[0].EMAIL);
                return res.status(200).redirect('/inbox');
            }
            return res.status(400).render('HomePage', {notification: true, type: notification[1].type, message: notification[1].message });
        } catch (error) {
            return res.status(500).json({ message: `${error}` })
        }
    }
}

module.exports = HomeController;