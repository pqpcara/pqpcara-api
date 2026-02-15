import { Router } from "express";
import discord from "./discord/index";

const router = Router();

const paths = {
  Discord: "/discord",
};

router.get("/", (req, res) => {
  return res.status(200).json({ message: "Routes Below", v1: paths });
});

router.use("/discord", discord);

export default router;
