import { useState, useEffect } from "react";
import { MyContext } from "./contexts/MyContext";
import MapDisplay from "./components/MapDisplay";
import ActionPanel from "./components/ActionPanel";
import Header from "./components/Header";
import ChartMain from "./components/ChartMain";
import { contractPackage } from "./uniqueValues";
import UndergroundSwitch from "./components/UndergroundSwitch";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { authenticate } from "./autho";

const queryClient = new QueryClient();

export function App(): React.JSX.Element {
  const [loggedInState, setLoggedInState] = useState<boolean>(false);
  useEffect(() => {
    authenticate(setLoggedInState, "mrnZvYTJlFwv0v1n"); // appId
  }, []);

  const [cpackage, setCpackage] = useState<any>(contractPackage[0]);
  const [utilityLinestats, setUtilityLinestats] = useState<any>();

  const updateCpackage = (newContractpackage: any) => {
    setCpackage(newContractpackage);
  };
  const updateUtilityLinestats = (newStats: any) => {
    setUtilityLinestats(newStats);
  };

  return (
    <>
      {loggedInState && (
        <calcite-shell
          // content-behind
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#888 #555",
            "--calcite-color-background": "#2b2b2b",
          }}
        >
          <MyContext
            value={{
              cpackage,
              utilityLinestats,
              updateCpackage,
              updateUtilityLinestats,
            }}
          >
            <QueryClientProvider client={queryClient}>
              <UndergroundSwitch />
              <ChartMain />
              <ActionPanel />
              <MapDisplay />
              <Header />
            </QueryClientProvider>
          </MyContext>
        </calcite-shell>
      )}
    </>
  );
}
