-- CreateTable
CREATE TABLE "tbl_project_memberships" (
    "projectMembershipID" BIGSERIAL NOT NULL,
    "projectID" BIGINT NOT NULL,
    "testerUserID" BIGINT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_project_memberships_pkey" PRIMARY KEY ("projectMembershipID")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_project_tester" ON "tbl_project_memberships"("projectID", "testerUserID");

-- AddForeignKey
ALTER TABLE "tbl_project_memberships" ADD CONSTRAINT "tbl_project_memberships_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "tbl_projects"("projectID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_project_memberships" ADD CONSTRAINT "tbl_project_memberships_testerUserID_fkey" FOREIGN KEY ("testerUserID") REFERENCES "tbl_users"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;
