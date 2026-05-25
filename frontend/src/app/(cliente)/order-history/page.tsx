import HistorialCompras from "@/componentes/home/HistorialCompras";
import ProtectedRoute from "@/componentes/protected-route/ProtectedRoute";

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
