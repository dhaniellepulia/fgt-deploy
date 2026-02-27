const express = require("express");
const { requireRole, requireAuth } = require("../middleware/auth");

function buildQuestionnaireRoutes(prisma) {
  const router = express.Router();

  router.get("/questionnaires", async (req, res, next) => {
    try {
      const items = await prisma.questionnaire.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        select: {
          questionnaireID: true,
          clientUserID: true,
          title: true,
          description: true,
          statusID: true,
          startsAt: true,
          endsAt: true,
          maxResponses: true,
          pointsReward: true,
          projectID: true,
        },
      });
      res.json({ items });
    } catch (err) {
      next(err);
    }
  });

  router.get("/questionnaires/:id", async (req, res, next) => {
    try {
      const questionnaireID = BigInt(req.params.id);
      const item = await prisma.questionnaire.findUnique({
        where: { questionnaireID },
        include: {
          project: true,
          criteria: true,
          questions: {
            where: { deletedAt: null },
            include: { options: { where: { deletedAt: null } } },
            orderBy: { displayOrder: "asc" },
          },
        },
      });
      if (!item || item.deletedAt) {
        return res.status(404).json({ error: "Not found" });
      }
      return res.json({ item });
    } catch (err) {
      return next(err);
    }
  });

  router.post("/questionnaires", requireRole(1, 3), async (req, res, next) => {
    try {
      const {
        title,
        description,
        statusID,
        startsAt,
        endsAt,
        timeLimitSeconds,
        maxResponses,
        pointsReward,
        projectID,
      } = req.body;

      if (!title || !statusID) {
        return res.status(400).json({ error: "title and statusID required" });
      }

      const clientUserID = BigInt(req.user.sub);

      // if (projectID) {
      //   const project = await prisma.project.findUnique({
      //     where: { projectID: BigInt(projectID) },
      //     select: { projectID: true, clientUserID: true },
      //   });
      //   if (!project) {
      //     return res.status(404).json({ error: "Project not found" });
      //   }
      //   if (project.clientUserID !== clientUserID) {
      //     return res.status(403).json({ error: "Forbidden" });
      //   }
      // }

      //added to allow admin to create questionnaires
      const isAdmin = req.user?.roleID?.toString() === "1";

      if (projectID) {
        const project = await prisma.project.findUnique({
          where: { projectID: BigInt(projectID) },
          select: { projectID: true, clientUserID: true },
        });
        if (!project) {
          return res.status(404).json({ error: "Project not found" });
        }
        if (!isAdmin && project.clientUserID !== clientUserID) {
          return res.status(403).json({ error: "Forbidden" });
        }
      }

      const created = await prisma.questionnaire.create({
        data: {
          title,
          description,
          statusID: Number(statusID),
          startsAt: startsAt ? new Date(startsAt) : null,
          endsAt: endsAt ? new Date(endsAt) : null,
          timeLimitSeconds:
            timeLimitSeconds === null || timeLimitSeconds === undefined
              ? null
              : Number(timeLimitSeconds),
          maxResponses:
            maxResponses === null || maxResponses === undefined
              ? null
              : Number(maxResponses),
          pointsReward:
            pointsReward === null || pointsReward === undefined
              ? 0
              : Number(pointsReward),
          projectID: projectID ? BigInt(projectID) : null,
          clientUserID,
        },
      });

      return res.status(201).json({ item: created });
    } catch (err) {
      return next(err);
    }
  });

  router.patch(
    "/questionnaires/:id",
    requireRole(1, 3),
    async (req, res, next) => {
      try {
        const questionnaireID = BigInt(req.params.id);
        const clientUserID = BigInt(req.user.sub);

        const isAdmin = req.user?.roleID?.toString() === "1";

        const existing = await prisma.questionnaire.findUnique({
          where: { questionnaireID },
          select: { questionnaireID: true, clientUserID: true },
        });

        if (!existing) {
          return res.status(404).json({ error: "Not found" });
        }

        if (!isAdmin && existing.clientUserID !== clientUserID) {
          return res.status(403).json({ error: "Forbidden" });
        }

        const {
          title,
          description,
          statusID,
          startsAt,
          endsAt,
          timeLimitSeconds,
          maxResponses,
          pointsReward,
          projectID,
        } = req.body;

        if (projectID) {
          const project = await prisma.project.findUnique({
            where: { projectID: BigInt(projectID) },
            select: { projectID: true, clientUserID: true },
          });
          if (!project) {
            return res.status(404).json({ error: "Project not found" });
          }
          if (!isAdmin && project.clientUserID !== clientUserID) {
            return res.status(403).json({ error: "Forbidden" });
          }
        }

        const updated = await prisma.questionnaire.update({
          where: { questionnaireID },
          data: {
            title,
            description,
            statusID: statusID !== undefined ? Number(statusID) : undefined,
            startsAt:
              startsAt === undefined
                ? undefined
                : startsAt
                  ? new Date(startsAt)
                  : null,
            endsAt:
              endsAt === undefined
                ? undefined
                : endsAt
                  ? new Date(endsAt)
                  : null,
            timeLimitSeconds:
              timeLimitSeconds === undefined
                ? undefined
                : timeLimitSeconds === null
                  ? null
                  : Number(timeLimitSeconds),
            maxResponses:
              maxResponses === undefined
                ? undefined
                : maxResponses === null
                  ? null
                  : Number(maxResponses),
            pointsReward:
              pointsReward === undefined
                ? undefined
                : pointsReward === null
                  ? 0
                  : Number(pointsReward),
            projectID:
              projectID === undefined
                ? undefined
                : projectID
                  ? BigInt(projectID)
                  : null,
          },
        });

        return res.json({ item: updated });
      } catch (err) {
        return next(err);
      }
    },
  );

  router.delete(
    "/questionnaires/:id",
    requireRole(1, 3),
    async (req, res, next) => {
      try {
        const questionnaireID = BigInt(req.params.id);
        const clientUserID = BigInt(req.user.sub);

        const existing = await prisma.questionnaire.findUnique({
          where: { questionnaireID },
          select: { questionnaireID: true, clientUserID: true },
        });

        if (!existing) {
          return res.status(404).json({ error: "Not found" });
        }

        const isAdmin = req.user?.roleID?.toString() === "1";
        if (!isAdmin && existing.clientUserID !== clientUserID) {
          return res.status(403).json({ error: "Forbidden" });
        }

        const deleted = await prisma.questionnaire.update({
          where: { questionnaireID },
          data: { deletedAt: new Date() },
        });

        return res.json({ item: deleted });
      } catch (err) {
        return next(err);
      }
    },
  );

  router.put(
    "/questionnaires/:id/criteria",
    requireRole(1, 3),
    async (req, res, next) => {
      try {
        const questionnaireID = BigInt(req.params.id);
        const clientUserID = BigInt(req.user.sub);
        const { criteria } = req.body;

        const questionnaire = await prisma.questionnaire.findUnique({
          where: { questionnaireID },
          select: { questionnaireID: true, clientUserID: true },
        });

        if (!questionnaire) {
          return res.status(404).json({ error: "Not found" });
        }

        const isAdmin = req.user?.roleID?.toString() === "1";
        if (!isAdmin && questionnaire.clientUserID !== clientUserID) {
          return res.status(403).json({ error: "Forbidden" });
        }

        await prisma.questionnaireCriteria.deleteMany({
          where: { questionnaireID },
        });

        if (Array.isArray(criteria) && criteria.length > 0) {
          await prisma.questionnaireCriteria.createMany({
            data: criteria.map((item) => ({
              questionnaireID,
              criterionType: item.criterionType,
              matchType: item.matchType,
              valueJson: item.value ?? {},
            })),
          });
        }

        const updated = await prisma.questionnaire.findUnique({
          where: { questionnaireID },
          include: { criteria: true },
        });

        return res.json({ item: updated });
      } catch (err) {
        return next(err);
      }
    },
  );

  router.post(
    "/questionnaires/:id/questions",
    requireRole(1, 3),
    async (req, res, next) => {
      try {
        const questionnaireID = BigInt(req.params.id);
        const clientUserID = BigInt(req.user.sub);
        const {
          questionTypeID,
          questionText,
          helpText,
          isRequired,
          displayOrder,
          minSelections,
          maxSelections,
          minValue,
          maxValue,
          stepValue,
          placeholderText,
        } = req.body;

        const questionnaire = await prisma.questionnaire.findUnique({
          where: { questionnaireID },
          select: { questionnaireID: true, clientUserID: true },
        });

        if (!questionnaire) {
          return res.status(404).json({ error: "Not found" });
        }

        const isAdmin = req.user?.roleID?.toString() === "1";
        if (!isAdmin && questionnaire.clientUserID !== clientUserID) {
          return res.status(403).json({ error: "Forbidden" });
        }

        const created = await prisma.question.create({
          data: {
            questionnaireID,
            questionTypeID: Number(questionTypeID),
            questionText,
            helpText,
            isRequired: Boolean(isRequired),
            displayOrder: Number(displayOrder),
            minSelections:
              minSelections === null || minSelections === undefined
                ? null
                : Number(minSelections),
            maxSelections:
              maxSelections === null || maxSelections === undefined
                ? null
                : Number(maxSelections),
            minValue:
              minValue === null || minValue === undefined
                ? null
                : Number(minValue),
            maxValue:
              maxValue === null || maxValue === undefined
                ? null
                : Number(maxValue),
            stepValue:
              stepValue === null || stepValue === undefined
                ? null
                : Number(stepValue),
            placeholderText,
          },
        });

        return res.status(201).json({ item: created });
      } catch (err) {
        return next(err);
      }
    },
  );

  router.patch("/questions/:id", requireRole(1, 3), async (req, res, next) => {
    try {
      const questionID = BigInt(req.params.id);
      const {
        questionTypeID,
        questionText,
        helpText,
        isRequired,
        displayOrder,
        minSelections,
        maxSelections,
        minValue,
        maxValue,
        stepValue,
        placeholderText,
      } = req.body;

      const updated = await prisma.question.update({
        where: { questionID },
        data: {
          questionTypeID:
            questionTypeID === undefined ? undefined : Number(questionTypeID),
          questionText,
          helpText,
          isRequired:
            isRequired === undefined ? undefined : Boolean(isRequired),
          displayOrder:
            displayOrder === undefined ? undefined : Number(displayOrder),
          minSelections:
            minSelections === undefined
              ? undefined
              : minSelections === null
                ? null
                : Number(minSelections),
          maxSelections:
            maxSelections === undefined
              ? undefined
              : maxSelections === null
                ? null
                : Number(maxSelections),
          minValue:
            minValue === undefined
              ? undefined
              : minValue === null
                ? null
                : Number(minValue),
          maxValue:
            maxValue === undefined
              ? undefined
              : maxValue === null
                ? null
                : Number(maxValue),
          stepValue:
            stepValue === undefined
              ? undefined
              : stepValue === null
                ? null
                : Number(stepValue),
          placeholderText,
        },
      });

      return res.json({ item: updated });
    } catch (err) {
      return next(err);
    }
  });

  router.delete("/questions/:id", requireRole(1, 3), async (req, res, next) => {
    try {
      const questionID = BigInt(req.params.id);
      const deleted = await prisma.question.update({
        where: { questionID },
        data: { deletedAt: new Date() },
      });
      return res.json({ item: deleted });
    } catch (err) {
      return next(err);
    }
  });

  router.post(
    "/questions/:id/options",
    requireRole(1, 3),
    async (req, res, next) => {
      try {
        const questionID = BigInt(req.params.id);
        const { optionText, optionValue, displayOrder, isOtherOption } =
          req.body;

        const created = await prisma.questionOption.create({
          data: {
            questionID,
            optionText,
            optionValue,
            displayOrder: Number(displayOrder),
            isOtherOption: Boolean(isOtherOption),
          },
        });

        return res.status(201).json({ item: created });
      } catch (err) {
        return next(err);
      }
    },
  );

  router.patch(
    "/question-options/:id",
    requireRole(1, 3),
    async (req, res, next) => {
      try {
        const questionOptionID = BigInt(req.params.id);
        const { optionText, optionValue, displayOrder, isOtherOption } =
          req.body;

        const updated = await prisma.questionOption.update({
          where: { questionOptionID },
          data: {
            optionText,
            optionValue,
            displayOrder:
              displayOrder === undefined ? undefined : Number(displayOrder),
            isOtherOption:
              isOtherOption === undefined ? undefined : Boolean(isOtherOption),
          },
        });

        return res.json({ item: updated });
      } catch (err) {
        return next(err);
      }
    },
  );

  router.delete(
    "/question-options/:id",
    requireRole(1, 3),
    async (req, res, next) => {
      try {
        const questionOptionID = BigInt(req.params.id);
        const deleted = await prisma.questionOption.update({
          where: { questionOptionID },
          data: { deletedAt: new Date() },
        });
        return res.json({ item: deleted });
      } catch (err) {
        return next(err);
      }
    },
  );

  router.get("/user-motivations/me", requireAuth, async (req, res, next) => {
    try {
      const userID = BigInt(req.user.sub);
      const user = await prisma.user.findUnique({
        where: { userID },
        select: { motivations: true },
      });
      return res.json({ items: user?.motivations ?? [] });
    } catch (err) {
      return next(err);
    }
  });

  router.put("/user-motivations/me", requireAuth, async (req, res, next) => {
    try {
      const userID = BigInt(req.user.sub);
      const keys = Array.isArray(req.body.keys) ? req.body.keys : undefined;
      const preferences =
        req.body.preferences === undefined ? undefined : req.body.preferences;
      const gamerProfileBody =
        req.body.gamerProfile === undefined ? undefined : req.body.gamerProfile;

      const updateData = {};
      if (keys !== undefined) updateData.motivations = keys;
      // prefer explicitly provided gamerProfile, otherwise build from preferences (includes gamerType)
      if (gamerProfileBody !== undefined) {
        updateData.gamerProfile = gamerProfileBody;
      } else if (preferences !== undefined) {
        updateData.gamerProfile = {
          gamerType: preferences.gamerType ?? null,
          computedAt: new Date().toISOString(),
          details: preferences,
        };
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "nothing to update" });
      }

      const updated = await prisma.user.update({
        where: { userID },
        data: updateData,
        select: { motivations: true, gamerProfile: true },
      });
      return res.json({
        item: {
          motivations: updated.motivations ?? [],
          gamerProfile: updated.gamerProfile ?? null,
        },
      });
    } catch (err) {
      return next(err);
    }
  });

  return router;
}

module.exports = { buildQuestionnaireRoutes };
