const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./experiment.db');

console.log('开始迁移：添加 student_id 字段...');

// 添加 student_id 字段
db.run(`ALTER TABLE experiment_results ADD COLUMN student_id TEXT NOT NULL DEFAULT ''`, (err) => {
    if (err) {
        if (err.message.includes('duplicate column name')) {
            console.log('✓ student_id 字段已存在，无需添加');
        } else {
            console.error('✗ 添加字段失败:', err.message);
        }
    } else {
        console.log('✓ 成功添加 student_id 字段');
    }

    // 验证表结构
    db.all("PRAGMA table_info(experiment_results)", [], (err, rows) => {
        if (err) {
            console.error('✗ 查询表结构失败:', err);
        } else {
            console.log('\n更新后的表结构:');
            rows.forEach(row => {
                console.log(`  - ${row.name} (${row.type}) ${row.notnull ? '必填' : '可选'}`);
            });
        }
        db.close();
        console.log('\n迁移完成！');
    });
});
