-- CreateTable
CREATE TABLE "tbl_user_login_activities" (
    "userLoginActivityID" BIGSERIAL NOT NULL,
    "userID" BIGINT NOT NULL,
    "loggedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_user_login_activities_pkey" PRIMARY KEY ("userLoginActivityID")
);

-- CreateIndex
CREATE INDEX "idx_login_activity_user_logged" ON "tbl_user_login_activities"("userID", "loggedInAt");

-- AddForeignKey
ALTER TABLE "tbl_user_login_activities" ADD CONSTRAINT "tbl_user_login_activities_userID_fkey" FOREIGN KEY ("userID") REFERENCES "tbl_users"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;
