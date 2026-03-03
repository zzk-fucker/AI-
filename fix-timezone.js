const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./experiment.db');

console.log('开始修复时区问题：将 UTC 时间转换为北京时间（UTC+8）...\n');

// 更新 experiment_results 表的时间
db.run(`UPDATE experiment_results
        SET created_at = datetime(created_at, '+8 hours')
        WHERE created_at IS NOT NULL`, function(err) {
    if (err) {
        console.error('✗ 更新 experiment_results 失败:', err.message);
    } else {
        console.log(`✓ 成功更新 experiment_results 表的 ${this.changes} ���记录`);
    }

    // 更新 admins 表的时间
    db.run(`UPDATE admins
            SET created_at = datetime(created_at, '+8 hours')
            WHERE created_at IS NOT NULL`, function(err) {
        if (err) {
            console.error('✗ 更新 admins 失败:', err.message);
        } else {
            console.log(`✓ 成功更新 admins 表的 ${this.changes} 条记录`);
        }

        // 验证更新结果
        db.all('SELECT id, student_id, created_at FROM experiment_results ORDER BY created_at DESC', [], (err, rows) => {
            if (err) {
                console.error('✗ 查询失败:', err);
            } else {
                console.log('\n更新后的数据:');
                if (rows.length === 0) {
                    console.log('  暂无数据');
                } else {
                    rows.forEach(row => {
                        console.log(`  ID: ${row.id}, 学号: ${row.student_id}, 时间: ${row.created_at}`);
                    });
                }
            }
            db.close();
            console.log('\n时区修复完成！');
        });
    });
});
