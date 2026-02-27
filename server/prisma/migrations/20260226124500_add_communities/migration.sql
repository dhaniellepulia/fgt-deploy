-- CreateTable
CREATE TABLE "tbl_communities" (
    "communityID" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdByClientUserID" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_communities_pkey" PRIMARY KEY ("communityID")
);

-- CreateTable
CREATE TABLE "tbl_community_invite_codes" (
    "communityInviteCodeID" BIGSERIAL NOT NULL,
    "communityID" BIGINT NOT NULL,
    "code" TEXT NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_community_invite_codes_pkey" PRIMARY KEY ("communityInviteCodeID")
);

-- CreateTable
CREATE TABLE "tbl_user_community_memberships" (
    "userCommunityMembershipID" BIGSERIAL NOT NULL,
    "userID" BIGINT NOT NULL,
    "communityID" BIGINT NOT NULL,
    "joinedByCode" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_user_community_memberships_pkey" PRIMARY KEY ("userCommunityMembershipID")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_communities_name_key" ON "tbl_communities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_community_invite_codes_code_key" ON "tbl_community_invite_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "uq_user_community" ON "tbl_user_community_memberships"("userID", "communityID");

-- AddForeignKey
ALTER TABLE "tbl_communities" ADD CONSTRAINT "tbl_communities_createdByClientUserID_fkey" FOREIGN KEY ("createdByClientUserID") REFERENCES "tbl_users"("userID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_community_invite_codes" ADD CONSTRAINT "tbl_community_invite_codes_communityID_fkey" FOREIGN KEY ("communityID") REFERENCES "tbl_communities"("communityID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_user_community_memberships" ADD CONSTRAINT "tbl_user_community_memberships_userID_fkey" FOREIGN KEY ("userID") REFERENCES "tbl_users"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_user_community_memberships" ADD CONSTRAINT "tbl_user_community_memberships_communityID_fkey" FOREIGN KEY ("communityID") REFERENCES "tbl_communities"("communityID") ON DELETE RESTRICT ON UPDATE CASCADE;
