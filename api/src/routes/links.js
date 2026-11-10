const express = require("express");
const crypto = require("crypto");
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");

const router = express.Router();

function generateCode() {
  return crypto.randomBytes(5).toString("base64url").slice(0, 7);
}

function isValidUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

router.post("/", auth, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ error: "URL inválida (use http:// ou https://)" });
    }

    let link;
    for (let i = 0; i < 5; i++) {
      try {
        link = await prisma.link.create({
          data: { code: generateCode(), url, userId: req.userId },
        });
        break;
      } catch (err) {
        if (err.code !== "P2002") throw err; // só repete se o code colidiu
      }
    }

    if (!link) {
      return res.status(500).json({ error: "Não foi possível gerar o código" });
    }

    res.status(201).json({
      id: link.id,
      code: link.code,
      url: link.url,
      shortUrl: `${process.env.BASE_URL}/${link.code}`,
      clicks: 0,
      createdAt: link.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const links = await prisma.link.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { clicks: true } } },
    });

    res.json(
      links.map((l) => ({
        id: l.id,
        code: l.code,
        url: l.url,
        shortUrl: `${process.env.BASE_URL}/${l.code}`,
        clicks: l._count.clicks,
        createdAt: l.createdAt,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

module.exports = router;