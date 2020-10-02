import React from 'react';

export const AppStateContext = React.createContext(null);

export default function AppStateProvider({children}) {
  return <AppStateContext.Provider>{children}</AppStateContext.Provider>;
}