-- CreateTable
CREATE TABLE "idea_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "idea_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idea_types_userId_idx" ON "idea_types"("userId");

-- AddForeignKey
ALTER TABLE "idea_types" ADD CONSTRAINT "idea_types_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
