/*
  Warnings:

  - You are about to drop the column `role_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'PRODUCT_MANAGER', 'ORDER_MANAGER', 'INVENTORY_MANAGER', 'CUSTOMER_SUPPORT', 'MARKETING_MANAGER', 'FINANCE', 'VENDOR', 'DELIVERY', 'AFFILIATE', 'CUSTOMER', 'GUEST');

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role_id",
ADD COLUMN     "role" "Roles" NOT NULL DEFAULT 'CUSTOMER';

-- DropTable
DROP TABLE "Role";
