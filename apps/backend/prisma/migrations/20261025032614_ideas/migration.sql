-- CreateTable
CREATE TABLE "ideas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "ideaTypeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ideas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ideas_userId_idx" ON "ideas"("userId");

-- CreateIndex
CREATE INDEX "ideas_ideaTypeId_idx" ON "ideas"("ideaTypeId");

-- AddForeignKey
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_ideaTypeId_fkey" FOREIGN KEY ("ideaTypeId") REFERENCES "idea_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
