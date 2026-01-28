-- CreateTable
CREATE TABLE "tbl_roles" (
    "roleID" BIGSERIAL NOT NULL,
    "roleName" TEXT NOT NULL,
    "roleDescription" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_roles_pkey" PRIMARY KEY ("roleID")
);

-- CreateTable
CREATE TABLE "tbl_community_settings" (
    "communitySettingID" INTEGER NOT NULL,
    "settingName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_community_settings_pkey" PRIMARY KEY ("communitySettingID")
);

-- CreateTable
CREATE TABLE "tbl_user_statuses" (
    "userStatusID" SERIAL NOT NULL,
    "statusName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_user_statuses_pkey" PRIMARY KEY ("userStatusID")
);

-- CreateTable
CREATE TABLE "tbl_platform_languages" (
    "platformLanguageID" SERIAL NOT NULL,
    "languageCode" TEXT NOT NULL,
    "languageName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_platform_languages_pkey" PRIMARY KEY ("platformLanguageID")
);

-- CreateTable
CREATE TABLE "tbl_users" (
    "userID" BIGSERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "roleID" BIGINT NOT NULL,
    "userStatusID" INTEGER NOT NULL,
    "communitySettingID" INTEGER NOT NULL DEFAULT 0,
    "firstName" TEXT,
    "lastName" TEXT,
    "phoneNumber" TEXT,
    "discordID" TEXT,
    "platformLanguageID" INTEGER,
    "birthdate" DATE,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tbl_users_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "tbl_projects" (
    "projectID" BIGSERIAL NOT NULL,
    "clientUserID" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tbl_projects_pkey" PRIMARY KEY ("projectID")
);

-- CreateTable
CREATE TABLE "tbl_questionnaire_statuses" (
    "questionnaireStatusID" SERIAL NOT NULL,
    "statusName" TEXT NOT NULL,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_questionnaire_statuses_pkey" PRIMARY KEY ("questionnaireStatusID")
);

-- CreateTable
CREATE TABLE "tbl_questionnaires" (
    "questionnaireID" BIGSERIAL NOT NULL,
    "clientUserID" BIGINT NOT NULL,
    "projectID" BIGINT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "statusID" INTEGER NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "timeLimitSeconds" INTEGER,
    "maxResponses" INTEGER,
    "pointsReward" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tbl_questionnaires_pkey" PRIMARY KEY ("questionnaireID")
);

-- CreateTable
CREATE TABLE "tbl_question_types" (
    "questionTypeID" SERIAL NOT NULL,
    "typeCode" TEXT NOT NULL,
    "typeName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_question_types_pkey" PRIMARY KEY ("questionTypeID")
);

-- CreateTable
CREATE TABLE "tbl_questions" (
    "questionID" BIGSERIAL NOT NULL,
    "questionnaireID" BIGINT NOT NULL,
    "questionTypeID" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "helpText" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL,
    "minSelections" INTEGER,
    "maxSelections" INTEGER,
    "minValue" DECIMAL,
    "maxValue" DECIMAL,
    "stepValue" DECIMAL,
    "placeholderText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tbl_questions_pkey" PRIMARY KEY ("questionID")
);

-- CreateTable
CREATE TABLE "tbl_question_options" (
    "questionOptionID" BIGSERIAL NOT NULL,
    "questionID" BIGINT NOT NULL,
    "optionText" TEXT NOT NULL,
    "optionValue" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "isOtherOption" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tbl_question_options_pkey" PRIMARY KEY ("questionOptionID")
);

-- CreateTable
CREATE TABLE "tbl_response_statuses" (
    "responseStatusID" SERIAL NOT NULL,
    "statusName" TEXT NOT NULL,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_response_statuses_pkey" PRIMARY KEY ("responseStatusID")
);

-- CreateTable
CREATE TABLE "tbl_questionnaire_responses" (
    "questionnaireResponseID" BIGSERIAL NOT NULL,
    "questionnaireID" BIGINT NOT NULL,
    "testerUserID" BIGINT NOT NULL,
    "responseStatusID" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_questionnaire_responses_pkey" PRIMARY KEY ("questionnaireResponseID")
);

-- CreateTable
CREATE TABLE "tbl_question_answers" (
    "questionAnswerID" BIGSERIAL NOT NULL,
    "questionnaireResponseID" BIGINT NOT NULL,
    "questionID" BIGINT NOT NULL,
    "answerText" TEXT,
    "answerNumber" DECIMAL,
    "answerDate" DATE,
    "selectedOptionID" BIGINT,
    "otherText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_question_answers_pkey" PRIMARY KEY ("questionAnswerID")
);

-- CreateTable
CREATE TABLE "tbl_question_answer_options" (
    "questionAnswerOptionID" BIGSERIAL NOT NULL,
    "questionAnswerID" BIGINT NOT NULL,
    "questionOptionID" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_question_answer_options_pkey" PRIMARY KEY ("questionAnswerOptionID")
);

-- CreateTable
CREATE TABLE "tbl_point_transaction_types" (
    "pointTransactionTypeID" SERIAL NOT NULL,
    "typeCode" TEXT NOT NULL,
    "typeName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_point_transaction_types_pkey" PRIMARY KEY ("pointTransactionTypeID")
);

-- CreateTable
CREATE TABLE "tbl_point_transactions" (
    "pointTransactionID" BIGSERIAL NOT NULL,
    "userID" BIGINT NOT NULL,
    "pointTransactionTypeID" INTEGER NOT NULL,
    "pointsDelta" INTEGER NOT NULL,
    "questionnaireResponseID" BIGINT,
    "rewardRedemptionID" BIGINT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_point_transactions_pkey" PRIMARY KEY ("pointTransactionID")
);

-- CreateTable
CREATE TABLE "tbl_user_point_balances" (
    "userPointBalanceID" BIGSERIAL NOT NULL,
    "userID" BIGINT NOT NULL,
    "currentPoints" INTEGER NOT NULL DEFAULT 0,
    "lifetimeEarnedPoints" INTEGER NOT NULL DEFAULT 0,
    "lifetimeSpentPoints" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_user_point_balances_pkey" PRIMARY KEY ("userPointBalanceID")
);

-- CreateTable
CREATE TABLE "tbl_rewards" (
    "rewardID" BIGSERIAL NOT NULL,
    "rewardName" TEXT NOT NULL,
    "rewardDescription" TEXT,
    "pointsCost" INTEGER NOT NULL,
    "stockQty" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_rewards_pkey" PRIMARY KEY ("rewardID")
);

-- CreateTable
CREATE TABLE "tbl_reward_redemption_statuses" (
    "rewardRedemptionStatusID" SERIAL NOT NULL,
    "statusName" TEXT NOT NULL,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_reward_redemption_statuses_pkey" PRIMARY KEY ("rewardRedemptionStatusID")
);

-- CreateTable
CREATE TABLE "tbl_reward_redemptions" (
    "rewardRedemptionID" BIGSERIAL NOT NULL,
    "userID" BIGINT NOT NULL,
    "rewardID" BIGINT NOT NULL,
    "pointsCostAtRedemption" INTEGER NOT NULL,
    "rewardNameAtRedemption" TEXT NOT NULL,
    "rewardRedemptionStatusID" INTEGER NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL,
    "fulfilledAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_reward_redemptions_pkey" PRIMARY KEY ("rewardRedemptionID")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_roles_roleName_key" ON "tbl_roles"("roleName");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_community_settings_settingName_key" ON "tbl_community_settings"("settingName");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_user_statuses_statusName_key" ON "tbl_user_statuses"("statusName");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_platform_languages_languageCode_key" ON "tbl_platform_languages"("languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_users_email_key" ON "tbl_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_questionnaire_statuses_statusName_key" ON "tbl_questionnaire_statuses"("statusName");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_question_types_typeCode_key" ON "tbl_question_types"("typeCode");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_response_statuses_statusName_key" ON "tbl_response_statuses"("statusName");

-- CreateIndex
CREATE INDEX "idx_response_q_tester" ON "tbl_questionnaire_responses"("questionnaireID", "testerUserID");

-- CreateIndex
CREATE UNIQUE INDEX "uq_answer_response_question" ON "tbl_question_answers"("questionnaireResponseID", "questionID");

-- CreateIndex
CREATE UNIQUE INDEX "uq_answeroption" ON "tbl_question_answer_options"("questionAnswerID", "questionOptionID");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_point_transaction_types_typeCode_key" ON "tbl_point_transaction_types"("typeCode");

-- CreateIndex
CREATE INDEX "idx_points_user_created" ON "tbl_point_transactions"("userID", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_user_point_balances_userID_key" ON "tbl_user_point_balances"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_reward_redemption_statuses_statusName_key" ON "tbl_reward_redemption_statuses"("statusName");

-- CreateIndex
CREATE INDEX "idx_redemptions_user_requested" ON "tbl_reward_redemptions"("userID", "requestedAt");

-- AddForeignKey
ALTER TABLE "tbl_users" ADD CONSTRAINT "tbl_users_roleID_fkey" FOREIGN KEY ("roleID") REFERENCES "tbl_roles"("roleID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_users" ADD CONSTRAINT "tbl_users_userStatusID_fkey" FOREIGN KEY ("userStatusID") REFERENCES "tbl_user_statuses"("userStatusID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_users" ADD CONSTRAINT "tbl_users_communitySettingID_fkey" FOREIGN KEY ("communitySettingID") REFERENCES "tbl_community_settings"("communitySettingID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_users" ADD CONSTRAINT "tbl_users_platformLanguageID_fkey" FOREIGN KEY ("platformLanguageID") REFERENCES "tbl_platform_languages"("platformLanguageID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_projects" ADD CONSTRAINT "tbl_projects_clientUserID_fkey" FOREIGN KEY ("clientUserID") REFERENCES "tbl_users"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_questionnaires" ADD CONSTRAINT "tbl_questionnaires_clientUserID_fkey" FOREIGN KEY ("clientUserID") REFERENCES "tbl_users"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_questionnaires" ADD CONSTRAINT "tbl_questionnaires_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "tbl_projects"("projectID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_questionnaires" ADD CONSTRAINT "tbl_questionnaires_statusID_fkey" FOREIGN KEY ("statusID") REFERENCES "tbl_questionnaire_statuses"("questionnaireStatusID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_questions" ADD CONSTRAINT "tbl_questions_questionnaireID_fkey" FOREIGN KEY ("questionnaireID") REFERENCES "tbl_questionnaires"("questionnaireID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_questions" ADD CONSTRAINT "tbl_questions_questionTypeID_fkey" FOREIGN KEY ("questionTypeID") REFERENCES "tbl_question_types"("questionTypeID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_question_options" ADD CONSTRAINT "tbl_question_options_questionID_fkey" FOREIGN KEY ("questionID") REFERENCES "tbl_questions"("questionID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_questionnaire_responses" ADD CONSTRAINT "tbl_questionnaire_responses_questionnaireID_fkey" FOREIGN KEY ("questionnaireID") REFERENCES "tbl_questionnaires"("questionnaireID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_questionnaire_responses" ADD CONSTRAINT "tbl_questionnaire_responses_testerUserID_fkey" FOREIGN KEY ("testerUserID") REFERENCES "tbl_users"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_questionnaire_responses" ADD CONSTRAINT "tbl_questionnaire_responses_responseStatusID_fkey" FOREIGN KEY ("responseStatusID") REFERENCES "tbl_response_statuses"("responseStatusID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_question_answers" ADD CONSTRAINT "tbl_question_answers_questionnaireResponseID_fkey" FOREIGN KEY ("questionnaireResponseID") REFERENCES "tbl_questionnaire_responses"("questionnaireResponseID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_question_answers" ADD CONSTRAINT "tbl_question_answers_questionID_fkey" FOREIGN KEY ("questionID") REFERENCES "tbl_questions"("questionID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_question_answers" ADD CONSTRAINT "tbl_question_answers_selectedOptionID_fkey" FOREIGN KEY ("selectedOptionID") REFERENCES "tbl_question_options"("questionOptionID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_question_answer_options" ADD CONSTRAINT "tbl_question_answer_options_questionAnswerID_fkey" FOREIGN KEY ("questionAnswerID") REFERENCES "tbl_question_answers"("questionAnswerID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_question_answer_options" ADD CONSTRAINT "tbl_question_answer_options_questionOptionID_fkey" FOREIGN KEY ("questionOptionID") REFERENCES "tbl_question_options"("questionOptionID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_point_transactions" ADD CONSTRAINT "tbl_point_transactions_userID_fkey" FOREIGN KEY ("userID") REFERENCES "tbl_users"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_point_transactions" ADD CONSTRAINT "tbl_point_transactions_pointTransactionTypeID_fkey" FOREIGN KEY ("pointTransactionTypeID") REFERENCES "tbl_point_transaction_types"("pointTransactionTypeID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_point_transactions" ADD CONSTRAINT "tbl_point_transactions_questionnaireResponseID_fkey" FOREIGN KEY ("questionnaireResponseID") REFERENCES "tbl_questionnaire_responses"("questionnaireResponseID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_point_transactions" ADD CONSTRAINT "tbl_point_transactions_rewardRedemptionID_fkey" FOREIGN KEY ("rewardRedemptionID") REFERENCES "tbl_reward_redemptions"("rewardRedemptionID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_user_point_balances" ADD CONSTRAINT "tbl_user_point_balances_userID_fkey" FOREIGN KEY ("userID") REFERENCES "tbl_users"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_reward_redemptions" ADD CONSTRAINT "tbl_reward_redemptions_userID_fkey" FOREIGN KEY ("userID") REFERENCES "tbl_users"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_reward_redemptions" ADD CONSTRAINT "tbl_reward_redemptions_rewardID_fkey" FOREIGN KEY ("rewardID") REFERENCES "tbl_rewards"("rewardID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_reward_redemptions" ADD CONSTRAINT "tbl_reward_redemptions_rewardRedemptionStatusID_fkey" FOREIGN KEY ("rewardRedemptionStatusID") REFERENCES "tbl_reward_redemption_statuses"("rewardRedemptionStatusID") ON DELETE RESTRICT ON UPDATE CASCADE;
