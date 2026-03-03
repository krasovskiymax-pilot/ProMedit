import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;

  if (session?.user) {
    redirect(callbackUrl || "/dashboard");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: "1.5rem" }}>ProMedit</h1>
      <form
        action={async () => {
          "use server";
          await signIn("google", {
            callbackUrl: callbackUrl || "/dashboard",
          });
        }}
      >
        <button
          type="submit"
          style={{
            padding: "12px 24px",
            fontSize: 16,
            cursor: "pointer",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "#fff",
          }}
        >
          Войти через Google
        </button>
      </form>
    </main>
  );
}
