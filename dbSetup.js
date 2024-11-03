const mysql2 = require("mysql2/promise");
const { encryptText } = require("./config/crypto");
const keyCrypto = "myPassword123456";


async function connectDb() {
    const studentId = "2201040080";
    const dbName = `wpr${studentId}`;
    try {
        const dbConfig = {
            host: "localhost",
            user: "wpr",
            password: "fit2024",
        };
        const db = await mysql2.createConnection(dbConfig);
        await db.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        console.log(`Database ${dbName} is ready for use.`);

        await db.end();
        dbConfig.database = dbName;
        return await mysql2.createConnection(dbConfig);
    } catch (error) {
        console.error("Error connecting to the database:", error);
        throw error;
    }
}

async function setupDatabase() {
    try {
        let db;
        db = await connectDb();

        const sql1 = `CREATE TABLE IF NOT EXISTS user  (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255),
            email VARCHAR(255) UNIQUE,
            password VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;
        await db.query(sql1);
        console.log("User table created successfully");

        const sql2 = `CREATE TABLE IF NOT EXISTS emails (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT,
        recipient_id INT,
        subject VARCHAR(255),
        message TEXT,
        file LONGBLOB,
        mime_type VARCHAR(255),
        original_filename VARCHAR(255),
        send_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        is_deleted_by_recipient BOOLEAN DEFAULT FALSE,
        is_deleted_by_sender BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (sender_id) REFERENCES user(id),
        FOREIGN KEY (recipient_id) REFERENCES user(id)
      );`;
        await db.query(sql2);
        console.log("Email table created successfully");

        const users = [
            {
                username: "Alice Anderson",
                email: "a@a.com",
                password: "123",
            },
            {
                username: "Tony Stark",
                email: "tony@example.com",
                password: "123456",
            },
            {
                username: "Hùng",
                email: "hung@gmail.com",
                password: "22112004",
            },
        ];

        for (const user of users) {
            const encryptedPassword = encryptText(user.password, keyCrypto);
            await db.query(`INSERT INTO user (username, email, password) VALUES (?, ?, ?)`, [user.username, user.email, encryptedPassword])
        }

        await db.query(`
            INSERT INTO emails (sender_id, recipient_id, subject, message, file, send_at, received_at) VALUES
            (1, 2, "Email 1", "Message for email 1", NULL, NOW(), NOW()),
            (1, 3, "Email 2", "Message for email 2", NULL, NOW(), NOW()),
            (2, 1, "Email 3", "Message for email 3", NULL, NOW(), NOW()),
            (2, 3, "Email 4", "Message for email 4", NULL, NOW(), NOW()),
            (3, 1, "Email 5", "Message for email 5", NULL, NOW(), NOW()),
            (3, 2, "Email 6", "Message for email 6", NULL, NOW(), NOW()),
            (1, 2, "Email 7", "Message for email 7", NULL, NOW(), NOW()),
            (1, 3, "Email 8", "Message for email 8", NULL, NOW(), NOW()),
            (2, 1, "Email 9", "Message for email 9", NULL, NOW(), NOW()),
            (2, 3, "Email 10", "Message for email 10", NULL, NOW(), NOW()),
            (3, 1, "Email 11", "Message for email 11", NULL, NOW(), NOW()),
            (3, 2, "Email 12", "Message for email 12", NULL, NOW(), NOW()),
            (1, 2, "Email 13", "Message for email 13", NULL, NOW(), NOW()),
            (1, 3, "Email 14", "Message for email 14", NULL, NOW(), NOW()),
            (2, 1, "Email 15", "Message for email 15", NULL, NOW(), NOW()),
            (2, 3, "Email 16", "Message for email 16", NULL, NOW(), NOW()),
            (3, 1, "Email 17", "Message for email 17", NULL, NOW(), NOW()),
            (3, 2, "Email 18", "Message for email 18", NULL, NOW(), NOW()),
            (1, 2, "Email 19", "Message for email 19", NULL, NOW(), NOW()),
            (1, 3, "Email 20", "Message for email 20", NULL, NOW(), NOW()),
            (2, 1, "Email 21", "Message for email 21", NULL, NOW(), NOW()),
            (2, 3, "Email 22", "Message for email 22", NULL, NOW(), NOW()),
            (3, 1, "Email 23", "Message for email 23", NULL, NOW(), NOW()),
            (3, 2, "Email 24", "Message for email 24", NULL, NOW(), NOW()),
            (1, 2, "Email 25", "Message for email 25", NULL, NOW(), NOW()),
            (1, 3, "Email 26", "Message for email 26", NULL, NOW(), NOW()),
            (2, 1, "Email 27", "Message for email 27", NULL, NOW(), NOW()),
            (2, 3, "Email 28", "Message for email 28", NULL, NOW(), NOW()),
            (3, 1, "Email 29", "Message for email 29", NULL, NOW(), NOW()),
            (3, 2, "Email 30", "Message for email 30", NULL, NOW(), NOW())
        `);
        await db.end();
    } catch (error) {
        console.error(`Error: ${error}`);
    }
}

module.exports = { connectDb, setupDatabase };
