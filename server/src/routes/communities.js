const express = require("express");
const { requireRole } = require("../middleware/auth");

function buildCommunityRoutes(prisma) {
  const router = express.Router();
  const randomChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  function isAdmin(req) {
    return req.user?.roleID?.toString() === "1";
  }

  async function generateUniqueInviteCode(length = 8) {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      let code = "";
      for (let i = 0; i < length; i += 1) {
        code += randomChars[Math.floor(Math.random() * randomChars.length)];
      }
      const exists = await prisma.communityInviteCode.findUnique({
        where: { code },
        select: { communityInviteCodeID: true },
      });
      if (!exists) return code;
    }
    throw new Error("Failed to generate unique invite code");
  }

  // Client/Admin: list created communities with invite codes
  router.get("/communities/client/me", requireRole(1, 3), async (req, res, next) => {
    try {
      const userID = BigInt(req.user.sub);
      const where = isAdmin(req)
        ? {}
        : { createdByClientUserID: userID };

      const items = await prisma.community.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          inviteCodes: {
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: { memberships: true },
          },
        },
      });

      res.json({
        items: items.map((c) => ({
          id: c.communityID.toString(),
          name: c.name,
          description: c.description,
          isActive: c.isActive,
          createdByClientUserID: c.createdByClientUserID
            ? c.createdByClientUserID.toString()
            : null,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          membersCount: c._count?.memberships ?? 0,
          inviteCodes: (c.inviteCodes || []).map((code) => ({
            id: code.communityInviteCodeID.toString(),
            code: code.code,
            maxUses: code.maxUses,
            usedCount: code.usedCount,
            expiresAt: code.expiresAt,
            isActive: code.isActive,
            createdAt: code.createdAt,
          })),
        })),
      });
    } catch (err) {
      return next(err);
    }
  });

  // Client/Admin: list members for a community
  router.get(
    "/communities/client/:id/members",
    requireRole(1, 3),
    async (req, res, next) => {
      try {
        const userID = BigInt(req.user.sub);
        const communityID = BigInt(req.params.id);

        const community = await prisma.community.findUnique({
          where: { communityID },
          select: { communityID: true, createdByClientUserID: true },
        });
        if (!community) return res.status(404).json({ error: "Community not found" });
        if (!isAdmin(req) && community.createdByClientUserID !== userID) {
          return res.status(403).json({ error: "Forbidden" });
        }

        const memberships = await prisma.userCommunityMembership.findMany({
          where: { communityID },
          orderBy: { joinedAt: "desc" },
          include: {
            user: {
              select: {
                userID: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });

        return res.json({
          items: memberships.map((m) => ({
            id: m.userCommunityMembershipID.toString(),
            userID: m.userID.toString(),
            name:
              `${m.user?.firstName || ""} ${m.user?.lastName || ""}`.trim() ||
              m.user?.email ||
              "Unknown",
            email: m.user?.email || null,
            joinedByCode: m.joinedByCode,
            joinedAt: m.joinedAt,
          })),
        });
      } catch (err) {
        return next(err);
      }
    },
  );

  // Client/Admin: create community with optional initial invite code
  router.post("/communities/client", requireRole(1, 3), async (req, res, next) => {
    try {
      const userID = BigInt(req.user.sub);
      const {
        name,
        description,
        isActive,
        inviteCode,
        generateRandomCode,
        maxUses,
        expiresAt,
      } = req.body || {};

      const trimmedName = typeof name === "string" ? name.trim() : "";
      if (!trimmedName) {
        return res.status(400).json({ error: "name is required" });
      }

      const normalizedCustomCode =
        typeof inviteCode === "string" && inviteCode.trim()
          ? inviteCode.trim().toUpperCase()
          : "";

      if (normalizedCustomCode && !/^[A-Z0-9_-]{4,32}$/.test(normalizedCustomCode)) {
        return res.status(400).json({
          error: "Invite code must be 4-32 chars using A-Z, 0-9, _ or -",
        });
      }

      const shouldGenerateCode = Boolean(generateRandomCode || normalizedCustomCode);

      const created = await prisma.$transaction(async (tx) => {
        const community = await tx.community.create({
          data: {
            name: trimmedName,
            description: typeof description === "string" ? description : null,
            isActive: isActive === undefined ? true : Boolean(isActive),
            createdByClientUserID: userID,
          },
        });

        let codeItem = null;
        if (shouldGenerateCode) {
          const codeValue = normalizedCustomCode || (await generateUniqueInviteCode());
          codeItem = await tx.communityInviteCode.create({
            data: {
              communityID: community.communityID,
              code: codeValue,
              maxUses:
                maxUses === null || maxUses === undefined || maxUses === ""
                  ? null
                  : Number(maxUses),
              expiresAt: expiresAt ? new Date(expiresAt) : null,
              isActive: true,
            },
          });
        }

        return { community, codeItem };
      });

      return res.status(201).json({
        item: {
          id: created.community.communityID.toString(),
          name: created.community.name,
          description: created.community.description,
          isActive: created.community.isActive,
          createdByClientUserID: created.community.createdByClientUserID
            ? created.community.createdByClientUserID.toString()
            : null,
          createdAt: created.community.createdAt,
          updatedAt: created.community.updatedAt,
          inviteCode: created.codeItem
            ? {
                id: created.codeItem.communityInviteCodeID.toString(),
                code: created.codeItem.code,
                maxUses: created.codeItem.maxUses,
                usedCount: created.codeItem.usedCount,
                expiresAt: created.codeItem.expiresAt,
                isActive: created.codeItem.isActive,
              }
            : null,
        },
      });
    } catch (err) {
      if (err?.code === "P2002") {
        return res.status(409).json({ error: "Name or invite code already exists" });
      }
      return next(err);
    }
  });

  // Client/Admin: update community
  router.patch("/communities/client/:id", requireRole(1, 3), async (req, res, next) => {
    try {
      const userID = BigInt(req.user.sub);
      const communityID = BigInt(req.params.id);
      const existing = await prisma.community.findUnique({
        where: { communityID },
        select: { communityID: true, createdByClientUserID: true },
      });
      if (!existing) return res.status(404).json({ error: "Community not found" });
      if (!isAdmin(req) && existing.createdByClientUserID !== userID) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { name, description, isActive } = req.body || {};
      const updated = await prisma.community.update({
        where: { communityID },
        data: {
          name: name === undefined ? undefined : String(name).trim(),
          description:
            description === undefined ? undefined : String(description || ""),
          isActive: isActive === undefined ? undefined : Boolean(isActive),
        },
      });

      return res.json({
        item: {
          id: updated.communityID.toString(),
          name: updated.name,
          description: updated.description,
          isActive: updated.isActive,
          createdByClientUserID: updated.createdByClientUserID
            ? updated.createdByClientUserID.toString()
            : null,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        },
      });
    } catch (err) {
      if (err?.code === "P2002") {
        return res.status(409).json({ error: "Community name already exists" });
      }
      return next(err);
    }
  });

  // Client/Admin: delete community (hard delete)
  router.delete("/communities/client/:id", requireRole(1, 3), async (req, res, next) => {
    try {
      const userID = BigInt(req.user.sub);
      const communityID = BigInt(req.params.id);
      const existing = await prisma.community.findUnique({
        where: { communityID },
        select: { communityID: true, createdByClientUserID: true },
      });
      if (!existing) return res.status(404).json({ error: "Community not found" });
      if (!isAdmin(req) && existing.createdByClientUserID !== userID) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await prisma.$transaction(async (tx) => {
        await tx.userCommunityMembership.deleteMany({ where: { communityID } });
        await tx.communityInviteCode.deleteMany({ where: { communityID } });
        await tx.community.delete({ where: { communityID } });
      });

      return res.json({ ok: true });
    } catch (err) {
      return next(err);
    }
  });

  // Client/Admin: create new invite code for a community
  router.post(
    "/communities/client/:id/invite-codes",
    requireRole(1, 3),
    async (req, res, next) => {
      try {
        const userID = BigInt(req.user.sub);
        const communityID = BigInt(req.params.id);
        const existingCommunity = await prisma.community.findUnique({
          where: { communityID },
          select: { communityID: true, createdByClientUserID: true },
        });
        if (!existingCommunity) {
          return res.status(404).json({ error: "Community not found" });
        }
        if (!isAdmin(req) && existingCommunity.createdByClientUserID !== userID) {
          return res.status(403).json({ error: "Forbidden" });
        }

        const { code, maxUses, expiresAt, isActive } = req.body || {};
        const custom = typeof code === "string" ? code.trim().toUpperCase() : "";
        if (custom && !/^[A-Z0-9_-]{4,32}$/.test(custom)) {
          return res.status(400).json({
            error: "Invite code must be 4-32 chars using A-Z, 0-9, _ or -",
          });
        }

        const finalCode = custom || (await generateUniqueInviteCode());
        const created = await prisma.communityInviteCode.create({
          data: {
            communityID,
            code: finalCode,
            maxUses:
              maxUses === null || maxUses === undefined || maxUses === ""
                ? null
                : Number(maxUses),
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            isActive: isActive === undefined ? true : Boolean(isActive),
          },
        });

        return res.status(201).json({
          item: {
            id: created.communityInviteCodeID.toString(),
            code: created.code,
            maxUses: created.maxUses,
            usedCount: created.usedCount,
            expiresAt: created.expiresAt,
            isActive: created.isActive,
            createdAt: created.createdAt,
          },
        });
      } catch (err) {
        if (err?.code === "P2002") {
          return res.status(409).json({ error: "Invite code already exists" });
        }
        return next(err);
      }
    },
  );

  // Client/Admin: disable invite code
  router.patch(
    "/communities/client/:communityId/invite-codes/:codeId",
    requireRole(1, 3),
    async (req, res, next) => {
      try {
        const userID = BigInt(req.user.sub);
        const communityID = BigInt(req.params.communityId);
        const codeID = BigInt(req.params.codeId);
        const existingCommunity = await prisma.community.findUnique({
          where: { communityID },
          select: { communityID: true, createdByClientUserID: true },
        });
        if (!existingCommunity) {
          return res.status(404).json({ error: "Community not found" });
        }
        if (!isAdmin(req) && existingCommunity.createdByClientUserID !== userID) {
          return res.status(403).json({ error: "Forbidden" });
        }

        const { isActive, maxUses, expiresAt } = req.body || {};
        const updated = await prisma.communityInviteCode.update({
          where: { communityInviteCodeID: codeID },
          data: {
            isActive: isActive === undefined ? undefined : Boolean(isActive),
            maxUses:
              maxUses === undefined
                ? undefined
                : maxUses === null || maxUses === ""
                  ? null
                  : Number(maxUses),
            expiresAt:
              expiresAt === undefined
                ? undefined
                : expiresAt
                  ? new Date(expiresAt)
                  : null,
          },
        });

        return res.json({
          item: {
            id: updated.communityInviteCodeID.toString(),
            code: updated.code,
            maxUses: updated.maxUses,
            usedCount: updated.usedCount,
            expiresAt: updated.expiresAt,
            isActive: updated.isActive,
            createdAt: updated.createdAt,
          },
        });
      } catch (err) {
        return next(err);
      }
    },
  );

  router.get("/communities/me", requireRole(1, 2), async (req, res, next) => {
    try {
      const userID = BigInt(req.user.sub);
      const memberships = await prisma.userCommunityMembership.findMany({
        where: { userID },
        orderBy: { joinedAt: "desc" },
        include: {
          community: {
            select: {
              communityID: true,
              name: true,
              description: true,
              isActive: true,
            },
          },
        },
      });

      const items = memberships.map((membership) => ({
        id: membership.userCommunityMembershipID.toString(),
        joinedAt: membership.joinedAt,
        joinedByCode: membership.joinedByCode,
        community: membership.community
          ? {
              id: membership.community.communityID.toString(),
              name: membership.community.name,
              description: membership.community.description,
              isActive: membership.community.isActive,
            }
          : null,
      }));

      return res.json({ items });
    } catch (err) {
      return next(err);
    }
  });

  router.delete(
    "/communities/me/:membershipId",
    requireRole(1, 2),
    async (req, res, next) => {
      try {
        const userID = BigInt(req.user.sub);
        const membershipId = BigInt(req.params.membershipId);

        const membership = await prisma.userCommunityMembership.findUnique({
          where: { userCommunityMembershipID: membershipId },
          select: {
            userCommunityMembershipID: true,
            userID: true,
            communityID: true,
          },
        });

        if (!membership) {
          return res.status(404).json({ error: "Membership not found" });
        }
        if (membership.userID !== userID) {
          return res.status(403).json({ error: "Forbidden" });
        }

        await prisma.userCommunityMembership.delete({
          where: { userCommunityMembershipID: membershipId },
        });

        return res.json({ ok: true });
      } catch (err) {
        return next(err);
      }
    },
  );

  router.post(
    "/communities/join-by-code",
    requireRole(1, 2),
    async (req, res, next) => {
      try {
        const userID = BigInt(req.user.sub);
        const codeInput =
          typeof req.body?.code === "string" ? req.body.code.trim() : "";

        if (!codeInput) {
          return res.status(400).json({ error: "code is required" });
        }

        const normalizedCode = codeInput.toUpperCase();
        const now = new Date();

        const inviteCode = await prisma.communityInviteCode.findUnique({
          where: { code: normalizedCode },
          include: {
            community: {
              select: {
                communityID: true,
                name: true,
                description: true,
                isActive: true,
              },
            },
          },
        });

        if (!inviteCode || !inviteCode.isActive) {
          return res.status(404).json({ error: "Invalid invite code" });
        }
        if (!inviteCode.community || !inviteCode.community.isActive) {
          return res.status(400).json({ error: "Community is not active" });
        }
        if (inviteCode.expiresAt && inviteCode.expiresAt <= now) {
          return res.status(400).json({ error: "Invite code has expired" });
        }
        if (
          inviteCode.maxUses !== null &&
          inviteCode.maxUses !== undefined &&
          inviteCode.usedCount >= inviteCode.maxUses
        ) {
          return res.status(400).json({ error: "Invite code usage limit reached" });
        }

        const existingMembership = await prisma.userCommunityMembership.findUnique(
          {
            where: {
              userID_communityID: {
                userID,
                communityID: inviteCode.communityID,
              },
            },
          },
        );
        if (existingMembership) {
          return res.status(409).json({ error: "Already joined this community" });
        }

        const createdMembership = await prisma.$transaction(async (tx) => {
          await tx.communityInviteCode.update({
            where: { communityInviteCodeID: inviteCode.communityInviteCodeID },
            data: { usedCount: { increment: 1 } },
          });

          return tx.userCommunityMembership.create({
            data: {
              userID,
              communityID: inviteCode.communityID,
              joinedByCode: normalizedCode,
              joinedAt: now,
            },
            include: {
              community: {
                select: {
                  communityID: true,
                  name: true,
                  description: true,
                  isActive: true,
                },
              },
            },
          });
        });

        return res.status(201).json({
          item: {
            id: createdMembership.userCommunityMembershipID.toString(),
            joinedAt: createdMembership.joinedAt,
            joinedByCode: createdMembership.joinedByCode,
            community: createdMembership.community
              ? {
                  id: createdMembership.community.communityID.toString(),
                  name: createdMembership.community.name,
                  description: createdMembership.community.description,
                  isActive: createdMembership.community.isActive,
                }
              : null,
          },
        });
      } catch (err) {
        return next(err);
      }
    },
  );

  return router;
}

module.exports = { buildCommunityRoutes };
