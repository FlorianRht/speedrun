import { LoginForms } from "@/components/LoginForms";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 overflow-x-hidden max-w-full">
      <LoginForms error={error} message={message} />
    </main>
  );
}
