const express = require("express");
const { requireRole } = require("../../middleware/auth");

function buildAdminQuestionnaireRoutes(prisma) {
  const router = express.Router();

  router.use(requireRole(1));

  router.get("/admin/questionnaires/:id/responses", async (req, res, next) => {
    try {
      const questionnaireID = BigInt(req.params.id);
      const responses = await prisma.questionnaireResponse.findMany({
        where: { questionnaireID },
        orderBy: { submittedAt: "desc" },
        include: {
          tester: {
            select: {
              userID: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          answers: {
            include: {
              selectedOption: {
                select: {
                  questionOptionID: true,
                  optionText: true,
                  optionValue: true,
                },
              },
            },
          },
        },
      });

      const items = responses.map((r) => ({
        questionnaireResponseID: r.questionnaireResponseID,
        testerUserID: r.testerUserID,
        submittedAt: r.submittedAt || r.createdAt,
        tester: r.tester,
        answers: (r.answers || []).map((a) => ({
          questionID: a.questionID,
          answerText: a.answerText,
          answerNumber: a.answerNumber,
          answerDate: a.answerDate,
          otherText: a.otherText,
          selectedOption: a.selectedOption
            ? {
                questionOptionID: a.selectedOption.questionOptionID,
                optionText: a.selectedOption.optionText,
                optionValue: a.selectedOption.optionValue,
              }
            : null,
        })),
      }));

      res.json({ items });
    } catch (err) {
      console.error("adminQuestionnaires error:", err);
      return res.status(500).json({ error: err.message, stack: err.stack });
    }
  });

  return router;
}

module.exports = { buildAdminQuestionnaireRoutes };
