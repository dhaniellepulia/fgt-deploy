const express = require("express");
const bcrypt = require("bcryptjs");
const { requireRole } = require("../../middleware/auth");

function buildAdminUserRoutes(prisma) {
  const router = express.Router();

  router.use(requireRole(1));

  router.get("/admin/users", async (req, res, next) => {
    try {
      const roleQuery = (req.query.role || "playtester").toLowerCase();
      const roleName = roleQuery === "client" ? "client" : "tester";
      const users = await prisma.user.findMany({
        where: { deletedAt: null, role: { roleName } },
        orderBy: { createdAt: "desc" },
        select: {
          userID: true,
          email: true,
          roleID: true,
          userStatusID: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          countryResidenceCode: true,
          spokenLanguages: true,
          experienceLevel: true,
          createdAt: true,
        },
      });
      res.json({ items: users });
    } catch (err) {
      next(err);
    }
  });

  router.post("/admin/users", async (req, res, next) => {
    try {
      const {
        role = "playtester",
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        countryResidenceCode,
      } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "email and password required" });
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({ error: "Email already in use" });
      }

      const roleName = role === "client" ? "client" : "tester";
      const roleRow = await prisma.role.findUnique({ where: { roleName } });
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          roleID: BigInt(roleRow.roleID),
          userStatusID: Number(process.env.DEFAULT_USER_STATUS_ID || 1),
          communitySettingID: Number(
            process.env.DEFAULT_COMMUNITY_SETTING_ID || 0,
          ),
          firstName,
          lastName,
          phoneNumber,
          countryResidenceCode,
        },
        select: {
          userID: true,
          email: true,
          roleID: true,
          userStatusID: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          countryResidenceCode: true,
          createdAt: true,
        },
      });
      res.status(201).json({ item: user });
    } catch (err) {
      next(err);
    }
  });

  router.patch("/admin/users/:id", async (req, res, next) => {
    try {
      const userID = BigInt(req.params.id);
      const {
        email,
        firstName,
        lastName,
        phoneNumber,
        countryResidenceCode,
        userStatusID,
        password,
      } = req.body;
      const data = {
        email,
        firstName,
        lastName,
        phoneNumber,
        countryResidenceCode,
        userStatusID:
          userStatusID === undefined ? undefined : Number(userStatusID),
      };
      if (password) {
        data.passwordHash = await bcrypt.hash(password, 10);
      }
      const updated = await prisma.user.update({
        where: { userID },
        data,
        select: {
          userID: true,
          email: true,
          roleID: true,
          userStatusID: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          countryResidenceCode: true,
          createdAt: true,
        },
      });
      res.json({ item: updated });
    } catch (err) {
      next(err);
    }
  });

  router.delete("/admin/users/:id", async (req, res, next) => {
    try {
      const userID = BigInt(req.params.id);
      const updated = await prisma.user.update({
        where: { userID },
        data: { deletedAt: new Date(), userStatusID: 3 },
      });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { buildAdminUserRoutes };
