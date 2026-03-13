const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();
const { requireAuth } = require("./middleware/auth");
const { buildQuestionnaireRoutes } = require("./routes/questionnaires");
const { buildProjectRoutes } = require("./routes/projects");
const { buildCommunityRoutes } = require("./routes/communities");
const { buildAdminUserRoutes } = require("./routes/admin/adminUsers");
const {
  buildAdminQuestionnaireRoutes,
} = require("./routes/admin/adminQuestionnaires");

const app = express();
const prisma = new PrismaClient();
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

const uploadsRootDir = path.join(__dirname, "..", "uploads");
const profileUploadDir = path.join(uploadsRootDir, "profiles");
const projectUploadDir = path.join(uploadsRootDir, "projects");
fs.mkdirSync(profileUploadDir, { recursive: true });
fs.mkdirSync(projectUploadDir, { recursive: true });
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, profileUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `profile_${Date.now()}${Math.floor(Math.random() * 1000)}${ext}`;
    cb(null, name);
  },
});
const profileUpload = multer({ storage: profileStorage });

// explicit public route to serve project files (avoid auth middleware)
app.get("/uploads/projects/:file", (req, res) => {
  const file = req.params.file;
  const filePath = path.join(__dirname, "..", "uploads", "projects", file);
  return res.sendFile(filePath, (err) => {
    if (err) {
      console.error("sendFile error:", err);
      res.status(err.status || 500).end();
    }
  });
});
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const DEFAULT_ROLE_ID = BigInt(process.env.DEFAULT_ROLE_ID || 2); // 2 = tester (seeded)
const DEFAULT_USER_STATUS_ID = Number(process.env.DEFAULT_USER_STATUS_ID || 1); // 1 = Active (seeded)
const DEFAULT_COMMUNITY_SETTING_ID = Number(
  process.env.DEFAULT_COMMUNITY_SETTING_ID || 0,
);
const SELF_REGISTER_USER_STATUS_ID = Number(
  process.env.SELF_REGISTER_USER_STATUS_ID || 4,
);
const ACTIVE_USER_STATUS_ID = Number(process.env.ACTIVE_USER_STATUS_ID || 1);
const XP_AWARDS = {
  profileCompleted: 15,
  questionnaireCompleted: 20,
};

app.use(cors());
app.use(express.json());

const adminProjectsImage = require("./routes/admin/adminProjectsImage");
app.use("/admin/projects", adminProjectsImage);

app.set("json replacer", (key, value) =>
  typeof value === "bigint" ? value.toString() : value,
);

function signToken(user) {
  return jwt.sign(
    { sub: user.userID.toString(), roleID: user.roleID.toString() },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

app.get("/health", (req, res) => res.json({ ok: true }));

app.post("/auth/register", async (req, res) => {
  const { email, password, roleID, firstName, lastName, countryResidenceCode } =
    req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      roleID: roleID ? BigInt(roleID) : DEFAULT_ROLE_ID,
      userStatusID: SELF_REGISTER_USER_STATUS_ID,
      communitySettingID: DEFAULT_COMMUNITY_SETTING_ID,
      firstName: firstName ? String(firstName).trim() : null,
      lastName: lastName ? String(lastName).trim() : null,
      countryResidenceCode: countryResidenceCode
        ? String(countryResidenceCode).toUpperCase()
        : null,
    },
    select: {
      userID: true,
      email: true,
      roleID: true,
      userStatusID: true,
      communitySettingID: true,
      onboardingProfileCompleted: true,
      onboardingQuestionnaireCompleted: true,
      onboardingClientCompleted: true,
      firstName: true,
      lastName: true,
      profileImageUrl: true,
      phoneNumber: true,
      discordID: true,
      platformLanguageID: true,
      birthdate: true,
      countryOriginCode: true,
      countryResidenceCode: true,
      gender: true,
      spokenLanguages: true,
      experienceLevel: true,
      recentGameID: true,
      motivations: true,
      gamerProfile: true,
      xpTotal: true,
    },
  });
  //added code:
  // only issue a token if the account is active
  if (Number(user.userStatusID) === ACTIVE_USER_STATUS_ID) {
    const token = signToken(user);
    return res.status(201).json({ token, user });
  }
  return res.status(201).json({ user, pending: true });
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  // const user = await prisma.user.findUnique({ where: { email } });
  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
  });

  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  if (Number(user.userStatusID) === SELF_REGISTER_USER_STATUS_ID) {
    return res
      .status(403)
      .json({ error: "Account pending", userStatusID: user.userStatusID });
  }
  if (Number(user.userStatusID) === 3) {
    return res
      .status(403)
      .json({ error: "Account disapproved", userStatusID: user.userStatusID });
  }
  if (Number(user.userStatusID) !== ACTIVE_USER_STATUS_ID) {
    return res
      .status(403)
      .json({ error: "Account not active", userStatusID: user.userStatusID });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  await prisma.user.update({
    where: { userID: user.userID },
    data: { lastLoginAt: new Date() },
  });
  await prisma.userLoginActivity.create({
    data: {
      userID: user.userID,
      loggedInAt: new Date(),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    },
  });

  const token = signToken(user);
  res.json({
    token,
    user: {
      userID: user.userID,
      email: user.email,
      roleID: user.roleID,
      communitySettingID: user.communitySettingID,
      onboardingProfileCompleted: user.onboardingProfileCompleted,
      onboardingQuestionnaireCompleted: user.onboardingQuestionnaireCompleted,
      onboardingClientCompleted: user.onboardingClientCompleted,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      phoneNumber: user.phoneNumber,
      discordID: user.discordID,
      platformLanguageID: user.platformLanguageID,
      birthdate: user.birthdate,
      countryOriginCode: user.countryOriginCode,
      countryResidenceCode: user.countryResidenceCode,
      gender: user.gender,
      spokenLanguages: user.spokenLanguages,
      experienceLevel: user.experienceLevel,
      recentGameID: user.recentGameID,
      motivations: user.motivations,
      gamerProfile: user.gamerProfile,
      xpTotal: user.xpTotal ?? 0,
    },
  });
});

app.get("/auth/me", requireAuth, async (req, res) => {
  const userID = BigInt(req.user.sub);
  const user = await prisma.user.findUnique({
    where: { userID },
    select: {
      userID: true,
      email: true,
      roleID: true,
      userStatusID: true,
      communitySettingID: true,
      onboardingProfileCompleted: true,
      onboardingQuestionnaireCompleted: true,
      onboardingClientCompleted: true,
      motivations: true,
      gamerProfile: true,
      xpTotal: true,
      isEmailVerified: true,
      emailVerifiedAt: true,
      createdAt: true,
      firstName: true,
      lastName: true,
      profileImageUrl: true,
      phoneNumber: true,
      discordID: true,
      platformLanguageID: true,
      birthdate: true,
      countryOriginCode: true,
      countryResidenceCode: true,
      gender: true,
      spokenLanguages: true,
      experienceLevel: true,
      recentGameID: true,
    },
  });
  res.json({ user });
});

app.use(requireAuth);
app.patch("/users/me/onboarding", async (req, res, next) => {
  try {
    const userID = BigInt(req.user.sub);
    const {
      onboardingProfileCompleted,
      onboardingQuestionnaireCompleted,
      onboardingClientCompleted,
    } = req.body;

    const existing = await prisma.user.findUnique({
      where: { userID },
      select: {
        onboardingProfileCompleted: true,
        onboardingQuestionnaireCompleted: true,
      },
    });
    if (!existing) return res.status(404).json({ error: "Not found" });

    let xpDelta = 0;
    if (onboardingProfileCompleted === true && !existing.onboardingProfileCompleted) {
      xpDelta += XP_AWARDS.profileCompleted;
    }
    if (
      onboardingQuestionnaireCompleted === true &&
      !existing.onboardingQuestionnaireCompleted
    ) {
      xpDelta += XP_AWARDS.questionnaireCompleted;
    }

    const updated = await prisma.user.update({
      where: { userID },
      data: {
        onboardingProfileCompleted,
        onboardingQuestionnaireCompleted,
        onboardingClientCompleted,
        xpTotal: xpDelta > 0 ? { increment: xpDelta } : undefined,
      },
      select: {
        userID: true,
        email: true,
        roleID: true,
        onboardingProfileCompleted: true,
        onboardingQuestionnaireCompleted: true,
        onboardingClientCompleted: true,
        xpTotal: true,
      },
    });

    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
});

app.patch("/users/me/community-setting", async (req, res, next) => {
  try {
    const userID = BigInt(req.user.sub);
    const { communitySettingID } = req.body;
    const normalized = Number(communitySettingID);

    if (Number.isNaN(normalized) || (normalized !== 0 && normalized !== 1)) {
      return res.status(400).json({
        error: "communitySettingID must be 0 or 1",
        received: communitySettingID,
        receivedType: typeof communitySettingID,
      });
    }

    const updated = await prisma.user.update({
      where: { userID },
      data: { communitySettingID: normalized },
      select: {
        userID: true,
        email: true,
        roleID: true,
        communitySettingID: true,
        onboardingProfileCompleted: true,
        onboardingQuestionnaireCompleted: true,
        onboardingClientCompleted: true,
      },
    });

    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
});

app.get("/metadata/genres", async (req, res, next) => {
  try {
    const items = await prisma.gameGenre.findMany({
      orderBy: { sortOrder: "asc" },
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

app.get("/metadata/games", async (req, res, next) => {
  try {
    const items = await prisma.game.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

app.patch("/users/me/profile", async (req, res, next) => {
  try {
    const userID = BigInt(req.user.sub);
    const {
      firstName,
      lastName,
      profileImageUrl,
      phoneNumber,
      discordID,
      platformLanguageID,
      birthdate,
      countryOriginCode,
      countryResidenceCode,
      gender,
      spokenLanguages,
      experienceLevel,
      recentGameID,
      genreIDs,
    } = req.body;

    const updated = await prisma.user.update({
      where: { userID },
      data: {
        firstName,
        lastName,
        profileImageUrl,
        phoneNumber,
        discordID,
        platformLanguageID:
          platformLanguageID === undefined
            ? undefined
            : platformLanguageID
              ? Number(platformLanguageID)
              : null,
        birthdate: birthdate ? new Date(birthdate) : null,
        countryOriginCode,
        countryResidenceCode,
        gender,
        spokenLanguages: Array.isArray(spokenLanguages)
          ? spokenLanguages
          : undefined,
        experienceLevel,
        recentGameID: recentGameID ? BigInt(recentGameID) : null,
      },
      select: {
        userID: true,
        email: true,
        roleID: true,
        communitySettingID: true,
        onboardingProfileCompleted: true,
        onboardingQuestionnaireCompleted: true,
        onboardingClientCompleted: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
        phoneNumber: true,
        discordID: true,
        platformLanguageID: true,
        birthdate: true,
        countryOriginCode: true,
        countryResidenceCode: true,
        gender: true,
        spokenLanguages: true,
        experienceLevel: true,
        recentGameID: true,
      },
    });

    if (Array.isArray(genreIDs)) {
      await prisma.userGameGenre.deleteMany({ where: { userID } });
      if (genreIDs.length > 0) {
        await prisma.userGameGenre.createMany({
          data: genreIDs.map((genreID) => ({
            userID,
            gameGenreID: Number(genreID),
          })),
          skipDuplicates: true,
        });
      }
    }

    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
});

app.patch("/users/me/email", async (req, res, next) => {
  try {
    const userID = BigInt(req.user.sub);
    const { newEmail, password } = req.body || {};

    if (!newEmail || !password) {
      return res
        .status(400)
        .json({ error: "newEmail and password are required" });
    }

    const normalizedEmail = String(newEmail).trim().toLowerCase();
    if (!normalizedEmail.includes("@")) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const current = await prisma.user.findUnique({
      where: { userID },
      select: { userID: true, email: true, passwordHash: true },
    });
    if (!current) return res.status(404).json({ error: "User not found" });

    const ok = await bcrypt.compare(password, current.passwordHash || "");
    if (!ok) return res.status(401).json({ error: "Current password is incorrect" });

    if (current.email === normalizedEmail) {
      return res.status(400).json({ error: "New email must be different" });
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { userID: true },
    });
    if (existing && existing.userID !== userID) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const updated = await prisma.user.update({
      where: { userID },
      data: {
        email: normalizedEmail,
        isEmailVerified: false,
        emailVerifiedAt: null,
      },
      select: {
        userID: true,
        email: true,
        roleID: true,
        communitySettingID: true,
        onboardingProfileCompleted: true,
        onboardingQuestionnaireCompleted: true,
        onboardingClientCompleted: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
      },
    });

    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
});

app.patch("/users/me/password", async (req, res, next) => {
  try {
    const userID = BigInt(req.user.sub);
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "currentPassword and newPassword are required" });
    }
    if (String(newPassword).length < 8) {
      return res
        .status(400)
        .json({ error: "New password must be at least 8 characters" });
    }

    const current = await prisma.user.findUnique({
      where: { userID },
      select: { userID: true, passwordHash: true },
    });
    if (!current) return res.status(404).json({ error: "User not found" });

    const ok = await bcrypt.compare(
      String(currentPassword),
      current.passwordHash || "",
    );
    if (!ok) return res.status(401).json({ error: "Current password is incorrect" });

    const samePassword = await bcrypt.compare(
      String(newPassword),
      current.passwordHash || "",
    );
    if (samePassword) {
      return res
        .status(400)
        .json({ error: "New password must be different from current password" });
    }

    const passwordHash = await bcrypt.hash(String(newPassword), 10);
    await prisma.user.update({
      where: { userID },
      data: { passwordHash },
      select: { userID: true },
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.post(
  "/users/me/profile-image",
  profileUpload.single("image"),
  async (req, res, next) => {
    try {
      const userID = BigInt(req.user.sub);
      const file = req.file;
      if (!file) return res.status(400).json({ error: "No file uploaded" });
      const profileImageUrl = `/uploads/profiles/${file.filename}`;
      const updated = await prisma.user.update({
        where: { userID },
        data: { profileImageUrl },
        select: {
          userID: true,
          email: true,
          roleID: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
        },
      });
      res.json({ user: updated });
    } catch (err) {
      next(err);
    }
  },
);

app.get("/users/me/login-activity", async (req, res, next) => {
  try {
    const userID = BigInt(req.user.sub);
    const logs = await prisma.userLoginActivity.findMany({
      where: { userID },
      orderBy: { loggedInAt: "desc" },
      take: 20,
      select: {
        userLoginActivityID: true,
        loggedInAt: true,
        ipAddress: true,
        userAgent: true,
      },
    });

    const items = logs.map((log, idx) => ({
      id: log.userLoginActivityID.toString(),
      loggedInAt: log.loggedInAt,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      isCurrent: idx === 0,
    }));

    res.json({ items });
  } catch (err) {
    next(err);
  }
});
app.use(buildQuestionnaireRoutes(prisma));
app.use(buildProjectRoutes(prisma));
app.use(buildCommunityRoutes(prisma));
app.use(buildAdminUserRoutes(prisma));
app.use(buildAdminQuestionnaireRoutes(prisma));

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on ${PORT}`);
});
