const express = require("express");
const { requireRole } = require("../middleware/auth");

function normalizeStatus(questionnaire) {
  const now = new Date();
  const startsAt = questionnaire.startsAt
    ? new Date(questionnaire.startsAt)
    : null;
  const endsAt = questionnaire.endsAt ? new Date(questionnaire.endsAt) : null;

  if (endsAt && endsAt < now) return "Past";
  if (startsAt && startsAt > now) return "Upcoming";

  const statusName = questionnaire.status?.statusName;
  if (statusName === "Draft") return "Upcoming";
  if (statusName === "Archived") return "Past";
  return "Active";
}

function isAdmin(req) {
  return req.user?.roleID?.toString() === "1";
}

async function loadProjectOr404(prisma, projectID) {
  const project = await prisma.project.findUnique({
    where: { projectID },
  });
  if (!project || project.deletedAt) return null;
  return project;
}

function buildProjectRoutes(prisma) {
  const router = express.Router();

  // Playtester-facing: projects are questionnaires.
  router.get("/projects", async (req, res, next) => {
    try {
      const questionnaires = await prisma.questionnaire.findMany({
        where: { deletedAt: null },
        include: { status: true },
        orderBy: { createdAt: "desc" },
      });

      const items = questionnaires.map((q) => ({
        id: q.questionnaireID,
        title: q.title,
        description: q.description,
        status: normalizeStatus(q),
        durationMinutes: q.timeLimitSeconds
          ? Math.ceil(q.timeLimitSeconds / 60)
          : null,
        xp: q.pointsReward ?? 0,
        startsAt: q.startsAt,
        endsAt: q.endsAt,
      }));

      res.json({ items });
    } catch (err) {
      next(err);
    }
  });

  router.get("/projects/:id", async (req, res, next) => {
    try {
      const questionnaireID = BigInt(req.params.id);
      const questionnaire = await prisma.questionnaire.findUnique({
        where: { questionnaireID },
        include: {
          status: true,
          questions: {
            where: { deletedAt: null },
            include: { options: { where: { deletedAt: null } } },
            orderBy: { displayOrder: "asc" },
          },
        },
      });

      if (!questionnaire || questionnaire.deletedAt) {
        return res.status(404).json({ error: "Not found" });
      }

      const item = {
        id: questionnaire.questionnaireID,
        title: questionnaire.title,
        description: questionnaire.description,
        status: normalizeStatus(questionnaire),
        durationMinutes: questionnaire.timeLimitSeconds
          ? Math.ceil(questionnaire.timeLimitSeconds / 60)
          : null,
        xp: questionnaire.pointsReward ?? 0,
        startsAt: questionnaire.startsAt,
        endsAt: questionnaire.endsAt,
        maxResponses: questionnaire.maxResponses,
        questions: questionnaire.questions,
      };

      return res.json({ item });
    } catch (err) {
      return next(err);
    }
  });

  // Client/admin CRUD for projects (container for questionnaires)
  router.get("/client/projects", requireRole(1, 3), async (req, res, next) => {
    try {
      const clientUserID = BigInt(req.user.sub);
      const where = isAdmin(req) ? { deletedAt: null } : { clientUserID, deletedAt: null };

      const items = await prisma.project.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          questionnaires: {
            where: { deletedAt: null },
            select: {
              questionnaireID: true,
              title: true,
              description: true,
              statusID: true,
              pointsReward: true,
              startsAt: true,
              endsAt: true,
              timeLimitSeconds: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      return res.json({ items });
    } catch (err) {
      return next(err);
    }
  });

  router.get(
    "/client/projects/:id",
    requireRole(1, 3),
    async (req, res, next) => {
      try {
        const projectID = BigInt(req.params.id);
        const project = await loadProjectOr404(prisma, projectID);
        if (!project) return res.status(404).json({ error: "Not found" });

        const clientUserID = BigInt(req.user.sub);
        if (!isAdmin(req) && project.clientUserID !== clientUserID) {
          return res.status(403).json({ error: "Forbidden" });
        }

        const item = await prisma.project.findUnique({
          where: { projectID },
          include: {
            questionnaires: {
              where: { deletedAt: null },
              orderBy: { createdAt: "desc" },
            },
          },
        });

        return res.json({ item });
      } catch (err) {
        return next(err);
      }
    }
  );

  router.post(
    "/client/projects",
    requireRole(1, 3),
    async (req, res, next) => {
      try {
        const {
          title,
          description,
          gameTitle,
          gameGenre,
          gamePlatforms,
          gameVersion,
          gameNotes,
        } = req.body;
        if (!title) {
          return res.status(400).json({ error: "title required" });
        }

        const clientUserID = BigInt(req.user.sub);
        const created = await prisma.project.create({
          data: {
            title,
            description,
            gameTitle,
            gameGenre,
            gamePlatforms,
            gameVersion,
            gameNotes,
            clientUserID,
          },
        });

        return res.status(201).json({ item: created });
      } catch (err) {
        return next(err);
      }
    }
  );

  router.patch(
    "/client/projects/:id",
    requireRole(1, 3),
    async (req, res, next) => {
      try {
        const projectID = BigInt(req.params.id);
        const project = await loadProjectOr404(prisma, projectID);
        if (!project) return res.status(404).json({ error: "Not found" });

        const clientUserID = BigInt(req.user.sub);
        if (!isAdmin(req) && project.clientUserID !== clientUserID) {
          return res.status(403).json({ error: "Forbidden" });
        }

        const {
          title,
          description,
          gameTitle,
          gameGenre,
          gamePlatforms,
          gameVersion,
          gameNotes,
        } = req.body;
        const updated = await prisma.project.update({
          where: { projectID },
          data: {
            title: title === undefined ? undefined : title,
            description: description === undefined ? undefined : description,
            gameTitle: gameTitle === undefined ? undefined : gameTitle,
            gameGenre: gameGenre === undefined ? undefined : gameGenre,
            gamePlatforms: gamePlatforms === undefined ? undefined : gamePlatforms,
            gameVersion: gameVersion === undefined ? undefined : gameVersion,
            gameNotes: gameNotes === undefined ? undefined : gameNotes,
          },
        });

        return res.json({ item: updated });
      } catch (err) {
        return next(err);
      }
    }
  );

  router.delete(
    "/client/projects/:id",
    requireRole(1, 3),
    async (req, res, next) => {
      try {
        const projectID = BigInt(req.params.id);
        const project = await loadProjectOr404(prisma, projectID);
        if (!project) return res.status(404).json({ error: "Not found" });

        const clientUserID = BigInt(req.user.sub);
        if (!isAdmin(req) && project.clientUserID !== clientUserID) {
          return res.status(403).json({ error: "Forbidden" });
        }

        const updated = await prisma.project.update({
          where: { projectID },
          data: { deletedAt: new Date() },
        });

        return res.json({ item: updated });
      } catch (err) {
        return next(err);
      }
    }
  );

  return router;
}

module.exports = { buildProjectRoutes };
