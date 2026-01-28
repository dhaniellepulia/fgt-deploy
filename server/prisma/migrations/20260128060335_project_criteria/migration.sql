-- AlterTable
ALTER TABLE "tbl_projects" ADD COLUMN     "gameGenre" TEXT,
ADD COLUMN     "gameNotes" TEXT,
ADD COLUMN     "gamePlatforms" TEXT,
ADD COLUMN     "gameTitle" TEXT,
ADD COLUMN     "gameVersion" TEXT;

-- CreateTable
CREATE TABLE "tbl_questionnaire_criteria" (
    "questionnaireCriteriaID" BIGSERIAL NOT NULL,
    "questionnaireID" BIGINT NOT NULL,
    "criterionType" TEXT NOT NULL,
    "matchType" TEXT NOT NULL,
    "valueJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_questionnaire_criteria_pkey" PRIMARY KEY ("questionnaireCriteriaID")
);

-- AddForeignKey
ALTER TABLE "tbl_questionnaire_criteria" ADD CONSTRAINT "tbl_questionnaire_criteria_questionnaireID_fkey" FOREIGN KEY ("questionnaireID") REFERENCES "tbl_questionnaires"("questionnaireID") ON DELETE RESTRICT ON UPDATE CASCADE;
