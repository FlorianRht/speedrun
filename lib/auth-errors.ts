export function authErrorMessage(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Email ou mot de passe incorrect.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Confirme ton email avant de te connecter.";
  }
  if (normalized.includes("user already registered")) {
    return "Un compte existe déjà avec cet email.";
  }
  if (normalized.includes("password should be at least")) {
    return "Le mot de passe doit contenir au moins 6 caractères.";
  }
  if (normalized.includes("unable to validate email")) {
    return "Adresse email invalide.";
  }
  if (normalized.includes("signup is disabled")) {
    return "Les inscriptions sont désactivées pour le moment.";
  }
  if (normalized.includes("rate limit") || normalized.includes("email rate limit")) {
    return "Trop de mails envoyés récemment. Réessaie dans une heure, ou désactive la confirmation email dans Supabase.";
  }

  return message;
}
