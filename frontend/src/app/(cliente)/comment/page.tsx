import ComentarSection from "@/components/comments/Review";
import ProtectedRoute from "@/components/protected-route/Protected-Route";

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
