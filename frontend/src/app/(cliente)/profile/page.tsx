import Perfil from "@/componentes/home/Perfil";
import ProtectedRoute from "@/componentes/protected-route/ProtectedRoute";

const UserProfile = () => {
  return (
    <>
      <ProtectedRoute>
        <Perfil />
      </ProtectedRoute>
    </>
  );
};
export default UserProfile;
