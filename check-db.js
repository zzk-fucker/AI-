const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./experiment.db');

db.all('SELECT * FROM experiment_results', [], (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Total rows:', rows.length);
        rows.forEach(row => {
            console.log('\n--- Record ---');
            console.log('ID:', row.id);
            console.log('Student ID:', row.student_id);
            console.log('Created at:', row.created_at);
        });
    }
    db.close();
});
