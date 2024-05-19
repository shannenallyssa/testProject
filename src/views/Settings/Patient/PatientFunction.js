import React, { useEffect, useState } from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";

import PatientHandler from "./handler/PatientHandler";
import { connect } from "react-redux";
import ActionsFunction from "components/Actions/ActionsFunction";
import { ACTION_STATUSES } from "utils/constants";
import { Button, Grid } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";

import HospiceTable from "components/Table/HospiceTable";
import { ImportExport } from "@material-ui/icons";
import Helper from "utils/helper";
import * as FileSaver from "file-saver";

import PatientForm from "./components/PatientForm";
import { attemptToUpdatePatient } from "store/actions/patientAction";
import TOAST from "modules/toastManager";
import { patientListStateSelector } from "store/selectors/patientSelector";
import { patientCreateStateSelector } from "store/selectors/patientSelector";
import { patientUpdateStateSelector } from "store/selectors/patientSelector";
import { patientDeleteStateSelector } from "store/selectors/patientSelector";
import { attemptToFetchPatient } from "store/actions/patientAction";
import { resetFetchPatientState } from "store/actions/patientAction";
import { attemptToCreatePatient } from "store/actions/patientAction";
import { resetCreatePatientState } from "store/actions/patientAction";
import { resetUpdatePatientState } from "store/actions/patientAction";
import { attemptToDeletePatient } from "store/actions/patientAction";
import { resetDeletePatientState } from "store/actions/patientAction";
import FilterTable from "components/Table/FilterTable";
import { profileListStateSelector } from "store/selectors/profileSelector";
const styles = {
  cardCategoryWhite: {
    "&,& a,& a:hover,& a:focus": {
      color: "rgba(255,255,255,.62)",
      margin: "0",
      fontSize: "14px",
      marginTop: "0",
      marginBottom: "0",
    },
    "& a,& a:hover,& a:focus": {
      color: "#FFFFFF",
    },
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: "#777",
      fontSize: "65%",
      fontWeight: "400",
      lineHeight: "1",
    },
  },
};

const useStyles = makeStyles(styles);
let productList = [];
let grandTotal = 0.0;
let originalSource = undefined;
let locationList = [];
let userProfile = {};

function PatientFunction(props) {
  const classes = useStyles();

  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState(PatientHandler.columns(true));
  const [isPatientsCollection, setIsPatientsCollection] = useState(true);
  const [isCreatePatientCollection, setIsCreatePatientCollection] = useState(
    true
  );
  const [isUpdatePatientCollection, setIsUpdatePatientCollection] = useState(
    true
  );
  const [isDeletePatientCollection, setIsDeletePatientCollection] = useState(
    true
  );
  const [isFormModal, setIsFormModal] = useState(false);
  const [item, setItem] = useState(undefined);
  const [mode, setMode] = useState("create");
  const [isAddGroupButtons, setIsAddGroupButtons] = useState(false);

  const createFormHandler = (data, mode) => {
    setItem(data);
    setMode(mode || "create");
    setIsFormModal(true);
  };
  const closeFormModalHandler = () => {
    setIsFormModal(false);
  };

  useEffect(() => {
    if (
      !isPatientsCollection &&
      props.patients &&
      props.patients.status === ACTION_STATUSES.SUCCEED
    ) {
      props.resetListPatients();
      setIsPatientsCollection(true);
    }

    if (
      !isCreatePatientCollection &&
      props.createPatientState &&
      props.createPatientState.status === ACTION_STATUSES.SUCCEED
    ) {
      props.resetCreatePatient();

      setIsCreatePatientCollection(true);
    }
    if (
      !isUpdatePatientCollection &&
      props.updatePatientState &&
      props.updatePatientState.status === ACTION_STATUSES.SUCCEED
    ) {
      props.resetUpdatePatient();

      setIsUpdatePatientCollection(true);
    }
    if (
      !isDeletePatientCollection &&
      props.deletePatientState &&
      props.deletePatientState.status === ACTION_STATUSES.SUCCEED
    ) {
      console.log("[change me to true]");
      props.resetDeletePatient();
      setIsDeletePatientCollection(true);
    }
  }, [
    isDeletePatientCollection,
    isUpdatePatientCollection,
    isCreatePatientCollection,
    isPatientsCollection,
  ]);
  useEffect(() => {
    console.log("list Patients", props.profileState);
    if (
      props.profileState &&
      props.profileState.data &&
      props.profileState.data.length
    ) {
      userProfile = props.profileState.data[0];
      props.listPatients({ companyId: userProfile.companyId });
    }
  }, []);

  if (
    isPatientsCollection &&
    props.patients &&
    props.patients.status === ACTION_STATUSES.SUCCEED
  ) {
    grandTotal = 0.0;
    let source = props.patients.data;
    if (source && source.length) {
      source = PatientHandler.mapData(source, productList);
    }

    const cols = PatientHandler.columns(true).map((col, index) => {
      if (col.name === "actions") {
        return {
          ...col,
          editable: () => false,
          render: (cellProps) => (
            <ActionsFunction
              deleteRecordItemHandler={deleteRecordItemHandler}
              createFormHandler={createFormHandler}
              data={{ ...cellProps.data }}
            />
          ),
        };
      } else {
        return {
          ...col,
          editable: () => false,
        };
      }
    });
    setColumns(cols);
    originalSource = [...source];

    setDataSource(source);
    setIsPatientsCollection(false);
  }
  const deleteRecordItemHandler = (id) => {
    console.log("[delete Patient id]", id);
    props.deletePatient(id);
  };
  const createPatientHandler = (payload, mode) => {
    console.log("[Create Patient Handler]", payload, mode, userProfile);
    const params = {
      fn: payload.fn,
      patientCd: payload.patientCd,
      ln: payload.ln,
      name: `${payload.fn} ${payload.ln}`,
      companyId: userProfile.companyId,
      updatedUser: {
        name: userProfile.name,
        userId: userProfile.id,
        date: new Date(),
      },
    };

    if (mode === "create") {
      params.createdUser = {
        name: userProfile.name,
        userId: userProfile.companyId,
        date: new Date(),
      };
      props.createPatient(params);
    } else if (mode === "edit") {
      params.id = payload.id;
      props.updatePatient(params);
    }
    closeFormModalHandler();
  };
  console.log("[Is Create Patient Collection]", props.createPatientState);
  if (
    isCreatePatientCollection &&
    props.createPatientState &&
    props.createPatientState.status === ACTION_STATUSES.SUCCEED
  ) {
    setIsCreatePatientCollection(false);
    TOAST.ok("Patient successfully created.");
    props.listPatients({ companyId: userProfile.companyId });
  }
  if (
    isUpdatePatientCollection &&
    props.updatePatientState &&
    props.updatePatientState.status === ACTION_STATUSES.SUCCEED
  ) {
    TOAST.ok("Patient successfully updated.");
    setIsUpdatePatientCollection(false);
    props.listPatients({ companyId: userProfile.companyId });
  }
  console.log(
    "[isDeletePatient]",
    isDeletePatientCollection,
    props.deletePatientState
  );
  if (
    isDeletePatientCollection &&
    props.deletePatientState &&
    props.deletePatientState.status === ACTION_STATUSES.SUCCEED
  ) {
    TOAST.ok("Patient successfully deleted.");
    setIsDeletePatientCollection(false);

    props.listPatients({ companyId: userProfile.companyId });
  }

  const filterRecordHandler = (keyword) => {
    console.log("[Keyword]", keyword);
    if (!keyword) {
      setDataSource([...originalSource]);
    } else {
      const temp = [...originalSource];
      console.log("[Tempt]", temp);
      let found = temp.filter(
        (data) =>
          data.name.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 ||
          (data.address &&
            data.address.toLowerCase().indexOf(keyword.toLowerCase()) !== -1)
      );

      setDataSource(found);
    }
  };

  const onCheckboxSelectionHandler = (data, isAll, itemIsChecked) => {
    console.log("[data ALl]", data, isAll, itemIsChecked);
    let dtSource = [...dataSource];
    if (isAll) {
      dtSource.forEach((item) => {
        item.isChecked = isAll; // reset
      });
    } else if (!isAll && data && data.length > 0) {
      dtSource.forEach((item) => {
        if (item.id.toString() === data[0].toString()) {
          item.isChecked = itemIsChecked;
        }
      });
    } else if (!isAll && Array.isArray(data) && data.length === 0) {
      dtSource.forEach((item) => {
        item.isChecked = isAll; // reset
      });
    }
    setIsAddGroupButtons(dtSource.find((f) => f.isChecked));
    originalSource = [...dtSource];
    setDataSource(dtSource);
  };
  const exportToExcelHandler = () => {
    const excelData = dataSource.filter((r) => r.isChecked);
    const headers = columns;
    const excel = Helper.formatExcelReport(headers, excelData);
    console.log("headers", excel);
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    let fileName = `Patient_list_batch_${new Date().getTime()}`;

    if (excelData && excelData.length) {
      import(/* webpackChunkName: 'json2xls' */ "json2xls")
        .then((json2xls) => {
          // let fileName = fname + '_' + new Date().getTime();
          const xls =
            typeof json2xls === "function"
              ? json2xls(excel)
              : json2xls.default(excel);
          const buffer = Buffer.from(xls, "binary");
          // let buffer = Buffer.from(excelBuffer);
          const data = new Blob([buffer], { type: fileType });
          FileSaver.saveAs(data, fileName + fileExtension);
        })
        .catch((err) => {
          // Handle failure
          console.log(err);
        });
    }
  };

  return (
    <>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="success">
              <Grid container justifyContent="space-between">
                <h4 className={classes.cardTitleWhite}>Patient Setup</h4>
              </Grid>
            </CardHeader>
            <CardBody>
              <Grid
                container
                justifyContent="space-between"
                style={{ paddingBottom: 4 }}
              >
                <div
                  style={{ display: "inline-flex", gap: 10, paddingTop: 10 }}
                >
                  <Button
                    onClick={() => createFormHandler()}
                    variant="contained"
                    style={{
                      border: "solid 1px #2196f3",
                      color: "white",
                      background: "#2196f3",
                      fontFamily: "Roboto",
                      fontSize: "12px",
                      fontWeight: 500,

                      fontStretch: "normal",
                      fontStyle: "normal",
                      lineHeight: 1.71,
                      letterSpacing: "0.4px",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                    component="span"
                    startIcon={<AddIcon />}
                  >
                    ADD Patient
                  </Button>
                  {isAddGroupButtons && (
                    <Button
                      onClick={() => exportToExcelHandler()}
                      variant="outlined"
                      style={{
                        fontFamily: "Roboto",
                        fontSize: "12px",
                        fontWeight: 500,

                        fontStretch: "normal",
                        fontStyle: "normal",
                        lineHeight: 1.71,
                        letterSpacing: "0.4px",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                      component="span"
                      startIcon={<ImportExport />}
                    >
                      {" "}
                      Export Excel{" "}
                    </Button>
                  )}
                </div>
                <div>
                  <FilterTable
                    filterRecordHandler={filterRecordHandler}
                    isNoDate={true}
                    main={false}
                  />
                </div>
              </Grid>
              <HospiceTable
                columns={columns}
                main={true}
                grandTotal={grandTotal}
                dataSource={dataSource}
                height={400}
                onCheckboxSelectionHandler={onCheckboxSelectionHandler}
              />
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>

      {isFormModal && (
        <PatientForm
          locationList={locationList}
          filterRecordHandler={filterRecordHandler}
          productList={productList}
          dataSource={dataSource}
          createPatientHandler={createPatientHandler}
          mode={mode}
          isOpen={isFormModal}
          isEdit={false}
          item={item}
          closeFormModalHandler={closeFormModalHandler}
        />
      )}
    </>
  );
}

const mapStateToProps = (store) => ({
  patients: patientListStateSelector(store),
  createPatientState: patientCreateStateSelector(store),
  updatePatientState: patientUpdateStateSelector(store),
  deletePatientState: patientDeleteStateSelector(store),
  profileState: profileListStateSelector(store),
});

const mapDispatchToProps = (dispatch) => ({
  listPatients: (data) => dispatch(attemptToFetchPatient(data)),
  resetListPatients: () => dispatch(resetFetchPatientState()),
  createPatient: (data) => dispatch(attemptToCreatePatient(data)),
  resetCreatePatient: () => dispatch(resetCreatePatientState()),
  updatePatient: (data) => dispatch(attemptToUpdatePatient(data)),
  resetUpdatePatient: () => dispatch(resetUpdatePatientState()),
  deletePatient: (data) => dispatch(attemptToDeletePatient(data)),
  resetDeletePatient: () => dispatch(resetDeletePatientState()),
});

export default connect(mapStateToProps, mapDispatchToProps)(PatientFunction);
