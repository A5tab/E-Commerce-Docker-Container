import connectDB from "./db/index.js";
import { app } from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB()
    .then(
        () => {
            app.listen(PORT,'0.0.0.0', () => {
                console.log(`App listening on port ${PORT}`);
            });

            app.on("error", (error) => {
                console.log("Server error", error);
            })
        }
    )
    .catch((error) => {
        console.log("Failed to connect to the database:", error);
        process.exit(1);
    })