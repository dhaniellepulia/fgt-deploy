const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();
const { requireAuth } = require("./middleware/auth");
const { buildQuestionnaireRoutes } = require("./routes/questionnaires");
const { buildProjectRoutes } = require("./routes/projects");
const { buildAdminUserRoutes } = require("./routes/admin/adminUsers");
const {
  buildAdminQuestionnaireRoutes,
} = require("./routes/admin/adminQuestionnaires");

const app = express();
const prisma = new PrismaClient();

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

const FRONTEND_URL = (
  process.env.FRONTEND_URL || "http://localhost:5173"
).replace(/\/+$/, "");

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow non-browser or same-origin requests (e.g. curl, server)
    cb(null, origin === FRONTEND_URL);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // enable preflight for all routes
app.use(express.json());

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
  const { email, password, roleID } = req.body;
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
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

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
      firstName: true,
      lastName: true,
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

    const updated = await prisma.user.update({
      where: { userID },
      data: {
        onboardingProfileCompleted,
        onboardingQuestionnaireCompleted,
        onboardingClientCompleted,
      },
      select: {
        userID: true,
        email: true,
        roleID: true,
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
app.use(buildQuestionnaireRoutes(prisma));
app.use(buildProjectRoutes(prisma));
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
