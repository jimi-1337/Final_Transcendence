-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "intra_username" TEXT NOT NULL,
    "num_wins" INTEGER NOT NULL,
    "num_loss" INTEGER NOT NULL,
    "ladder_level" INTEGER NOT NULL,
    "num_won_tournaments" INTEGER NOT NULL,
    "avatar" TEXT NOT NULL,
    "factory_auth" BOOLEAN NOT NULL DEFAULT false,
    "factory_email" TEXT,
    "auth_code" TEXT,
    "status" TEXT NOT NULL,
    "blocked" INTEGER[],
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "admin_op" BOOLEAN NOT NULL DEFAULT false,
    "owner" BOOLEAN NOT NULL DEFAULT false,
    "country" TEXT NOT NULL,
    "campus" TEXT NOT NULL,
    "time_zone" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "matches" INTEGER[],
    "friends" INTEGER[],
    "messages" INTEGER[],
    "inGame" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" SERIAL NOT NULL,
    "user1" INTEGER NOT NULL,
    "user2" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "password" TEXT,
    "users" INTEGER[],
    "admin" INTEGER[],
    "messages" INTEGER[],
    "banned" INTEGER[],
    "owner" INTEGER NOT NULL,
    "muted" INTEGER[],
    "release" INTEGER[],

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "player1" INTEGER NOT NULL,
    "player2" INTEGER NOT NULL,
    "winner" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "arena" TEXT NOT NULL,
    "reward" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "title" TEXT,
    "gameId" TEXT NOT NULL,
    "live" BOOLEAN NOT NULL DEFAULT false,
    "random" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messsage" (
    "id" SERIAL NOT NULL,
    "sender" INTEGER NOT NULL,
    "receiver" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "type" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seen" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User.username_unique" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User.intra_username_unique" ON "User"("intra_username");

-- CreateIndex
CREATE UNIQUE INDEX "User.factory_email_unique" ON "User"("factory_email");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship.user1_user2_unique" ON "Friendship"("user1", "user2");

-- CreateIndex
CREATE UNIQUE INDEX "Channel.name_unique" ON "Channel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Match.gameId_unique" ON "Match"("gameId");
