const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

console.log('🔧 Fixing .env file...\n');

let envContent = '';
if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ Found existing .env file\n');
} else {
    console.log('📝 Creating new .env file from env.example\n');
    if (fs.existsSync(envExamplePath)) {
        envContent = fs.readFileSync(envExamplePath, 'utf8');
    }
}

let fixed = false;
let lines = envContent.split('\n');
let newLines = [];

for (let line of lines) {
    let newLine = line;
    
    if (line.startsWith('DB_HOST=')) {
        let host = line.split('=')[1]?.trim() || '';
        host = host.replace(/^https?:\/\//, '');
        host = host.replace(/\/$/, '');
        if (host && !host.startsWith('db.')) {
            const match = host.match(/([^.]+)\.supabase\.co/);
            if (match) {
                host = `db.${match[1]}.supabase.co`;
                fixed = true;
                console.log(`   ✅ Fixed DB_HOST: ${host}`);
            }
        }
        newLine = `DB_HOST=${host}`;
    }
    
    if (line.startsWith('DB_NAME=')) {
        const dbName = line.split('=')[1]?.trim() || '';
        if (dbName && dbName.toLowerCase() !== 'postgres') {
            newLine = 'DB_NAME=postgres';
            fixed = true;
            console.log(`   ✅ Fixed DB_NAME: postgres (was: ${dbName})`);
        }
    }
    
    newLines.push(newLine);
}

if (fixed) {
    fs.writeFileSync(envPath, newLines.join('\n'), 'utf8');
    console.log('\n✅ .env file has been fixed!');
    console.log('\n📋 Please check and update these values if needed:');
    console.log('   - DB_PASSWORD: Your Supabase database password');
    console.log('   - JWT_SECRET: A strong random string');
} else {
    console.log('✅ .env file looks correct!');
    console.log('\n📋 Please verify these values:');
    console.log('   - DB_HOST should be: db.xxxxx.supabase.co (no https://)');
    console.log('   - DB_NAME should be: postgres');
    console.log('   - DB_PASSWORD: Your Supabase database password');
}

console.log('\n💡 To get your Supabase credentials:');
console.log('   1. Go to supabase.com → Your Project → Settings → Database');
console.log('   2. Find "Connection string" or "Connection pooling"');
console.log('   3. Copy the host (should be db.xxxxx.supabase.co)');
console.log('   4. Reset password if needed: Settings → Database → Reset database password');

