import express, { Request, Response, Application } from "express";
import dotenv from "dotenv";
import multer from "multer";
import { InMemoryDB } from "./dbWrapper";
import { QueryManager } from "./queryManager";
import * as bodyParser from "body-parser";

//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 1024 * 1024 * 1024 },
});
app.use(bodyParser.json({ limit: "1gb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "1gb" }));

app.post("/upload", upload.single("chatdb"), async (req, res) => {
  if (req.file && req.file.path) {
    const db = new InMemoryDB(req.file.path);

    const queryManager = new QueryManager(db);
    try {
      const results = await queryManager.runQueries();
      res.json(results);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error processing queries");
    } finally {
      db.close();
    }
  } else {
    res.status(400).send("No file uploaded.");
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Express & TypeScript Server");
});

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
