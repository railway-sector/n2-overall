import ContractPackageDisplay from "./ContractPackageContext";

function Header() {
  return (
    <>
      <header
        slot="header"
        id="headerDiv"
        style={{
          display: "flex",
          height: "70px",
          padding: "0 1rem",
          borderStyle: "solid",
          borderRightWidth: 5,
          borderLeftWidth: 5,
          borderBottomWidth: 5,
          borderTopWidth: 5,
          borderColor: "#555555",
        }}
      >
        <img
          src="https://EijiGorilla.github.io/Symbols/Projec_Logo/DOTr_Logo_v2.png"
          alt="DOTr Logo"
          height={"55px"}
          width={"55px"}
          style={{ marginBottom: "auto", marginTop: "auto" }}
        />
        <b
          style={{
            color: "white",
            marginLeft: "1rem",
            fontSize: "2.6vh",
            marginTop: "auto",
            marginBottom: "auto",
          }}
        >
          N2 Overall Progress
        </b>

        {/* Contract Package Segmented List */}
        <div
          style={{
            marginLeft: "auto",
            marginTop: "auto",
            marginBottom: "auto",
          }}
        >
          <ContractPackageDisplay />
        </div>

        <img
          src="https://EijiGorilla.github.io/Symbols/Projec_Logo/GCR LOGO.png"
          alt="GCR Logo"
          height={"50px"}
          width={"75px"}
          style={{
            marginBottom: "auto",
            marginTop: "auto",
            marginLeft: "0.5rem",
            marginRight: "2rem",
          }}
        />
      </header>
    </>
  );
}

export default Header;
