import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/api/server"); // Redirige a tu API Route
  }, []);

  return null; // No se muestra contenido en esta página
}
