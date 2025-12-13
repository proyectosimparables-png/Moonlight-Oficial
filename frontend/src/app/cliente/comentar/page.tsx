import ComentarSection from "@/components/Comentar";
import ProtectedRoute from "@/components/ProtectedRoute";

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