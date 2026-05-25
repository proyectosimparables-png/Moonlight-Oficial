import ComentarSection from "@/componentes/comentarios/Comentar";
import ProtectedRoute from "@/componentes/protected-route/ProtectedRoute";

const ComentarPage = () => {
  return (
    <>
      <ProtectedRoute>
        <ComentarSection />
      </ProtectedRoute>
    </>
  );
};

export default ComentarPage;
