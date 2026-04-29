import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { PurchaseProvider } from './contexts/PurchaseContext'
import Layout from './components/Layout'
import { prefetchPublicData } from './lib/api'
import './index.css'

// ============================================
// LAZY LOADED PAGES — only download when visited
// ============================================

// Public pages
const HomePage = lazy(() => import('./pages/HomePage'))
const CoursesPage = lazy(() => import('./pages/CoursesPage'))
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'))
const BooksPage = lazy(() => import('./pages/BooksPage'))
const ExamsPage = lazy(() => import('./pages/ExamsPage'))
const ExamTakingPage = lazy(() => import('./pages/ExamTakingPage'))
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const ActivatePage = lazy(() => import('./pages/ActivatePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const LearnPage = lazy(() => import('./pages/LearnPage'))
const MyBooksPage = lazy(() => import('./pages/MyBooksPage'))

// Admin pages — heavy, only loaded for admin users
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminCourses = lazy(() => import('./pages/admin/AdminCourses'))
const AdminBooks = lazy(() => import('./pages/admin/AdminBooks'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminExams = lazy(() => import('./pages/admin/AdminExams'))
const AdminFeedbacks = lazy(() => import('./pages/admin/AdminFeedbacks'))
const AdminTransactions = lazy(() => import('./pages/admin/AdminTransactions'))
const AdminExamResults = lazy(() => import('./pages/admin/AdminExamResults'))
const AdminDocuments = lazy(() => import('./pages/admin/AdminDocuments'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminSections = lazy(() => import('./pages/admin/AdminSections'))
const AdminAbout = lazy(() => import('./pages/admin/AdminAbout'))

// ============================================
// PREFETCH — warm API cache + preload JS chunks after initial render
// so tab switching is instant (no spinner)
// ============================================
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // Warm the API data cache immediately — this is the key to removing delay
    prefetchPublicData()

    // Preload JS chunks after a short delay (lower priority)
    setTimeout(() => {
      import('./pages/CoursesPage')
      import('./pages/CourseDetailPage')
      import('./pages/BooksPage')
      import('./pages/ExamsPage')
      import('./pages/DocumentsPage')
      import('./pages/AboutPage')
      import('./pages/CartPage')
      import('./pages/LoginPage')
      import('./pages/RegisterPage')
      import('./pages/CheckoutPage')
      import('./pages/ActivatePage')
      import('./pages/ExamTakingPage')
    }, 800)
  }, { once: true })
}

// ============================================
// LOADING SPINNER — minimal, quick fade
// ============================================
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
        <span className="text-sm text-gray-400 font-medium">Đang tải...</span>
      </div>
    </div>
  )
}

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`} replace />
  return children
}

// Admin route wrapper
function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user || (user.role !== 'admin' && user.role !== 'staff')) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PurchaseProvider>
        <CartProvider>
          <SettingsProvider>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes with main layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/khoa-hoc" element={<CoursesPage />} />
              <Route path="/khoa-hoc/:slug" element={<CourseDetailPage />} />
              <Route path="/sach" element={<BooksPage />} />
              <Route path="/de-thi" element={<ExamsPage />} />
              <Route path="/de-thi/:id" element={<ExamTakingPage />} />
              <Route path="/tai-lieu" element={<DocumentsPage />} />
              <Route path="/gioi-thieu" element={<AboutPage />} />
              <Route path="/gio-hang" element={<CartPage />} />
              <Route path="/kich-hoat" element={<ActivatePage />} />
              <Route path="/sach-cua-toi" element={<ProtectedRoute><MyBooksPage /></ProtectedRoute>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              {/* Legacy auth routes */}
              <Route path="/auth/login" element={<Navigate to="/login" replace />} />
              <Route path="/auth/signup" element={<Navigate to="/register" replace />} />
              <Route path="/checkout" element={<CheckoutPage />} />
            </Route>

            {/* Learn page — full-screen layout, no header/footer */}
            <Route path="/hoc/:slug" element={<ProtectedRoute><LearnPage /></ProtectedRoute>} />

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
              <Route path="about" element={<AdminAbout />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Catch-all: redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
          </SettingsProvider>
        </CartProvider>
        </PurchaseProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
