import Perfil from "@/components/home/Perfil";
import ProtectedRoute from "@/components/protected-route/ProtectedRoute";

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
