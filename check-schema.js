const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./experiment.db');

db.all("PRAGMA table_info(experiment_results)", [], (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Table structure:');
        rows.forEach(row => {
            console.log(`${row.name} (${row.type}) - NOT NULL: ${row.notnull}`);
        });
    }
    db.close();
});
