import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import CartDetails from "./components/CartDetails";
import { useSelector } from "react-redux";
import { ProductsProvider } from "./context/ProductsProvider";
function Layout() {
    const cartTabClicked = useSelector((state) => state.cart.cartTabClicked);
    const location = useLocation();
    const isAdmin = location.pathname;
    return (
        <div className="relative flex transition-all duration-300">
            {/* Main Content */}
            <main
                className={`flex-1 transition-all duration-400 ${cartTabClicked ? "mr-80" : "mr-0"
                    }`}
            >
                {
                    isAdmin === '/admin' ? (
                        <Outlet />
                    ) : (
                        <div>
                            <Header />
                            <Outlet />
                            <Footer />
                        </div>
                    )

                }
            </main>

            {/* Cart Details (Slide-in from Right) */}
            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transition-transform duration-300 ease-in-out ${cartTabClicked ? "translate-x-0" : "translate-x-full"
                    }`}
            >

                <ProductsProvider>
                    <CartDetails />
                </ProductsProvider>

            </div>
        </div>
    );
}

export default Layout;
