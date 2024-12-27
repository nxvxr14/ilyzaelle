import { Link } from "react-router-dom";

function DashboardView() {
    return (
        <>
            <h1 className='text-5xl font-black'>mis proyectos</h1>
            <p className='text-1xl font-light text-gray-500 mt-5'>maneja y administra tus proyectos</p>

            <nav className="my-5">
                <Link className='bg-black hover:bg-[#FFFF44] text-white hover:text-black px-10 py-3 text-xl font-bold cursor-pointer transition-colors rounded-md'
                    to='/projects/create'
                >
                    nuevo proyecto
                </Link>
            </nav>

        </>
    );
}

export default DashboardView;   