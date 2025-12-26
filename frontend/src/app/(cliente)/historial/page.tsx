import HistorialCompras from "@/components/home/HistorialCompras"
import ProtectedRoute from "@/components/ProtectedRoute"

const HistorialPage = () => {
    return (
        <>
        <ProtectedRoute>
    <HistorialCompras />
    </ProtectedRoute>
        </>
    )
}

export default HistorialPage