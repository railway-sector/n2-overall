import { use } from "react";
import "../index.css";
import "@esri/calcite-components/components/calcite-segmented-control";
import "@esri/calcite-components/components/calcite-segmented-control-item";
import { MyContext } from "../contexts/MyContext";
import { cpackages } from "../uniqueValues";

export default function StationSegmentedList() {
  const { updateCpackage, cpackage } = use(MyContext);
  return (
    <>
      <calcite-segmented-control
        oncalciteSegmentedControlChange={(event: any) => {
          updateCpackage(event.target.selectedItem.id);
        }}
        scale="m"
        width="full"
        style={{ width: "400px", marginRight: "40px", marginBottom: "auto" }}
      >
        {cpackage &&
          cpackages.map((contractp: any, index: any) => {
            return (
              <calcite-segmented-control-item
                {...(cpackage === contractp ? { checked: true } : {})}
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
