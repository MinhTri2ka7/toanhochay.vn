import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CoursesPage from './pages/CoursesPage'
import BooksPage from './pages/BooksPage'
import ExamsPage from './pages/ExamsPage'
import ExamTakingPage from './pages/ExamTakingPage'
import DocumentsPage from './pages/DocumentsPage'
import AboutPage from './pages/AboutPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ActivatePage from './pages/ActivatePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCourses from './pages/admin/AdminCourses'
import AdminBooks from './pages/admin/AdminBooks'
import AdminOrders from './pages/admin/AdminOrders'
import AdminUsers from './pages/admin/AdminUsers'
import AdminExams from './pages/admin/AdminExams'
import AdminFeedbacks from './pages/admin/AdminFeedbacks'
import AdminTransactions from './pages/admin/AdminTransactions'
import AdminExamResults from './pages/admin/AdminExamResults'
import AdminDocuments from './pages/admin/AdminDocuments'
import AdminSettings from './pages/admin/AdminSettings'
import AdminSections from './pages/admin/AdminSections'
import './index.css'

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`} replace />
  return children
}

// Admin route wrapper
function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!user || (user.role !== 'admin' && user.role !== 'staff')) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public routes with main layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/khoa-hoc" element={<CoursesPage />} />
              <Route path="/sach" element={<BooksPage />} />
              <Route path="/de-thi" element={<ExamsPage />} />
              <Route path="/de-thi/:id" element={<ExamTakingPage />} />
              <Route path="/tai-lieu" element={<DocumentsPage />} />
              <Route path="/gioi-thieu" element={<AboutPage />} />
              <Route path="/gio-hang" element={<CartPage />} />
              <Route path="/kich-hoat" element={<ActivatePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              {/* Legacy auth routes */}
              <Route path="/auth/login" element={<Navigate to="/login" replace />} />
              <Route path="/auth/signup" element={<Navigate to="/register" replace />} />
              {/* Protected routes */}
              <Route path="/checkout" element={<CheckoutPage />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="sections" element={<AdminSections />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="books" element={<AdminBooks />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="exams" element={<AdminExams />} />
              <Route path="feedbacks" element={<AdminFeedbacks />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="exam-results" element={<AdminExamResults />} />
              <Route path="documents" element={<AdminDocuments />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
