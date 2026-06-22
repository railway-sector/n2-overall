import { createContext } from "react";

type MyDropdownContextType = {
  cpackage: any;
  statusdatefield: any;
  superurgenttype: any;
  datefields: any;
  timesliderstate: any;
  asofdate: any;
  latestasofdate: any;
  handedoverDatefield: any;
  handedoverAreafield: any;
  newAffectedAreafield: any;
  chartPanelwidth: any;
  utilityLinestats: any;
  newHandedOverfield: any;
  updateCpackage: any;
  updateStatusdatefield: any;
  updateSuperurgenttype: any;
  updateDatefields: any;
  updateTimesliderstate: any;
  updateAsofdate: any;
  updateLatestasofdate: any;
  updateHandedoverDatefield: any;
  updateHandedoverAreafield: any;
  updateNewAffectedAreafield: any;
  updateChartPanelwidth: any;
  updateNewHandedOverfield: any;
  updateUtilityLinestats: any;
};

const initialState = {
  cpackage: undefined,
  statusdatefield: undefined,
  superurgenttype: undefined,
  datefields: undefined,
  timesliderstate: undefined,
  asofdate: undefined,
  latestasofdate: undefined,
  handedoverDatefield: undefined,
  handedoverAreafield: undefined,
  newAffectedAreafield: undefined,
  chartPanelwidth: undefined,
  newHandedOverfield: undefined,
  utilityLinestats: undefined,
  updateCpackage: undefined,
  updateStatusdatefield: undefined,
  updateSuperurgenttype: undefined,
  updateDatefields: undefined,
  updateTimesliderstate: undefined,
  updateAsofdate: undefined,
  updateLatestasofdate: undefined,
  updateHandedoverDatefield: undefined,
  updateHandedoverAreafield: undefined,
  updateNewAffectedAreafield: undefined,
  updateChartPanelwidth: undefined,
  updateNewHandedOverfield: undefined,
  updateUtilityLinestats: undefined,
};

export const MyContext = createContext<MyDropdownContextType>({
  ...initialState,
});
