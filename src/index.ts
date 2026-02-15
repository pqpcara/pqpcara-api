import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import api from "./api/index";

const app = express();

// Middlewares & Log (Debug)
app.use(express.json());
app.use(cors());

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Subdomains
app.use((req: Request, res: Response, next: NextFunction) => {
  const host = req.hostname.split(".")[0];

  switch (host) {
    case "api":
      return api(req, res, next);

    default:
      return next();
  }
});

// Not Found
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Not Found", error: "notfound" });
});

// Error Handler
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  res.status(500).json({ message: "Internal Server Error", error: "server_error" });
});

app.listen(8080, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:8080`);
});
