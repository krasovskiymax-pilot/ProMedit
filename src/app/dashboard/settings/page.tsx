import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Настройки</h1>
      <p className="mt-2 text-muted-foreground">
        Настройки приложения (в разработке)
      </p>
      <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <p className="text-muted-foreground">Раздел в разработке</p>
      </div>
    </div>
  );
}
