import { Router } from "express";
import { generateCard } from "../../../functions/discord/card-generator";

const router = Router();

function extractTimestampFromId(id: string): number {
  const timestamp = BigInt(id) >> BigInt(22);
  return Number(timestamp) + 1420070400000;
}

interface DiscordUser {
  user: {
    id: string;
    username: string;
    global_name: string;
    avatar: string;
    avatar_decoration_data?: {
      asset: string;
      sku_id: string;
      expires_at: string | null;
    };
    banner?: string;
    bio?: string;
  };
  badges?: Array<{
    id: string;
    description: string;
    icon: string;
    link?: string;
  }>;
}

router.get("/card/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { showDecorations, showBadges, showDate } = req.query;

    if (!id) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const response = await fetch(`https://discord.com/api/v9/users/${id}/profile`, {
      headers: {
        Authorization: `${process.env.token}`
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "User not found" });
    }

    const userData = (await response.json()) as DiscordUser;

    const imageBuffer = await generateCard({
      id: userData.user.id,
      username: userData.user.username,
      global_name: userData.user.global_name,
      avatar: userData.user.avatar,
      avatar_decoration_data: userData.user.avatar_decoration_data,
      banner: userData.user.banner,
      badges: userData.badges,
      createdTimestamp: extractTimestampFromId(userData.user.id),
      showDecorations: showDecorations !== "false",
      showBadges: showBadges !== "false",
      showDate: showDate !== "false"
    });

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", imageBuffer.length);
    return res.send(imageBuffer);
  } catch (error) {
    return res.status(500).json({ error: "Error generating card." });
  }
});

export default router;
