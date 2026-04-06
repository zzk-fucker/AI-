const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 初始化数据库
const db = new sqlite3.Database('./experiment.db', (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to SQLite database');
        initDatabase();
    }
});

// 创建数据库表
function initDatabase() {
    // 实验结果表
    db.run(`CREATE TABLE IF NOT EXISTS experiment_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT NOT NULL,
        student_name TEXT NOT NULL DEFAULT '',
        interactions TEXT NOT NULL,
        turing_test TEXT NOT NULL,
        survey TEXT NOT NULL,
        created_at DATETIME DEFAULT (datetime('now', 'localtime'))
    )`);

    // 管理员表
    db.run(`CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT (datetime('now', 'localtime'))
    )`, (err) => {
        if (!err) {
            // 创建默认管理员账号 (woshizhazhakun/Aa20060324)
            const hashedPassword = bcrypt.hashSync('Aa20060324', 10);
            db.run(`INSERT OR IGNORE INTO admins (username, password) VALUES (?, ?)`,
                ['woshizhazhakun', hashedPassword]);
        }
    });

    // 迁移：如果 student_name 列不存在则添加
    db.all("PRAGMA table_info(experiment_results)", [], (err, columns) => {
        if (!err && columns) {
            const hasNameColumn = columns.some(col => col.name === 'student_name');
            if (!hasNameColumn) {
                db.run(`ALTER TABLE experiment_results ADD COLUMN student_name TEXT NOT NULL DEFAULT ''`);
            }
        }
    });
}

// JWT 验证中间件
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// API 路由

// 提交实验数据
app.post('/api/submit', (req, res) => {
    const { student_id, student_name, interactions, turing_test, survey } = req.body;

    if (!student_id || !student_name || !interactions || !turing_test || !survey) {
        return res.status(400).json({ error: 'Missing required data' });
    }

    const sql = `INSERT INTO experiment_results (student_id, student_name, interactions, turing_test, survey) VALUES (?, ?, ?, ?, ?)`;

    db.run(sql, [
        student_id,
        student_name,
        JSON.stringify(interactions),
        JSON.stringify(turing_test),
        JSON.stringify(survey)
    ], function(err) {
        if (err) {
            console.error('Database insert error:', err);
            return res.status(500).json({ error: 'Failed to save data' });
        }
        res.json({ success: true, id: this.lastID });
    });
});

// 管理员登录
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    db.get('SELECT * FROM admins WHERE username = ?', [username], (err, admin) => {
        if (err || !admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!bcrypt.compareSync(password, admin.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, username: admin.username });
    });
});

// 获取所有实验数据
app.get('/api/admin/results', authenticateToken, (req, res) => {
    db.all('SELECT * FROM experiment_results ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch data' });
        }
        res.json(rows);
    });
});

// 导出为 Excel
app.get('/api/admin/export', authenticateToken, (req, res) => {
    db.all('SELECT * FROM experiment_results ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch data' });
        }

        // 处理数据，展开 JSON 字段
        const exportData = rows.map(row => {
            const interactions = JSON.parse(row.interactions);
            const turingTest = JSON.parse(row.turing_test);
            const survey = JSON.parse(row.survey);

            return {
                '学号': row.student_id,
                '姓名': row.student_name,
                '提交时间': row.created_at,
                '交互数据': JSON.stringify(interactions),
                '图灵测试': JSON.stringify(turingTest),
                '问卷数据': JSON.stringify(survey)
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, '实验数据');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename=experiment_data.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    });
});

// 删除数据
app.delete('/api/admin/results/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM experiment_results WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete data' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Data not found' });
        }
        res.json({ success: true, message: 'Data deleted successfully' });
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
