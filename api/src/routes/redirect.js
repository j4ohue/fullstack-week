const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

router.get("/:code", async (req, res) => {
  try {
    const link = await prisma.link.findUnique({ where: { code: req.params.code } });

    if (!link) {
      return res.status(404).json({ error: "Link não encontrado" });
    }

    // registra o clique sem derrubar o redirect se falhar
    try {
      await prisma.click.create({
        data: { linkId: link.id, userAgent: req.headers["user-agent"] || null },
      });
    } catch (err) {
      console.error("Erro ao registrar clique:", err);
    }

    res.redirect(302, link.url);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

module.exports = router;