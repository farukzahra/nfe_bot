-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PartyType" AS ENUM ('issuer', 'recipient');

-- CreateEnum
CREATE TYPE "DocumentDirection" AS ENUM ('entrada', 'saida');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('autorizada', 'cancelada', 'denegada', 'inutilizada');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('user', 'assistant');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fiscal_documents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_key" TEXT,
    "document_number" TEXT,
    "series" TEXT,
    "model" TEXT,
    "operation_type" TEXT,
    "direction" "DocumentDirection",
    "issue_date" TIMESTAMP(3),
    "total_amount" DECIMAL(15,2),
    "products_amount" DECIMAL(15,2),
    "discount_amount" DECIMAL(15,2),
    "freight_amount" DECIMAL(15,2),
    "tax_amount" DECIMAL(15,2),
    "status" "DocumentStatus",
    "raw_xml" TEXT,
    "source_file_name" TEXT,
    "imported_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fiscal_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fiscal_parties" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "party_type" "PartyType" NOT NULL,
    "document_number" TEXT,
    "legal_name" TEXT,
    "trade_name" TEXT,
    "state_registration" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip_code" TEXT,

    CONSTRAINT "fiscal_parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fiscal_items" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "product_code" TEXT,
    "ean" TEXT,
    "description" TEXT,
    "ncm" TEXT,
    "cfop" TEXT,
    "unit" TEXT,
    "quantity" DECIMAL(15,4),
    "unit_price" DECIMAL(15,4),
    "total_price" DECIMAL(15,2),
    "discount_amount" DECIMAL(15,2),
    "freight_amount" DECIMAL(15,2),
    "tax_amount" DECIMAL(15,2),

    CONSTRAINT "fiscal_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fiscal_taxes" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "item_id" TEXT,
    "tax_type" TEXT,
    "cst" TEXT,
    "csosn" TEXT,
    "base_amount" DECIMAL(15,2),
    "rate" DECIMAL(8,4),
    "tax_amount" DECIMAL(15,2),

    CONSTRAINT "fiscal_taxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_batches" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "total_files" INTEGER NOT NULL DEFAULT 0,
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "imported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "BatchStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_errors" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "error_message" TEXT NOT NULL,
    "raw_content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_errors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_conversations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "fiscal_documents_user_id_idx" ON "fiscal_documents"("user_id");

-- CreateIndex
CREATE INDEX "fiscal_parties_document_id_idx" ON "fiscal_parties"("document_id");

-- CreateIndex
CREATE INDEX "fiscal_items_document_id_idx" ON "fiscal_items"("document_id");

-- CreateIndex
CREATE INDEX "fiscal_taxes_document_id_idx" ON "fiscal_taxes"("document_id");

-- CreateIndex
CREATE INDEX "fiscal_taxes_item_id_idx" ON "fiscal_taxes"("item_id");

-- CreateIndex
CREATE INDEX "import_batches_user_id_idx" ON "import_batches"("user_id");

-- CreateIndex
CREATE INDEX "import_errors_batch_id_idx" ON "import_errors"("batch_id");

-- CreateIndex
CREATE INDEX "chat_conversations_user_id_idx" ON "chat_conversations"("user_id");

-- CreateIndex
CREATE INDEX "chat_messages_conversation_id_idx" ON "chat_messages"("conversation_id");

-- AddForeignKey
ALTER TABLE "fiscal_documents" ADD CONSTRAINT "fiscal_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_parties" ADD CONSTRAINT "fiscal_parties_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "fiscal_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_items" ADD CONSTRAINT "fiscal_items_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "fiscal_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_taxes" ADD CONSTRAINT "fiscal_taxes_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "fiscal_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_taxes" ADD CONSTRAINT "fiscal_taxes_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "fiscal_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_errors" ADD CONSTRAINT "import_errors_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "chat_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

