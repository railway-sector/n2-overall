import { useState, use } from "react";
import "../index.css";
import "@esri/calcite-components/components/calcite-segmented-control";
import "@esri/calcite-components/components/calcite-segmented-control-item";
import { MyContext } from "../contexts/MyContext";
import { contractPackage } from "../uniqueValues";

export default function StationSegmentedList() {
  const { updateContractPackage } = use(MyContext);
  const [contractPackageSelected, setContractPackageSelected] = useState<any>(
    contractPackage[0],
  );

  return (
    <>
      <calcite-segmented-control
        oncalciteSegmentedControlChange={(event: any) => {
          setContractPackageSelected(event.target.selectedItem.id);
          updateContractPackage(event.target.selectedItem.id);
        }}
        scale="m"
        width="full"
        style={{
          // width: "600px",
          marginRight: "40px",
          // marginTop: "auto",
          marginBottom: "auto",
        }}
      >
        {contractPackageSelected &&
          contractPackage.map((contractp: any, index: any) => {
            return (
              <calcite-segmented-control-item
                {...(contractPackageSelected === contractp
                  ? { checked: true }
                  : {})}
                key={index}
                value={contractp}
                id={contractp}
              >
                {contractp}
              </calcite-segmented-control-item>
            );
          })}
      </calcite-segmented-control>
    </>
  );
}
