const bcrypt = require("bcrypt");

async function main() {
    const pw = process.argv[2];
    if (!pw) { console.error("Gebruik: node hash.js <nieuw-wachtwoord>"); process.exit(1); }
    const hash = await bcrypt.hash(pw, 10);
    console.log(hash);
}
main();
