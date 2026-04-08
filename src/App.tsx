import { useState, useEffect } from "react";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import IdentityManager from "@arcgis/core/identity/IdentityManager";
import Portal from "@arcgis/core/portal/Portal";
import { MyContext } from "./contexts/MyContext";
import MapDisplay from "./components/MapDisplay";
import ActionPanel from "./components/ActionPanel";
import Header from "./components/Header";
import MainChart from "./components/MainChart";
import { contractPackage } from "./uniqueValues";
import UndergroundSwitch from "./components/UndergroundSwitch";

export function App(): React.JSX.Element {
  const [loggedInState, setLoggedInState] = useState<boolean>(false);
  useEffect(() => {
    // Useful video: https://www.google.com/search?sca_esv=41638d9270b90df6&rlz=1C1CHBF_enPH1083PH1083&udm=7&fbs=AIIjpHxU7SXXniUZfeShr2fp4giZud1z6kQpMfoEdCJxnpm_3W-pLdZZVzNY_L9_ftx08kwv-_tUbRt8pOUS8_MjaceHuSAD6YvWZ0rfFzwmtmaBgLepZn2IJkVH-w3cPU5sPVz9l1Pp06apNShUnFfpGUJOF8p91U6HxH3ukND0OVTTVy0CGuHNdViLZqynGb0mLSRGeGVO46qnJ_2yk3F0uV6R6BW9rQ&q=apply+user+authentication+using+arcgis+maps+sdk+for+javascript+for+arcgis+enterprise&sa=X&ved=2ahUKEwjVqZbdlLKQAxUtmq8BHVQQCHcQtKgLegQIGRAB&biw=1920&bih=911&dpr=1#fpstate=ive&vld=cid:fcf356be,vid:hQH9d1vc8Gc,st:0
    // check app authentication: https://developers.arcgis.com/documentation/security-and-authentication/app-authentication/how-to-implement-app-authentication/
    const info = new OAuthInfo({
      appId: "mrnZvYTJlFwv0v1n",
      popup: false,
      portalUrl: "https://gis.railway-sector.com/portal",
    });

    IdentityManager.registerOAuthInfos([info]);
    async function loginAndLoadPortal() {
      try {
        await IdentityManager.checkSignInStatus(info.portalUrl + "/sharing");
        const portal: any = new Portal({
          // access: "public",
          url: info.portalUrl,
          authMode: "no-prompt",
        });
        portal.load().then(() => {
          setLoggedInState(true);
          console.log("Logged in as: ", portal.user.username);
        });
      } catch (error) {
        console.error("Authentication error:", error);
        IdentityManager.getCredential(info.portalUrl);
      }
    }
    loginAndLoadPortal();
  }, []);

  const [contractpackages, setContractpackages] = useState<any>(
    contractPackage[0],
  );
  const [statusdatefield, setStatusdatefield] = useState<any>();
  const [datefields, setDatefields] = useState<any>();
  const [timesliderstate, setTimesliderstate] = useState<boolean>(false);
  const [asofdate, setAsofdate] = useState<any>();
  const [latestasofdate, setLatestasofdate] = useState<any>();
  const [handedoverDatefield, setHandedoverDatefield] = useState<any>();
  const [handedoverAreafield, setHandedoverAreafield] = useState<any>();
  const [newAffectedAreafield, setNewAffectedAreafield] = useState<any>();
  const [chartPanelwidth, setChartPanelwidth] = useState<any>();
  const [newHandedOverfield, setNewHandedOverfield] = useState<any>();
  const [utilityLinestats, setUtilityLinestats] = useState<any>();

  const updateContractPackage = (newContractpackage: any) => {
    setContractpackages(newContractpackage);
  };

  const updateStatusdatefield = (newStatusfield: any) => {
    setStatusdatefield(newStatusfield);
  };

  const updateDatefields = (newDateFields: any) => {
    setDatefields(newDateFields);
  };

  const updateTimesliderstate = (newState: any) => {
    setTimesliderstate(newState);
  };

  const updateAsofdate = (newAsofdate: any) => {
    setAsofdate(newAsofdate);
  };

  const updateLatestasofdate = (newAsofdate: any) => {
    setLatestasofdate(newAsofdate);
  };

  const updateHandedoverDatefield = (newDatefield: any) => {
    setHandedoverDatefield(newDatefield);
  };

  const updateHandedoverAreafield = (newAreafield: any) => {
    setHandedoverAreafield(newAreafield);
  };

  const updateNewAffectedAreafield = (newAreafield: any) => {
    setNewAffectedAreafield(newAreafield);
  };

  const updateChartPanelwidth = (newWidth: any) => {
    setChartPanelwidth(newWidth);
  };

  const updateNewHandedOverfield = (newHandedOverfield: any) => {
    setNewHandedOverfield(newHandedOverfield);
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
              contractpackages,
              statusdatefield,
              datefields,
              timesliderstate,
              asofdate,
              latestasofdate,
              handedoverDatefield,
              handedoverAreafield,
              newAffectedAreafield,
              chartPanelwidth,
              newHandedOverfield,
              utilityLinestats,
              updateContractPackage,
              updateStatusdatefield,
              updateDatefields,
              updateTimesliderstate,
              updateAsofdate,
              updateLatestasofdate,
              updateHandedoverDatefield,
              updateHandedoverAreafield,
              updateNewAffectedAreafield,
              updateChartPanelwidth,
              updateNewHandedOverfield,
              updateUtilityLinestats,
            }}
          >
            <UndergroundSwitch />
            <MainChart />
            <ActionPanel />
            <MapDisplay />

            <Header />
          </MyContext>
        </calcite-shell>
      )}
    </>
  );
}
