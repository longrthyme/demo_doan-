const { error } = require("console");
const { encryptText } = require("../config/crypto");
const { connectDb } = require("../dbSetup");
const keyCrypto = "myPassword123456";

class RegisterController {
    index(req, res) {
        const { username, email, password, password_confirmation } = req.body;
        res.render("SignUp", {
            error,
            username,
            email,
            password,
            password_confirmation,
        });
    }



    async create(req, res) {
        const { username, email, password, password_confirmation } = req.body;

        if (!username || !email || !password || !password_confirmation) {
            return res
                .status(400)
                .json({ type: "failure", message: "All fields are required." });
        }

        if (password !== password_confirmation) {
            return res
                .status(400)
                .json({ type: "failure", message: "Passwords do not match" });
        }

        const encryptedPassword = encryptText(password, keyCrypto);
        const user = [username, email, encryptedPassword];

        let db;
        try {
            db = await connectDb();

            const sql = `SELECT EMAIL FROM user WHERE EMAIL = ?`;
            const [rows] = await db.query(sql, [email]);

            if (rows && rows.length > 0) {
                // Truyền notification cho email đã tồn tại
                return res.render('SignUp', {
                    notification: true,
                    type: "failure",
                    message: "Email has already existed",
                    username,
                    email,
                    password,
                    password_confirmation,
                });
            }

            const sql2 = `INSERT INTO user (USERNAME, EMAIL, PASSWORD) VALUES (?, ?, ?)`;
            const result = await db.query(sql2, user);

            if (result && result[0].affectedRows > 0) {
                return res.status(200).redirect("/");
            } else {
                return res.status(400).json({ message: "Failed to create user" });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: `${error}` });
        }
    }

    
}

module.exports = RegisterController;
