//  Interactive CLI file 
import * as readline from "readline";
import { Database } from "./Database";

// 1. Start the Database
const db = new Database("data");

// 2. Setup the "Chat" interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("🏥 --- CLINICALITE SQL TERMINAL --- 🏥");
console.log("Type your SQL command and press ENTER.");
console.log("Type 'exit' to quit.\n");

// 3. The Recursive Loop
const prompt = () => {
  rl.question("Clinicalite> ", (query) => {
    // Exit condition
    if (query.trim().toLowerCase() === "exit") {
      console.log("Goodbye! 👋");
      rl.close();
      return;
    }

    // Execute Command
    if (query.trim() !== "") {
      const result = db.execute(query);

      if (result.success) {
        console.log("✅ Success");
        if (result.data) {
          console.table(result.data); // Nice table output
        } else if (result.message) {
          console.log(result.message);
        }
      } else {
        console.log("❌ Error:", result.message);
      }
    }

    // Loop back to ask again
    prompt();
  });
};

// Start the loop
prompt();