import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
export default function Layout() {
  return <div className="flex min-h-screen flex-col"><Navbar /><main className="flex-1 container mx-auto px-4 py-6 max-w-7xl"><Outlet /></main><Footer /></div>;
}
