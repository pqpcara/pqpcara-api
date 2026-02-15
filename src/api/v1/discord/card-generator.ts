import { createCanvas, loadImage } from "@napi-rs/canvas";

interface CardData {
  id: string;
  username: string;
  global_name: string;
  avatar: string;
  banner?: string;
  badges?: Array<{ id: string; icon: string }>;
  createdTimestamp?: number;
}

export async function generateCard(data: CardData): Promise<Buffer> {
  const width = 885, height = 303;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const avatarUrl = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=512`;
  const bannerUrl = data.banner ? `https://cdn.discordapp.com/banners/${data.id}/${data.banner}.png?size=1024` : avatarUrl;

  ctx.save();
  roundRect(ctx, 0, 0, width, height, 40);
  ctx.clip();

  try {
    const backgroundImg = await loadImage(bannerUrl);
    (ctx as any).filter = 'blur(5px)';
    ctx.drawImage(backgroundImg, -20, -20, width + 40, height + 40);
  } catch (e) {
    ctx.fillStyle = "#111214";
    ctx.fillRect(0, 0, width, height);
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.29)";
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  ctx.clip();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
  ctx.lineWidth = 15;
  roundRect(ctx, 0, 0, width, height, 40);
  ctx.stroke();

  try {
    const avatarImg = await loadImage(avatarUrl);
    ctx.save();
    ctx.beginPath();
    ctx.arc(178, 151, 115, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatarImg, 63, 36, 230, 230);
    ctx.restore();
  } catch (e) { }

  let name = data.global_name || data.username;
  let fontSize = 82;
  const maxWidth = 540;

  ctx.font = `800 ${fontSize}px "Segoe UI", Arial, sans-serif`;
  if (ctx.measureText(name).width > maxWidth) {
    fontSize = 70;
    ctx.font = `800 ${fontSize}px "Segoe UI", Arial, sans-serif`;
    if (ctx.measureText(name).width > maxWidth) {
      while (ctx.measureText(name).width > maxWidth) {
        name = name.slice(0, -1);
      }
    }
  }

  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "left";
  ctx.fillText(name, 315, 152);

  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.font = '400 68px "Segoe UI", Arial, sans-serif';
  ctx.fillText(`@${data.username}`, 315, 218);

  const dateStr = data.createdTimestamp
    ? new Date(data.createdTimestamp).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "Unknown";

  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  roundRect(ctx, 705, 248, 155, 36, 10);
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.font = '600 20px "Segoe UI", sans-serif';
  ctx.fillText(dateStr, 782, 273);

  if (data.badges && data.badges.length > 0) {
    const badgePriority: { [key: string]: number } = {
      "nitro": 1,
      "premium_tenure_1_month_v2": 2,
      "premium_guild_subscriber_3": 3,
      "premium_guild_subscriber_6": 4,
      "premium_guild_subscriber_12": 5,
      "premium_guild_subscriber_24": 6,
      "premium_guild_subscriber_36": 7,
      "premium_guild_subscriber_60": 8,
      "premium_guild_subscriber_72": 9,
      "bug_hunter": 10,
      "hypesquad_event": 11,
      "verified_developer": 12,
      "discord_partner": 13,
      "supporter": 14,
      "guild_booster_lvl1": 15,
      "guild_booster_lvl2": 16,
      "guild_booster_lvl3": 17,
      "guild_booster_lvl4": 18,
      "guild_booster_lvl5": 19,
      "guild_booster_lvl6": 20,
      "guild_booster_lvl7": 21,
      "guild_booster_lvl8": 22,
      "guild_booster_lvl9": 23,
      "quest_completed": 24,
      "orb_profile_badge": 25
    };

    const sortedBadges = [...data.badges].sort((a, b) => {
      const priorityA = badgePriority[a.id] || 999;
      const priorityB = badgePriority[b.id] || 999;
      return priorityB - priorityA;
    });

    let badgeX = 800;
    for (const badge of sortedBadges.slice(0, 4)) {
      try {
        const badgeUrl = `https://cdn.discordapp.com/badge-icons/${badge.icon}.png?size=512`;
        const badgeImg = await loadImage(badgeUrl);
        ctx.drawImage(badgeImg, badgeX, 15, 60, 60);
        badgeX -= 59;
      } catch (error) {
        console.error("Error loading badge:", error);
      }
    }
  }

  return canvas.toBuffer("image/png");
}

function roundRect(ctx: any, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, h + y - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}