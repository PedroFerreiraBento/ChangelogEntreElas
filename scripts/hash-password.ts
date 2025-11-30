// scripts/hash-password.ts
import bcrypt from "bcryptjs";

async function run() {
  const password = process.argv[2];
  if (!password) {
    console.error("Use: ts-node scripts/hash-password.ts SUA_SENHA");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  console.log("Hash:", hash);
}

run();
