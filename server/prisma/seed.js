const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

function loadSeedData(fileName) {
  const filePath = path.join(__dirname, "seed-data", fileName);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function normalizePlatforms(platforms) {
  if (!platforms) return null;
  if (Array.isArray(platforms)) return platforms.join(", ");
  return platforms;
}

async function main() {
  await prisma.role.upsert({
    where: { roleID: 1 },
    update: { roleName: "admin", roleDescription: "Administrator" },
    create: { roleID: 1, roleName: "admin", roleDescription: "Administrator" },
  });
  await prisma.role.upsert({
    where: { roleID: 2 },
    update: { roleName: "tester", roleDescription: "Playtester" },
    create: { roleID: 2, roleName: "tester", roleDescription: "Playtester" },
  });
  await prisma.role.upsert({
    where: { roleID: 3 },
    update: { roleName: "client", roleDescription: "Client" },
    create: { roleID: 3, roleName: "client", roleDescription: "Client" },
  });

  await prisma.communitySetting.upsert({
    where: { communitySettingID: 0 },
    update: { settingName: "Open", description: "Open" },
    create: {
      communitySettingID: 0,
      settingName: "Open",
      description: "Open",
    },
  });
  await prisma.communitySetting.upsert({
    where: { communitySettingID: 1 },
    update: { settingName: "InviteOnly", description: "Invite-only" },
    create: {
      communitySettingID: 1,
      settingName: "InviteOnly",
      description: "Invite-only",
    },
  });

  await prisma.userStatus.upsert({
    where: { userStatusID: 1 },
    update: { statusName: "Active", description: "Active" },
    create: { userStatusID: 1, statusName: "Active", description: "Active" },
  });
  await prisma.userStatus.upsert({
    where: { userStatusID: 2 },
    update: { statusName: "Suspended", description: "Suspended" },
    create: {
      userStatusID: 2,
      statusName: "Suspended",
      description: "Suspended",
    },
  });
  await prisma.userStatus.upsert({
    where: { userStatusID: 3 },
    update: { statusName: "Deleted", description: "Deleted" },
    create: { userStatusID: 3, statusName: "Deleted", description: "Deleted" },
  });

  await prisma.userStatus.upsert({
    where: { userStatusID: 4 },
    update: { statusName: "Pending", description: "Pending approval" },
    create: {
      userStatusID: 4,
      statusName: "Pending",
      description: "Pending approval",
    },
  });

  await prisma.platformLanguage.upsert({
    where: { platformLanguageID: 1 },
    update: { languageCode: "en", languageName: "English", sortOrder: 1 },
    create: {
      platformLanguageID: 1,
      languageCode: "en",
      languageName: "English",
      sortOrder: 1,
    },
  });
  await prisma.platformLanguage.upsert({
    where: { platformLanguageID: 2 },
    update: { languageCode: "ko", languageName: "Korean", sortOrder: 2 },
    create: {
      platformLanguageID: 2,
      languageCode: "ko",
      languageName: "Korean",
      sortOrder: 2,
    },
  });
  await prisma.platformLanguage.upsert({
    where: { platformLanguageID: 3 },
    update: { languageCode: "ja", languageName: "Japanese", sortOrder: 3 },
    create: {
      platformLanguageID: 3,
      languageCode: "ja",
      languageName: "Japanese",
      sortOrder: 3,
    },
  });

  await prisma.questionnaireStatus.upsert({
    where: { questionnaireStatusID: 1 },
    update: { statusName: "Draft", sortOrder: 1 },
    create: {
      questionnaireStatusID: 1,
      statusName: "Draft",
      sortOrder: 1,
    },
  });
  await prisma.questionnaireStatus.upsert({
    where: { questionnaireStatusID: 2 },
    update: { statusName: "Published", sortOrder: 2 },
    create: {
      questionnaireStatusID: 2,
      statusName: "Published",
      sortOrder: 2,
    },
  });
  await prisma.questionnaireStatus.upsert({
    where: { questionnaireStatusID: 3 },
    update: { statusName: "Archived", sortOrder: 3 },
    create: {
      questionnaireStatusID: 3,
      statusName: "Archived",
      sortOrder: 3,
    },
  });

  await prisma.questionType.upsert({
    where: { questionTypeID: 1 },
    update: { typeCode: "SHORT_TEXT", typeName: "Short Text" },
    create: {
      questionTypeID: 1,
      typeCode: "SHORT_TEXT",
      typeName: "Short Text",
    },
  });
  await prisma.questionType.upsert({
    where: { questionTypeID: 2 },
    update: { typeCode: "LONG_TEXT", typeName: "Long Text" },
    create: {
      questionTypeID: 2,
      typeCode: "LONG_TEXT",
      typeName: "Long Text",
    },
  });
  await prisma.questionType.upsert({
    where: { questionTypeID: 3 },
    update: { typeCode: "SINGLE_CHOICE", typeName: "Single Choice" },
    create: {
      questionTypeID: 3,
      typeCode: "SINGLE_CHOICE",
      typeName: "Single Choice",
    },
  });
  await prisma.questionType.upsert({
    where: { questionTypeID: 4 },
    update: { typeCode: "MULTI_CHOICE", typeName: "Multi Choice" },
    create: {
      questionTypeID: 4,
      typeCode: "MULTI_CHOICE",
      typeName: "Multi Choice",
    },
  });
  await prisma.questionType.upsert({
    where: { questionTypeID: 5 },
    update: { typeCode: "SCALE", typeName: "Scale" },
    create: {
      questionTypeID: 5,
      typeCode: "SCALE",
      typeName: "Scale",
    },
  });
  await prisma.questionType.upsert({
    where: { questionTypeID: 6 },
    update: { typeCode: "NUMBER", typeName: "Number" },
    create: {
      questionTypeID: 6,
      typeCode: "NUMBER",
      typeName: "Number",
    },
  });
  await prisma.questionType.upsert({
    where: { questionTypeID: 7 },
    update: { typeCode: "DATE", typeName: "Date" },
    create: { questionTypeID: 7, typeCode: "DATE", typeName: "Date" },
  });

  await prisma.responseStatus.upsert({
    where: { responseStatusID: 1 },
    update: { statusName: "InProgress", sortOrder: 1 },
    create: {
      responseStatusID: 1,
      statusName: "InProgress",
      sortOrder: 1,
    },
  });
  await prisma.responseStatus.upsert({
    where: { responseStatusID: 2 },
    update: { statusName: "Submitted", sortOrder: 2 },
    create: {
      responseStatusID: 2,
      statusName: "Submitted",
      sortOrder: 2,
    },
  });
  await prisma.responseStatus.upsert({
    where: { responseStatusID: 3 },
    update: { statusName: "Abandoned", sortOrder: 3 },
    create: {
      responseStatusID: 3,
      statusName: "Abandoned",
      sortOrder: 3,
    },
  });

  await prisma.pointTransactionType.upsert({
    where: { pointTransactionTypeID: 1 },
    update: { typeCode: "EARN_SURVEY", typeName: "Earn Survey" },
    create: {
      pointTransactionTypeID: 1,
      typeCode: "EARN_SURVEY",
      typeName: "Earn Survey",
    },
  });
  await prisma.pointTransactionType.upsert({
    where: { pointTransactionTypeID: 2 },
    update: { typeCode: "REDEEM_REWARD", typeName: "Redeem Reward" },
    create: {
      pointTransactionTypeID: 2,
      typeCode: "REDEEM_REWARD",
      typeName: "Redeem Reward",
    },
  });
  await prisma.pointTransactionType.upsert({
    where: { pointTransactionTypeID: 3 },
    update: { typeCode: "ADJUSTMENT", typeName: "Adjustment" },
    create: {
      pointTransactionTypeID: 3,
      typeCode: "ADJUSTMENT",
      typeName: "Adjustment",
    },
  });
  await prisma.pointTransactionType.upsert({
    where: { pointTransactionTypeID: 4 },
    update: { typeCode: "REVERSAL", typeName: "Reversal" },
    create: {
      pointTransactionTypeID: 4,
      typeCode: "REVERSAL",
      typeName: "Reversal",
    },
  });

  await prisma.rewardRedemptionStatus.upsert({
    where: { rewardRedemptionStatusID: 1 },
    update: { statusName: "Pending", sortOrder: 1 },
    create: {
      rewardRedemptionStatusID: 1,
      statusName: "Pending",
      sortOrder: 1,
    },
  });
  await prisma.rewardRedemptionStatus.upsert({
    where: { rewardRedemptionStatusID: 2 },
    update: { statusName: "Approved", sortOrder: 2 },
    create: {
      rewardRedemptionStatusID: 2,
      statusName: "Approved",
      sortOrder: 2,
    },
  });
  await prisma.rewardRedemptionStatus.upsert({
    where: { rewardRedemptionStatusID: 3 },
    update: { statusName: "Fulfilled", sortOrder: 3 },
    create: {
      rewardRedemptionStatusID: 3,
      statusName: "Fulfilled",
      sortOrder: 3,
    },
  });
  await prisma.rewardRedemptionStatus.upsert({
    where: { rewardRedemptionStatusID: 4 },
    update: { statusName: "Rejected", sortOrder: 4 },
    create: {
      rewardRedemptionStatusID: 4,
      statusName: "Rejected",
      sortOrder: 4,
    },
  });
  await prisma.rewardRedemptionStatus.upsert({
    where: { rewardRedemptionStatusID: 5 },
    update: { statusName: "Cancelled", sortOrder: 5 },
    create: {
      rewardRedemptionStatusID: 5,
      statusName: "Cancelled",
      sortOrder: 5,
    },
  });

  const genres = loadSeedData("genres.json");
  await prisma.gameGenre.createMany({ data: genres, skipDuplicates: true });

  const games = loadSeedData("games.json");
  const gameMap = new Map();
  for (const game of games) {
    const name = game.name.trim();
    const platforms = normalizePlatforms(game.platforms);
    if (!gameMap.has(name)) {
      gameMap.set(name, new Set());
    }
    if (platforms) {
      gameMap.get(name).add(platforms);
    }
  }

  for (const [name, platformSet] of gameMap.entries()) {
    const platforms =
      platformSet.size > 1 ? "Multi" : Array.from(platformSet)[0] || null;
    await prisma.game.upsert({
      where: { name },
      update: { platforms, isActive: true },
      create: { name, platforms, isActive: true },
    });
  }

  // add admin account
  const adminEmail = "admin@gmail.com";
  const adminPassword = "admin";
  const adminRoleID = 1;
  const adminStatusID = 1;

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        roleID: BigInt(adminRoleID),
        userStatusID: adminStatusID,
        communitySettingID: 0,
        firstName: "Admin",
        lastName: "User",
      },
    });
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
