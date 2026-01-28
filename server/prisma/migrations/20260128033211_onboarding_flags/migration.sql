-- AlterTable
ALTER TABLE "tbl_users" ADD COLUMN     "onboardingClientCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingProfileCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingQuestionnaireCompleted" BOOLEAN NOT NULL DEFAULT false;
