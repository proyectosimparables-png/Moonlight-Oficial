import Perfil from "@/components/home/Profile";
import ProtectedRoute from "@/components/protected-route/Protected-Route";

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
