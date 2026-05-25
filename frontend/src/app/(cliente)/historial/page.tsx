import HistorialCompras from "@/components/home/Order-History";
import ProtectedRoute from "@/components/protected-route/Protected-Route";

const HistorialPage = () => {
  return (
    <>
      <ProtectedRoute>
        <HistorialCompras />
      </ProtectedRoute>
    </>
  );
};

export default HistorialPage;
