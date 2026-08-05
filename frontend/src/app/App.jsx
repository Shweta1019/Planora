import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes'
import { ErrorBoundary } from '../ErrorBoundary'

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </BrowserRouter>
  )
}
