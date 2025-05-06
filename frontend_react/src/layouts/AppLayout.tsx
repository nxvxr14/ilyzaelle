import { Link, Outlet } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Logo from "../components/Logo";
import LogoUNAB from "../components/LogoUNAB";
import NavMenu from "@/components/NavMenu";


function AppLayout() {
    return (
        <>
            <header className="bg-[#FFFF64]">
                <div className='max-w-screen-2xl mx-auto flex flex-col lg:flex-row justify-between items-center px-6'>
                    <div className='w-64 ml-4'>
                        <Link to={'/'} >
                            <Logo />
                        </Link>
                    </div>
                    <div className='w-64 mr-4'>
                        <LogoUNAB />
                    </div>
                </div>
            </header>

            <section className='max-w-screen-2xl mx-auto mt-10 p-5' >
                <Outlet />
            </section>

            <footer className='py-5'>
                <p className='text-center'> UNAB - {new Date().getFullYear()}</p>
            </footer>

            <ToastContainer
            />
        </>
    );
}

export default AppLayout;