import express, { Request, Response, Application } from "express";
import dotenv from "dotenv";
import multer from "multer";
import { InMemoryDB } from "./dbWrapper";
import { QueryManager } from "./queryManager";
import { parseVcard } from "./vcard";
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

app.post(
  "/upload",
  upload.fields([{ name: "chatdb" }, { name: "contactdb" }]),
  async (req: Request, res: Response) => {
    try {
      let results = {};

      if (req.files && !Array.isArray(req.files)) {
        const files = req.files as {
          [fieldname: string]: Express.Multer.File[];
        };

        if (files.chatdb) {
          for (const file of files.chatdb) {
            const db = new InMemoryDB(file.path);
            const queryManager = new QueryManager(db);

            results = await queryManager.runQueries();

            db.close();
          }
        }


        if (files.contactdb) {
          for (const file of files.contactdb) {
            const contacts = parseVcard(file.path);
            console.log(contacts);
          }
        }
      }

      res.setHeader('access-control-allow-origin', '*');
      res.json(results);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error processing queries");
    }
  }
);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Express & TypeScript Server");
});

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
