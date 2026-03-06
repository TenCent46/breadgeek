import { requireTeacher } from "@/lib/auth-helpers";
import { getKitchenSettings } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./client";

export default async function SettingsPage() {
  const { school, session } = await requireTeacher();
  const [settings, schoolSettings] = await Promise.all([
    getKitchenSettings(school.id),
    prisma.schoolSettings.findUnique({ where: { schoolId: school.id } }),
  ]);

  return (
    <SettingsClient
      initialSettings={settings}
      initialSchoolSettings={schoolSettings ? {
        bankName: schoolSettings.bankName,
        branchName: schoolSettings.branchName,
        accountType: schoolSettings.accountType,
        accountNumber: schoolSettings.accountNumber,
        accountHolder: schoolSettings.accountHolder,
        legalSellerName: schoolSettings.legalSellerName,
        legalAddress: schoolSettings.legalAddress,
        legalPhone: schoolSettings.legalPhone,
        legalEmail: schoolSettings.legalEmail,
        legalPrice: schoolSettings.legalPrice,
        legalPaymentTiming: schoolSettings.legalPaymentTiming,
        legalDeliveryTiming: schoolSettings.legalDeliveryTiming,
        legalReturnPolicy: schoolSettings.legalReturnPolicy,
        legalAdditionalFees: schoolSettings.legalAdditionalFees,
        businessName: schoolSettings.businessName,
        businessType: schoolSettings.businessType,
        businessAddress: schoolSettings.businessAddress,
        businessPhone: schoolSettings.businessPhone,
        notifications: schoolSettings.notifications as Record<string, Record<string, boolean>> | null,
      } : null}
      stripeOnboarded={school.stripeOnboarded}
      userName={session.user?.name || ""}
      userEmail={session.user?.email || ""}
    />
  );
}
