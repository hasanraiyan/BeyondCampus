-- CreateEnum
CREATE TYPE "TwinStatus" AS ENUM ('TRAINING', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "TwinSessionType" AS ENUM ('trainer', 'chat');

-- CreateEnum
CREATE TYPE "TwinSessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ERROR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "nickname" TEXT,
    "currentEducation" TEXT,
    "targetCountries" TEXT[],
    "studyTimeline" TEXT,
    "preferredCourse" TEXT,
    "budget" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Twin" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "twin_name" TEXT NOT NULL,
    "tagline" TEXT,
    "personality" TEXT,
    "tone" TEXT,
    "links" JSONB NOT NULL DEFAULT '[]',
    "status" "TwinStatus" NOT NULL DEFAULT 'TRAINING',
    "public_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "Twin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwinSession" (
    "id" TEXT NOT NULL,
    "twin_id" TEXT NOT NULL,
    "user_id" TEXT,
    "type" "TwinSessionType" NOT NULL,
    "notebook_id" TEXT,
    "chapter_id" TEXT,
    "thread_id" TEXT,
    "status" "TwinSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "TwinSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Twin_public_url_key" ON "Twin"("public_url");

-- CreateIndex
CREATE INDEX "TwinSession_twin_id_created_at_idx" ON "TwinSession"("twin_id", "created_at");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwinSession" ADD CONSTRAINT "TwinSession_twin_id_fkey" FOREIGN KEY ("twin_id") REFERENCES "Twin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
