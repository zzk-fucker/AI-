const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./experiment.db');

console.log('查询数据库中的所有记录...\n');

db.all('SELECT id, student_id, created_at FROM experiment_results ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
        console.error('查询失败:', err);
    } else {
        if (rows.length === 0) {
            console.log('数据库中暂无数据');
        } else {
            console.log(`共有 ${rows.length} 条记录:\n`);
            rows.forEach(row => {
                console.log(`ID: ${row.id}`);
                console.log(`学号: ${row.student_id}`);
                console.log(`创建时间: ${row.created_at}`);
                console.log(`当前时间: ${new Date().toISOString()}`);
                console.log(`当前本地时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
                console.log('---');
            });
        }
    }
    db.close();
});
