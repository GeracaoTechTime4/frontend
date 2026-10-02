import { useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";

export function HomePage() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  async function handleLogout() {
    await authClient.signOut();
    navigate("/login");
  }

  return (
    <main>
      <h1>EscalaÁgil</h1>
      <p>Aplicação de gerenciamento de escalas.</p>
      <p>
        Logado como <strong>{session?.user.name}</strong> ({session?.user.email}) — perfil: {session?.user.role}
      </p>
      <button onClick={handleLogout}>Sair</button>
    </main>
  );
}
