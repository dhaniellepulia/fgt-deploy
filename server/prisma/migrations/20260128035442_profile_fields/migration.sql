-- AlterTable
ALTER TABLE "tbl_users" ADD COLUMN     "countryOriginCode" TEXT,
ADD COLUMN     "countryResidenceCode" TEXT,
ADD COLUMN     "experienceLevel" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "recentGameID" BIGINT,
ADD COLUMN     "spokenLanguages" TEXT[];

-- CreateTable
CREATE TABLE "tbl_game_genres" (
    "gameGenreID" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_game_genres_pkey" PRIMARY KEY ("gameGenreID")
);

-- CreateTable
CREATE TABLE "tbl_games" (
    "gameID" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "platforms" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_games_pkey" PRIMARY KEY ("gameID")
);

-- CreateTable
CREATE TABLE "tbl_user_game_genres" (
    "userGameGenreID" BIGSERIAL NOT NULL,
    "userID" BIGINT NOT NULL,
    "gameGenreID" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_user_game_genres_pkey" PRIMARY KEY ("userGameGenreID")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_game_genres_name_key" ON "tbl_game_genres"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_games_name_key" ON "tbl_games"("name");

-- CreateIndex
CREATE UNIQUE INDEX "uq_user_genre" ON "tbl_user_game_genres"("userID", "gameGenreID");

-- AddForeignKey
ALTER TABLE "tbl_users" ADD CONSTRAINT "tbl_users_recentGameID_fkey" FOREIGN KEY ("recentGameID") REFERENCES "tbl_games"("gameID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_user_game_genres" ADD CONSTRAINT "tbl_user_game_genres_userID_fkey" FOREIGN KEY ("userID") REFERENCES "tbl_users"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_user_game_genres" ADD CONSTRAINT "tbl_user_game_genres_gameGenreID_fkey" FOREIGN KEY ("gameGenreID") REFERENCES "tbl_game_genres"("gameGenreID") ON DELETE RESTRICT ON UPDATE CASCADE;
