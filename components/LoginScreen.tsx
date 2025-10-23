
import React, { useState, useEffect } from 'react';

interface LoginScreenProps {
    onLogin: (email: string, password: string, rememberMe: boolean) => void;
    error: string | null;
}

const Feature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-center gap-3 text-base">
        <svg className="w-6 h-6 text-green-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        <span>{children}</span>
    </li>
);

const PricingTier: React.FC<{ title: string; price: string; highlighted?: boolean; children?: React.ReactNode; }> = ({ title, price, highlighted, children }) => (
    <div className={`relative bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border p-6 rounded-xl shadow-lg flex flex-col text-center h-full ${highlighted ? 'border-2 border-dathouzz-orange' : ''}`}>
        {highlighted && (
            <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-dathouzz-orange text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                Tiết kiệm nhất
            </div>
        )}
        <h3 className={`text-xl font-bold ${highlighted ? 'text-dathouzz-orange' : 'text-gray-900 dark:text-white'}`}>{title}</h3>
        <p className="text-3xl font-extrabold my-4 text-gray-900 dark:text-white">{price}</p>
        <div className="flex-grow">{children}</div>
        <a 
            href="https://zalo.me/0937973791" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`mt-6 w-full block font-bold py-3 px-4 rounded-lg transition-all duration-300 ${highlighted ? 'bg-dathouzz-orange text-white hover:bg-dathouzz-orange-dark' : 'bg-gray-200 dark:bg-[#282828] text-gray-800 dark:text-dark-text hover:bg-gray-300 dark:hover:bg-[#333333]'}`}
        >
            Liên hệ Zalo
        </a>
    </div>
);


export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, error }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);

    useEffect(() => {
        try {
            const rememberedUserString = localStorage.getItem('rememberedUser');
            if (rememberedUserString) {
                const rememberedUser = JSON.parse(rememberedUserString);
                setEmail(rememberedUser.email);
                setPassword(rememberedUser.password);
                setRememberMe(true);
            }
        } catch (e) {
            // Ignore parsing errors
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(email, password, rememberMe);
    };

    return (
        <div className="fixed inset-0 bg-gray-100 dark:bg-dark-bg z-[100] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-6xl text-center">
                 <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center justify-center gap-2">
                    <span>HCDOOR.AI</span>
                    <span className="text-xs font-semibold bg-yellow-400 text-black rounded-full px-2 py-0.5 ml-1 self-start mt-1">PRO</span>
                </h1>
                <p className="mt-4 text-gray-600 dark:text-[#aaaaaa]">Công cụ render kiến trúc siêu thực bằng AI.</p>
                
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                    {/* Column 1: Features */}
                    <div className="text-left text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-dark-surface/50 p-6 rounded-xl h-full flex flex-col">
                        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Tính năng nổi bật</h3>
                        <ul className="space-y-3">
                            <Feature>Render ngoại thất siêu thực</Feature>
                            <Feature>Thiết kế nội thất tức thì</Feature>
                            <Feature>Quy hoạch dự án tổng thể</Feature>
                            <Feature>Chỉnh sửa thông minh với AI</Feature>
                            <Feature>Hoàn thiện nét vẽ SketchUp</Feature>
                            <Feature>Chuyển mặt bằng 2D sang 3D</Feature>
                        </ul>
                    </div>

                    {/* Column 2: Login */}
                    <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border p-6 rounded-xl shadow-lg flex flex-col justify-center">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Đăng nhập tài khoản PRO</h2>
                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="email" className="sr-only">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Nhập email của bạn"
                                    className="w-full bg-gray-100 dark:bg-dark-bg border border-gray-300 dark:border-[#444444] rounded-lg px-4 py-3 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-dathouzz-orange focus:border-dathouzz-orange text-center"
                                    required
                                />
                            </div>
                             <div>
                                <label htmlFor="password" className="sr-only">Mật khẩu</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu của bạn"
                                    className="w-full bg-gray-100 dark:bg-dark-bg border border-gray-300 dark:border-[#444444] rounded-lg px-4 py-3 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-dathouzz-orange focus:border-dathouzz-orange text-center"
                                    required
                                />
                            </div>
                             <div className="flex items-center justify-start">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 accent-dathouzz-orange text-dathouzz-orange focus:ring-dathouzz-orange border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                        Ghi nhớ tài khoản
                                    </label>
                                </div>
                            </div>
                            {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
                            <button
                                type="submit"
                                className="w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 bg-dathouzz-orange text-white hover:bg-dathouzz-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-dark-surface focus:ring-dathouzz-orange disabled:opacity-50"
                            >
                                Đăng nhập
                            </button>
                        </form>
                        <div className="mt-6 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-600/50 rounded-lg text-yellow-800 dark:text-yellow-300 text-sm text-left">
                            <p className="font-bold flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.636-1.21 2.522-1.21 3.158 0l5.48 10.478c.636 1.21-.29 2.748-1.579 2.748H4.356c-1.29 0-2.215-1.539-1.579-2.748L8.257 3.099zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                                <span>Cảnh báo Bảo mật</span>
                            </p>
                            <p className="mt-1 pl-1">
                                Đăng nhập từ hai địa chỉ IP khác nhau cùng lúc sẽ khiến tài khoản bị <strong>khóa vĩnh viễn</strong>. Vui lòng không chia sẻ tài khoản.
                            </p>
                        </div>
                    </div>
                    
                    {/* Column 3: New Pricing Tiers */}
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                        <PricingTier title="Gói 6 Tháng" price="1.800.000đ" />
                        <PricingTier title="Gói 1 Năm" price="3.400.000đ" highlighted={true} />
                    </div>
                </div>
            </div>

            <footer className="absolute bottom-4 text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>
                    COPYRIGHT 2025 <span className="font-bold text-dathouzz-orange">HCDOOR</span><span className="font-bold text-black dark:text-white">.AI</span>, ALL RIGHT RESERVED
                </p>
                <p>Made with ❤️ by HCDOOR</p>
                <p>Zalo: 0937973791</p>
            </footer>
        </div>
    );
};