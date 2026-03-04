import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar user={session.user} />
      <div className="pl-[280px]">
        <DashboardHeader user={session.user} />
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
