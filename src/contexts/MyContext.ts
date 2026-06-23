import { createContext } from "react";

type MyDropdownContextType = {
  cpackage: any;
  utilityLinestats: any;
  updateCpackage: any;
  updateUtilityLinestats: any;
};

const initialState = {
  cpackage: undefined,
  utilityLinestats: undefined,
  updateCpackage: undefined,
  updateUtilityLinestats: undefined,
};

export const MyContext = createContext<MyDropdownContextType>({
  ...initialState,
});
