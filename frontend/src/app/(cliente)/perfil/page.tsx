import Perfil from "@/components/home/Perfil";
import ProtectedRoute from "@/components/ProtectedRoute";

const UserProfile = () => { 
    return (
    <>
      <ProtectedRoute>
      <Perfil/>
      </ProtectedRoute>
    
    </>
    )
}
export default UserProfile;