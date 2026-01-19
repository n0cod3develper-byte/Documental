import React from 'react';
import { Bell, Menu } from 'lucide-react';

const Header = ({ title, breadcrumbs }) => {
    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Title & Breadcrumbs */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    {breadcrumbs && (
                        <nav className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                            {breadcrumbs.map((crumb, index) => (
                                <React.Fragment key={index}>
                                    {index > 0 && <span>/</span>}
                                    <span className={index === breadcrumbs.length - 1 ? 'text-primary-600 font-medium' : ''}>
                                        {crumb}
                                    </span>
                                </React.Fragment>
                            ))}
                        </nav>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition relative">
                        <Bell className="w-5 h-5 text-gray-600" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
