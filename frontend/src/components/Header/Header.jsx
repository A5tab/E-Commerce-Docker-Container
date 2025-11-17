import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CartIcon from '../CartIcon';
import { useDispatch, useSelector } from 'react-redux';
import { cartTabHandler } from '../../features/cart/cartSlice';
import { Search } from 'lucide-react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { logout } from '../../features/auth/authSlice';
import { ToastContainer, toast } from "react-toastify";
const Header = () => {
    const [activeLink, setActiveLink] = useState('Home');
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropDown] = useState(false);
    const [searchProducts, setSearchProducts] = useState([]);

    const cartProducts = useSelector(state => state.cart.cartProducts);
    const cartTabClicked = useSelector(state => state.cart.cartTabClicked);
    const [totalCartProducts, setTotalCartProducts] = useState(0);

    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

    const axios = useAxiosPrivate();
    const dispatch = useDispatch();

    const navLinks = ['Home', 'About', 'Contact'];

    const handleCartTab = () => {
        dispatch(cartTabHandler(cartTabClicked));
    };

    const handleLogout = async () => {
        const hasLoggedOut = await axios.delete('/user/logout', { withCredentials: true });
        if (hasLoggedOut.status === 200) {
            dispatch(logout());
            toast.success("Logout successful!");
        } else {
            toast.error("Logout not successfull!");
        }
    }

    async function queryDbForProduct() {
        try {
            const response = await axios.get(`/product/search-by-title/${searchQuery}`);
            setSearchProducts([response.data.data] || []);
        } catch (error) {
            setSearchProducts([]);
        }
    }

    useEffect(() => {
        const productSearchTimeout = setTimeout(() => {
            if (searchQuery.trim() !== '') {
                queryDbForProduct();
            } else {
                setSearchProducts([]);
            }
        }, 500);

        return () => clearTimeout(productSearchTimeout);
    }, [searchQuery]);

    useEffect(() => {
        setTotalCartProducts(cartProducts.reduce((acc, product) => acc + product.quantity, 0));
    }, [cartProducts]);

    return (
        <header className="bg-gradient-to-r from-indigo-500 to-purple-400 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                {/* Logo & Nav */}
                <div className='flex items-center space-x-10 w-full md:w-auto justify-between'>
                    {/* Logo with enhanced styling */}
                    <div className="text-2xl font-extrabold tracking-wide relative group">
                        <Link to="/" className="flex items-center">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-500 group-hover:from-yellow-300 group-hover:to-amber-400 transition-all duration-300">
                                Tech Hive Test
                            </span>
                        </Link>
                    </div>

                    {/* Navigation with enhanced styling */}
                    <nav className="hidden md:flex space-x-6 text-sm font-semibold">
                        {navLinks.map((navLink, index) => (
                            <Link
                                to={`/${navLink.toLowerCase()}`}
                                key={index}
                                className={`relative px-2 py-1 transition-all duration-300 
              ${activeLink === navLink
                                        ? 'text-yellow-400 after:w-full'
                                        : 'text-white hover:text-yellow-200 after:hover:w-full'
                                    } 
              after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-yellow-400 after:transition-all after:duration-300`}
                                onClick={() => setActiveLink(navLink)}
                            >
                                {navLink}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Search, Cart & Logout */}
                <div className='flex items-center gap-4 w-full md:w-auto h-12'>
                    {/* Search with enhanced styling */}
                    <div className="relative flex items-center bg-indigo-950/50 rounded-full border border-indigo-700 focus-within:border-yellow-400 flex-grow md:flex-grow-0 w-full md:w-72 transition-all duration-300 focus-within:ring-2 focus-within:ring-yellow-400/30">
                        <label htmlFor="searchProducts" className="absolute left-3 text-indigo-400">
                            <Search className="w-5 h-5" />
                        </label>
                        <input
                            id="searchProducts"
                            type="search"
                            placeholder="Search Products"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setShowDropDown(true)}
                            onBlur={() => setTimeout(() => setShowDropDown(false), 200)}
                            className="w-full py-2 pl-10 pr-4 rounded-full bg-transparent text-white placeholder:text-indigo-300 focus:outline-none"
                        />
                        {showDropdown && (
                            <div className='absolute top-full bg-indigo-950 w-full max-h-96 mt-2 border border-indigo-700 rounded-xl shadow-xl z-50 overflow-y-auto'>
                                {searchProducts.length > 0 ? (
                                    searchProducts.map(product => (
                                        <Link to={`/product/${product._id}`} key={product._id}>
                                            <div className='flex items-center px-4 py-3 hover:bg-indigo-900 transition'>
                                                <div className="w-10 h-10 bg-indigo-100 rounded-md overflow-hidden flex items-center justify-center">
                                                    <img src={product.mainImage || "/placeholder.svg"} alt={product.title} className='w-8 h-8 object-contain mix-blend-multiply' />
                                                </div>
                                                <h1 className='ml-4 text-white text-sm font-medium'>{product.title}</h1>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <p className='px-4 py-3 text-indigo-300 text-sm'>No Products Found</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Cart with enhanced styling */}
                    <div
                        className="relative cursor-pointer group"
                        onClick={handleCartTab}
                    >
                        <div className="relative w-10 h-10 flex items-center justify-center bg-indigo-800 hover:bg-indigo-700 rounded-full transition-all duration-300 group-hover:shadow-lg group-hover:shadow-yellow-400/20">
                            <CartIcon className="text-yellow-400 w-5 h-5" />
                            <span className="absolute -top-1 -right-1 bg-yellow-400 text-indigo-900 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md border border-indigo-900/10 group-hover:scale-110 transition-transform duration-300">
                                {totalCartProducts}
                            </span>
                        </div>
                    </div>

                    {/* Logout with enhanced styling */}
                    {isLoggedIn ? (
                        <button
                            className="flex items-center gap-2 bg-indigo-800 hover:bg-indigo-700 text-white px-4 py-3 rounded-3xl transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/20 text-sm font-medium"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    ) :
                        (< Link to={'/login'}>
                            <button
                                className="flex items-center gap-2 bg-indigo-800 hover:bg-indigo-700 text-white px-4 py-3 rounded-3xl transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/20 text-sm font-medium"
                            >
                                Login
                            </button>
                        </Link>
                        )}
                </div>
            </div>

            {/* Mobile Navigation Menu - Shown only on mobile */}
            <div className="md:hidden border-t border-indigo-800 overflow-x-auto scrollbar-hide">
                <div className="flex space-x-4 px-4 py-2 min-w-max">
                    {navLinks.map((navLink, index) => (
                        <Link
                            to={`/${navLink.toLowerCase()}`}
                            key={index}
                            className={`whitespace-nowrap px-3 py-1 rounded-full transition-all duration-300 text-sm font-medium
            ${activeLink === navLink
                                    ? 'bg-yellow-400 text-indigo-900'
                                    : 'text-white hover:bg-indigo-800'
                                }`}
                            onClick={() => setActiveLink(navLink)}
                        >
                            {navLink}
                        </Link>
                    ))}
                </div>
            </div>
            <ToastContainer />
        </header >
    );
};

export default Header;
