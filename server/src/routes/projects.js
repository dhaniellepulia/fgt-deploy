const express = require("express");
const { requireRole } = require("../middleware/auth");

function getQuestionnaireAvailability(questionnaire, now = new Date()) {
  const startsAt = questionnaire.startsAt
    ? new Date(questionnaire.startsAt)
    : null;
  const endsAt = questionnaire.endsAt ? new Date(questionnaire.endsAt) : null;

  if (endsAt && endsAt < now) return "Past";
  if (startsAt && startsAt > now) return "Upcoming";
  return "Active";
}

function isPublished(questionnaire) {
  return Number(questionnaire.statusID) === 2;
}

function isAvailable(questionnaire, now = new Date()) {
  return (
    isPublished(questionnaire) &&
    getQuestionnaireAvailability(questionnaire, now) === "Active"
  );
}

function computeProjectStatus(publishedQuestionnaires, now = new Date()) {
  if (!publishedQuestionnaires.length) return "Upcoming";
  const availability = publishedQuestionnaires.map((q) =>
    getQuestionnaireAvailability(q, now),
  );
  if (availability.includes("Active")) return "Active";
  if (availability.includes("Upcoming")) return "Upcoming";
  return "Past";
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

  // Playtester-facing: list available projects with published questionnaires.
  router.get("/projects", requireRole(1, 2), async (req, res, next) => {
    try {
      const testerUserID = BigInt(req.user.sub);
      const now = new Date();

      const memberships = await prisma.projectMembership.findMany({
        where: { testerUserID },
        select: { projectID: true },
      });
      const joinedSet = new Set(
        memberships.map((membership) => membership.projectID.toString()),
      );

      const projects = await prisma.project.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: {
          questionnaires: {
            where: { deletedAt: null },
            select: {
              questionnaireID: true,
              statusID: true,
              startsAt: true,
              endsAt: true,
            },
          },
        },
      });

      const items = projects
        .map((project) => {
          const published = project.questionnaires.filter(isPublished);
          const isJoined = joinedSet.has(project.projectID.toString());
          if (!published.length && !isJoined) return null;
          const availableCount = published.filter((q) =>
            isAvailable(q, now),
          ).length;

          return {
            id: project.projectID,
            title: project.title,
            description: project.description,
            gameTitle: project.gameTitle,
            gameGenre: project.gameGenre,
            gamePlatforms: project.gamePlatforms,
            gameVersion: project.gameVersion,
            status: computeProjectStatus(published, now),
            publishedQuestionnaireCount: published.length,
            availableQuestionnaireCount: availableCount,
            isJoined,
          };
        })
        .filter(Boolean);

      res.json({ items });
    } catch (err) {
      next(err);
    }
  });

  router.get("/projects/:id", requireRole(1, 2), async (req, res, next) => {
    try {
      const projectID = BigInt(req.params.id);
      const project = await prisma.project.findUnique({
        where: { projectID },
        include: {
          questionnaires: {
            where: { deletedAt: null, statusID: 2 },
            select: {
              questionnaireID: true,
              title: true,
              description: true,
              statusID: true,
              startsAt: true,
              endsAt: true,
              timeLimitSeconds: true,
              maxResponses: true,
              pointsReward: true,
            },
          },
        },
      });

      if (!project || project.deletedAt) {
        return res.status(404).json({ error: "Not found" });
      }

      const testerUserID = BigInt(req.user.sub);
      const membership = await prisma.projectMembership.findUnique({
        where: {
          projectID_testerUserID: {
            projectID,
            testerUserID,
          },
        },
      });
      const isJoined = Boolean(membership) || isAdmin(req);
      const now = new Date();
      const publishedAvailable = project.questionnaires.filter((q) =>
        isAvailable(q, now),
      );

      let submittedLookup = new Set();
      if (isJoined && publishedAvailable.length) {
        const submitted = await prisma.questionnaireResponse.findMany({
          where: {
            testerUserID,
            responseStatusID: 2,
            questionnaireID: {
              in: publishedAvailable.map((q) => q.questionnaireID),
            },
          },
          select: { questionnaireID: true },
        });
        submittedLookup = new Set(
          submitted.map((item) => item.questionnaireID.toString()),
        );
      }

      const item = {
        id: project.projectID,
        title: project.title,
        description: project.description,
        gameTitle: project.gameTitle,
        gameGenre: project.gameGenre,
        gamePlatforms: project.gamePlatforms,
        gameVersion: project.gameVersion,
        gameNotes: project.gameNotes,
        status: computeProjectStatus(project.questionnaires, now),
        isJoined,
        availableQuestionnaireCount: publishedAvailable.length,
        questionnaires: isJoined
          ? publishedAvailable.map((q) => ({
              id: q.questionnaireID,
              title: q.title,
              description: q.description,
              status: getQuestionnaireAvailability(q, now),
              durationMinutes: q.timeLimitSeconds
                ? Math.ceil(q.timeLimitSeconds / 60)
                : null,
              maxResponses: q.maxResponses,
              pointsReward: q.pointsReward ?? 0,
              startsAt: q.startsAt,
              endsAt: q.endsAt,
              hasSubmitted: submittedLookup.has(q.questionnaireID.toString()),
            }))
          : [],
      };

      return res.json({ item });
    } catch (err) {
      return next(err);
    }
  });

  router.post(
    "/projects/:id/join",
    requireRole(1, 2),
    async (req, res, next) => {
      try {
        const projectID = BigInt(req.params.id);
        const project = await loadProjectOr404(prisma, projectID);
        if (!project) return res.status(404).json({ error: "Not found" });

        if (isAdmin(req)) {
          return res.json({ item: { projectID, joined: true } });
        }

        const testerUserID = BigInt(req.user.sub);
        const membership = await prisma.projectMembership.upsert({
          where: {
            projectID_testerUserID: {
              projectID,
              testerUserID,
            },
          },
          update: {},
          create: {
            projectID,
            testerUserID,
            joinedAt: new Date(),
          },
        });

        return res.status(201).json({ item: membership });
      } catch (err) {
        const message = err?.message || "";
        if (
          message.startsWith("Missing required answer") ||
          message.startsWith("Invalid option")
        ) {
          return res.status(400).json({ error: message });
        }
        return next(err);
      }
    },
  );

  router.get(
    "/projects/:projectId/questionnaires/:questionnaireId",
    requireRole(1, 2),
    async (req, res, next) => {
      try {
        const projectID = BigInt(req.params.projectId);
        const questionnaireID = BigInt(req.params.questionnaireId);
        const project = await loadProjectOr404(prisma, projectID);
        if (!project) return res.status(404).json({ error: "Not found" });

        const testerUserID = BigInt(req.user.sub);
        if (!isAdmin(req)) {
          const membership = await prisma.projectMembership.findUnique({
            where: {
              projectID_testerUserID: {
                projectID,
                testerUserID,
              },
            },
          });
          if (!membership) {
            return res.status(403).json({ error: "Join required" });
          }
        }

        const qWhere = {
          questionnaireID,
          projectID,
          deletedAt: null,
        };
        if (!isAdmin(req)) qWhere.statusID = 2;

        const questionnaire = await prisma.questionnaire.findFirst({
          where: qWhere,
          include: {
            questions: {
              where: { deletedAt: null },
              include: {
                options: { where: { deletedAt: null } },
                questionType: true,
              },
              orderBy: { displayOrder: "asc" },
            },
          },
        });

        if (!questionnaire) {
          return res.status(404).json({ error: "Not found" });
        }

        if (!isAdmin(req) && !isAvailable(questionnaire)) {
          return res
            .status(403)
            .json({ error: "Questionnaire is not available" });
        }

        const existing = await prisma.questionnaireResponse.findFirst({
          where: {
            questionnaireID,
            testerUserID,
            responseStatusID: 2,
          },
        });

        return res.json({
          item: {
            id: questionnaire.questionnaireID,
            title: questionnaire.title,
            description: questionnaire.description,
            durationMinutes: questionnaire.timeLimitSeconds
              ? Math.ceil(questionnaire.timeLimitSeconds / 60)
              : null,
            pointsReward: questionnaire.pointsReward ?? 0,
            questions: questionnaire.questions,
            hasSubmitted: Boolean(existing),
            project: {
              id: project.projectID,
              title: project.title,
            },
          },
        });
      } catch (err) {
        return next(err);
      }
    },
  );

  router.post(
    "/projects/:projectId/questionnaires/:questionnaireId/responses",
    requireRole(1, 2),
    async (req, res, next) => {
      try {
        const projectID = BigInt(req.params.projectId);
        const questionnaireID = BigInt(req.params.questionnaireId);
        const testerUserID = BigInt(req.user.sub);
        const { answers } = req.body;

        if (!Array.isArray(answers)) {
          return res.status(400).json({ error: "answers must be an array" });
        }

        const project = await loadProjectOr404(prisma, projectID);
        if (!project) return res.status(404).json({ error: "Not found" });

        if (!isAdmin(req)) {
          const membership = await prisma.projectMembership.findUnique({
            where: {
              projectID_testerUserID: {
                projectID,
                testerUserID,
              },
            },
          });
          if (!membership) {
            return res.status(403).json({ error: "Join required" });
          }
        }

        const questionnaire = await prisma.questionnaire.findFirst({
          where: {
            questionnaireID,
            projectID,
            deletedAt: null,
            statusID: 2,
          },
          include: {
            questions: {
              where: { deletedAt: null },
              include: {
                options: { where: { deletedAt: null } },
                questionType: true,
              },
              orderBy: { displayOrder: "asc" },
            },
          },
        });

        if (!questionnaire) {
          return res.status(404).json({ error: "Not found" });
        }

        if (!isAvailable(questionnaire)) {
          return res
            .status(403)
            .json({ error: "Questionnaire is not available" });
        }

        const existing = await prisma.questionnaireResponse.findFirst({
          where: {
            questionnaireID,
            testerUserID,
          },
        });
        if (existing) {
          return res.status(409).json({ error: "Already submitted" });
        }

        const answerLookup = new Map();
        answers.forEach((answer) => {
          if (!answer?.questionID) return;
          answerLookup.set(answer.questionID.toString(), answer);
        });

        const now = new Date();
        const response = await prisma.$transaction(async (tx) => {
          const createdResponse = await tx.questionnaireResponse.create({
            data: {
              questionnaireID,
              testerUserID,
              responseStatusID: 2,
              startedAt: now,
              submittedAt: now,
              ipAddress: req.ip,
              userAgent: req.get("user-agent"),
            },
          });

          for (const question of questionnaire.questions) {
            const incoming = answerLookup.get(question.questionID.toString());
            const typeCode = question.questionType?.typeCode;

            if (!incoming) {
              if (question.isRequired) {
                throw new Error(
                  `Missing required answer for question ${question.questionID}`,
                );
              }
              continue;
            }

            const optionIds = new Set(
              question.options.map((opt) => opt.questionOptionID.toString()),
            );

            let answerPayload = null;
            let multiOptionIDs = null;

            if (typeCode === "SHORT_TEXT" || typeCode === "LONG_TEXT") {
              const value =
                typeof incoming.answerText === "string"
                  ? incoming.answerText.trim()
                  : "";
              if (question.isRequired && !value) {
                throw new Error(
                  `Missing required answer for question ${question.questionID}`,
                );
              }
              if (!value) continue;
              answerPayload = { answerText: value };
            } else if (typeCode === "NUMBER" || typeCode === "SCALE") {
              if (
                incoming.answerNumber === undefined ||
                incoming.answerNumber === null ||
                incoming.answerNumber === ""
              ) {
                if (question.isRequired) {
                  throw new Error(
                    `Missing required answer for question ${question.questionID}`,
                  );
                }
                continue;
              }
              answerPayload = { answerNumber: Number(incoming.answerNumber) };
            } else if (typeCode === "DATE") {
              if (!incoming.answerDate) {
                if (question.isRequired) {
                  throw new Error(
                    `Missing required answer for question ${question.questionID}`,
                  );
                }
                continue;
              }
              answerPayload = { answerDate: new Date(incoming.answerDate) };
            } else if (typeCode === "SINGLE_CHOICE") {
              const selected = incoming.selectedOptionID;
              if (!selected) {
                if (question.isRequired) {
                  throw new Error(
                    `Missing required answer for question ${question.questionID}`,
                  );
                }
                continue;
              }
              if (!optionIds.has(selected.toString())) {
                throw new Error(
                  `Invalid option for question ${question.questionID}`,
                );
              }
              answerPayload = {
                selectedOptionID: BigInt(selected),
                otherText: incoming.otherText || null,
              };
            } else if (typeCode === "MULTI_CHOICE") {
              const selectedOptionIDs = Array.isArray(
                incoming.selectedOptionIDs,
              )
                ? incoming.selectedOptionIDs
                : [];
              if (!selectedOptionIDs.length) {
                if (question.isRequired) {
                  throw new Error(
                    `Missing required answer for question ${question.questionID}`,
                  );
                }
                continue;
              }
              selectedOptionIDs.forEach((optionID) => {
                if (!optionIds.has(optionID.toString())) {
                  throw new Error(
                    `Invalid option for question ${question.questionID}`,
                  );
                }
              });
              multiOptionIDs = selectedOptionIDs.map((optionID) =>
                BigInt(optionID),
              );
              answerPayload = { otherText: incoming.otherText || null };
            } else {
              const value =
                typeof incoming.answerText === "string"
                  ? incoming.answerText.trim()
                  : "";
              if (question.isRequired && !value) {
                throw new Error(
                  `Missing required answer for question ${question.questionID}`,
                );
              }
              if (!value) continue;
              answerPayload = { answerText: value };
            }

            const createdAnswer = await tx.questionAnswer.create({
              data: {
                questionnaireResponseID:
                  createdResponse.questionnaireResponseID,
                questionID: question.questionID,
                ...answerPayload,
              },
            });

            if (multiOptionIDs?.length) {
              await tx.questionAnswerOption.createMany({
                data: multiOptionIDs.map((optionID) => ({
                  questionAnswerID: createdAnswer.questionAnswerID,
                  questionOptionID: optionID,
                })),
              });
            }
          }

          return createdResponse;
        });

        return res.status(201).json({ item: response });
      } catch (err) {
        return next(err);
      }
    },
  );

  // Client/admin CRUD for projects (container for questionnaires)
  router.get("/client/projects", requireRole(1, 3), async (req, res, next) => {
    try {
      const authUserID = BigInt(req.user.sub);
      const where = isAdmin(req)
        ? { deletedAt: null }
        : { clientUserID: authUserID, deletedAt: null };

      const projects = await prisma.project.findMany({
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
              createdAt: true,
              maxResponses: true,
            },
            orderBy: { createdAt: "desc" },
          },
          client: {
            select: {
              userID: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      const items = projects.map((p) => ({
        ...p,
        clientName:
          p.client && (p.client.firstName || p.client.lastName)
            ? `${p.client.firstName || ""} ${p.client.lastName || ""}`.trim()
            : (p.client?.email ?? null),
      }));

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
    },
  );

  router.post("/client/projects", requireRole(1, 3), async (req, res, next) => {
    try {
      const {
        title,
        description,
        gameTitle,
        gameGenre,
        gamePlatforms,
        gameVersion,
        gameNotes,
        clientUserID: incomingClientUserID,
      } = req.body;
      if (!title) return res.status(400).json({ error: "title required" });

      const isAdminReq = isAdmin(req);
      let clientUserID = BigInt(req.user.sub);
      if (
        isAdminReq &&
        incomingClientUserID !== undefined &&
        incomingClientUserID !== null &&
        incomingClientUserID !== ""
      ) {
        try {
          clientUserID = BigInt(incomingClientUserID);
        } catch (e) {
          return res.status(400).json({ error: "invalid clientUserID" });
        }
        const user = await prisma.user.findUnique({
          where: { userID: clientUserID },
          select: { userID: true },
        });
        if (!user)
          return res.status(404).json({ error: "client user not found" });
      }

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
        include: {
          client: {
            select: {
              userID: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      const item = {
        ...created,
        clientName:
          created.client &&
          (created.client.firstName || created.client.lastName)
            ? `${created.client.firstName || ""} ${created.client.lastName || ""}`.trim()
            : (created.client?.email ?? null),
      };

      return res.status(201).json({ item });
    } catch (err) {
      return next(err);
    }
  });

  router.patch(
    "/client/projects/:id",
    requireRole(1, 3),
    async (req, res, next) => {
      try {
        const projectID = BigInt(req.params.id);
        const project = await loadProjectOr404(prisma, projectID);
        if (!project) return res.status(404).json({ error: "Not found" });

        const authClientUserID = BigInt(req.user.sub);
        const isAdminReq = isAdmin(req);

        if (!isAdminReq && project.clientUserID !== authClientUserID) {
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
          clientUserID: incomingClientUserID,
        } = req.body;

        const data = {
          title: title === undefined ? undefined : title,
          description: description === undefined ? undefined : description,
          gameTitle: gameTitle === undefined ? undefined : gameTitle,
          gameGenre: gameGenre === undefined ? undefined : gameGenre,
          gamePlatforms:
            gamePlatforms === undefined ? undefined : gamePlatforms,
          gameVersion: gameVersion === undefined ? undefined : gameVersion,
          gameNotes: gameNotes === undefined ? undefined : gameNotes,
        };

        if (isAdminReq && incomingClientUserID !== undefined) {
          if (incomingClientUserID === null || incomingClientUserID === "") {
            data.clientUserID = null;
          } else {
            try {
              const newClientId = BigInt(incomingClientUserID);
              const user = await prisma.user.findUnique({
                where: { userID: newClientId },
                select: { userID: true },
              });
              if (!user)
                return res.status(404).json({ error: "client user not found" });
              data.clientUserID = newClientId;
            } catch (e) {
              return res.status(400).json({ error: "invalid clientUserID" });
            }
          }
        }

        const updated = await prisma.project.update({
          where: { projectID },
          data,
          include: {
            client: {
              select: {
                userID: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });

        const item = {
          ...updated,
          clientName:
            updated.client &&
            (updated.client.firstName || updated.client.lastName)
              ? `${updated.client.firstName || ""} ${updated.client.lastName || ""}`.trim()
              : (updated.client?.email ?? null),
        };

        return res.json({ item });
      } catch (err) {
        return next(err);
      }
    },
  );

  router.get("/admin/clients", requireRole(1), async (req, res, next) => {
    try {
      const clients = await prisma.user.findMany({
        where: { roleID: 3, deletedAt: null, isEmailVerified: true },
        orderBy: { firstName: "asc" },
        select: { userID: true, firstName: true, lastName: true, email: true },
      });

      const items = clients.map((u) => ({
        userID: u.userID,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        clientName:
          `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email,
      }));

      return res.json({ items });
    } catch (err) {
      return next(err);
    }
  });

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

        const updated = await prisma.$transaction(async (tx) => {
          //added to set the statusID to 3 for questionnaires when project is deleted
          await tx.questionnaire.updateMany({
            where: { projectID, deletedAt: null },
            data: { statusID: 3 },
          });

          const upd = await tx.project.update({
            where: { projectID },
            data: { deletedAt: new Date() },
          });

          return upd;
        });

        return res.json({ item: updated });
      } catch (err) {
        return next(err);
      }
    },
  );

  return router;
}

module.exports = { buildProjectRoutes };
