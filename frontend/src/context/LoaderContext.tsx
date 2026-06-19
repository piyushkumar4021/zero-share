import React, { createContext, useState, useContext } from 'react';

export const LoaderContext = createContext(null);

export const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      {loading && (
       <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* The Spinner */}
        <div 
          className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" 
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
        
        {/* Optional text */}
        <p className="text-sm font-medium text-white">Please wait...</p>
      </div>
    </div>
      )}
    </LoaderContext.Provider>
  );
};
