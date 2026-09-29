import {
  Button,
  Box,
  Typography,
  Card,
  Container,
  Divider,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Modal,
  TextField,
  Checkbox,
  FormControlLabel,
  useMediaQuery
} from '@mui/material'
import { useState, useEffect } from 'react'

import { DoorClosed, Warehouse, Thermometer, Grid2X2, Clock, Wifi, FileText, Settings, Unlock, Shield, Lock } from 'lucide-react'


import { CircularSlider } from 'react-web-circular-slider';


import { OrbitProgress } from "react-loading-indicators";

function App() {





  const btnBase = {
    fontFamily: '"IBM Plex Sans", sans-serif',
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    lineHeight: 1,
    borderRadius: "8px",
    color: "oklch(0.95 0.005 250)",
    border: "1px solid oklch(0.38 0.02 250)",
    backgroundColor: "oklch(0.26 0.01 250)",
    padding: "14px 26px",
    fontSize: 14,

    "&:hover": {
      backgroundColor: "oklch(0.32 0.015 250)",
      boxShadow: "none"
    },
  }


  const smallGray = {
    fontFamily: '"IBM Plex Mono", monospace',
    fontWeight: 400,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "oklch(0.66 0.01 250)",
    mt: 0.3
  }



  const zoneFilters = [
    { value: "all", label: "All zones" },
    { value: "frontdoor", label: "Front Door" },
    { value: "window", label: "Window" },
    { value: "garage", label: "Garage" },
    { value: "temperature", label: "Temperature" },
  ];

  const selectSx = {
    minWidth: 180,
    color: "oklch(0.93 0.005 250)",
    backgroundColor: "oklch(0.25 0.01 250)",
    borderRadius: "7px",
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: 12,
    "& .MuiSelect-select": { padding: "10px 12px" },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "oklch(0.36 0.02 250)" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "oklch(0.46 0.02 250)" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "oklch(0.74 0.11 210)",
      borderWidth: "1px",
    },
    "& .MuiSvgIcon-root": { color: "oklch(0.64 0.01 250)" },
  };

  const menuProps = {
    PaperProps: {
      sx: {
        mt: 0.5,
        backgroundColor: "oklch(0.21 0.008 250)",
        border: "1px solid oklch(0.28 0.01 250)",
        borderRadius: "7px",
        backgroundImage: "none",
        "& .MuiMenuItem-root": {
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 12,
          color: "oklch(0.80 0.01 250)",
          padding: "9px 12px",
          "&:hover": { backgroundColor: "oklch(0.26 0.01 250)" },
          "&.Mui-selected": {
            backgroundColor: "oklch(0.28 0.01 250)",
            color: "oklch(0.95 0.005 250)",
            "&:hover": { backgroundColor: "oklch(0.31 0.015 250)" },
          },
        },
      },
    },
  };

  const [zoneFilter, setZoneFilter] = useState("all")


  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)


  const [editTempModal, setEditTempModal] = useState(false)

  const handleOpenEditModel = () => setEditTempModal(true)

  const handleCloseEditModel = () => {

    setHighTemp("")

    setLowTemp("")
    setEditTempModal(false)
  }


  const [settingsModal, setSettingsModal] = useState(false)

  const handleOpenSettingsModel = () => {
    setSettingsModal(true)
  }

  const handleCloseSettingsModel = () => setSettingsModal(false)

  const [activityLogs, setActivityLogs] = useState([])

  const filteredLogs =
    zoneFilter === "all"
      ? activityLogs
      : activityLogs.filter(log => log.zone === zoneFilter)


  const visibleLogs = filteredLogs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )


  function handleChangePage(event, newPage) {
    setPage(newPage)
  }

  function handleChangeRowsPerPage(event) {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  function handleZoneFilterChange(event) {
    setZoneFilter(event.target.value)
    setPage(0)
  }



  const isMobile = useMediaQuery('(max-width:600px)');

  const [automation, setAutomation] = useState(false);

  const [automationData, setAutomationData] = useState([])

  const [automationLoading, setAutomationLoading] = useState(true)



  const [initialArmTime, setInitialArmTime] = useState("22:30")
  const [initialDisarmTime, setInitialDisarmTime] = useState("07:00")


  const [highTemp, setHighTemp] = useState("")
  const [lowTemp, setLowTemp] = useState("")



  const formatLastMessage = (timestamp) => {
    if (!timestamp) return "Never"

    const secondsAgo = Math.floor(Date.now() / 1000 - timestamp)

    if (secondsAgo < 5) return "Now"
    if (secondsAgo < 60) return `${secondsAgo}s`

    const minutesAgo = Math.floor(secondsAgo / 60)

    if (minutesAgo < 60) return `${minutesAgo}m`

    const hoursAgo = Math.floor(minutesAgo / 60)

    return `${hoursAgo}h`
  }

  const [scheduleStart, setScheduleStart] = useState({
    h: 22,
    m: 30
  });

  const [scheduleEnd, setScheduleEnd] = useState({
    h: 7,
    m: 0
  });

  const handleConfirmSchedule = async () => {
    await updateAutomation();

    handleCloseSettingsModel();
  };


  {/*ENDPOINT FUCNTIONS*/ }


  {/*Garage */ }

  const sendGarageCommand = async (command) => {
    try {
      const response = await fetch(
        '/api/garage/command',
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            command: command
          })
        }
      );

    } catch (error) {
      console.error("Failed to send garage command:", error);
    }
  };


  {/* Door */ }

  const sendDoorCommand = async (command) => {
    try {
      const response = await fetch(
        '/api/frontdoor/command',
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            command: command
          })
        }
      );

    } catch (error) {
      console.error("Failed to send garage command:", error);
    }
  };


  {/* Window */ }

  const sendWindowCommand = async (command) => {
    try {
      const response = await fetch(
        '/api/window/command',
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            command: command
          })
        }
      );

    } catch (error) {
      console.error("Failed to send garage command:", error);
    }
  };


  {/* Temperature */ }

  const sendHighTemp = async () => {
    try {
      const response = await fetch(
        '/api/temperature/command',
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            command: `HIGH ${highTemp}`
          })
        }
      );



    } catch (error) {
      console.error("Failed to send garage command:", error);
    }
  };


  const sendLowTemp = async () => {
    try {
      const response = await fetch(
        '/api/temperature/command',
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            command: `LOW ${lowTemp}`
          })
        }
      );

    } catch (error) {
      console.error("Failed to send garage command:", error);
    }
  };


  const getDeviceStatus = async () => {
    try {
      const response = await fetch("/api/status")
      const data = await response.json()

      console.log("Status data:", data)

      setSecurityPanels(previousPanels =>
        previousPanels.map(panel => {
          if (panel.name === "Garage" && data.garage) {
            return {
              ...panel,
              armed: data.garage.armed,
              status:
                data.garage.status.charAt(0).toUpperCase() +
                data.garage.status.slice(1),
              lastmsg: formatLastMessage(data.garage.last_received)
            }
          }

          if (panel.name === "Front Door" && data.frontdoor) {
            return {
              ...panel,
              armed: data.frontdoor.armed,
              locked: data.frontdoor.locked,
              status:
                data.frontdoor.status.charAt(0).toUpperCase() +
                data.frontdoor.status.slice(1),
              lastmsg: formatLastMessage(data.frontdoor.last_received)
            }
          }

          if (panel.name === "Window" && data.window) {
            return {
              ...panel,
              armed: data.window.armed,
              status:
                data.window.status.charAt(0).toUpperCase() +
                data.window.status.slice(1),
              lastmsg: formatLastMessage(data.window.last_received)
            }
          }

          if (panel.name === "Temperature" && data.temperature) {
            return {
              ...panel,
              status: `${data.temperature.temperature} °C`,
              lastmsg: formatLastMessage(data.temperature.last_received)
            }
          }

          return panel
        })
      )

    } catch (error) {
      console.error("Failed to get device status:", error)
    }
  }


  {/*Get Automation */ }
  const getAutomationData = async () => {
    try {
      setAutomationLoading(true)

      const response = await fetch(
        '/automation'
      )

      const data = await response.json()

      console.log("Automation data:", data)

      setAutomationData(data)

      setAutomation(Boolean(data.arm_automation_on))

      const [armH, armM] = data.arm_time.split(':').map(Number)

      setScheduleStart({
        h: armH,
        m: armM
      })

      setInitialArmTime(
        `${String(armH).padStart(2, '0')}:${String(armM).padStart(2, '0')}`
      )


      const [disarmH, disarmM] = data.disarm_time.split(':').map(Number)

      setScheduleEnd({
        h: disarmH,
        m: disarmM
      })

      setInitialDisarmTime(
        `${String(disarmH).padStart(2, '0')}:${String(disarmM).padStart(2, '0')}`
      )

    } catch (error) {
      console.error("Failed to grab automation data:", error)
    } finally {
      setAutomationLoading(false)
    }
  }

  {/* Update Automation */ }
  const updateAutomation = async () => {
    try {
      setAutomationLoading(true)
      const armTime =
        `${String(scheduleStart.h).padStart(2, '0')}:${String(scheduleStart.m).padStart(2, '0')}:00`;

      const disarmTime =
        `${String(scheduleEnd.h).padStart(2, '0')}:${String(scheduleEnd.m).padStart(2, '0')}:00`;

      const response = await fetch(
        '/automation',
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            armAutomationOn: automation,
            armTime: armTime,
            disarmTime: disarmTime
          })
        }
      );

      const data = await response.json();

      console.log(data);

      handleCloseSettingsModel()


      getAutomationData();
    } catch (error) {
      console.error("Failed to save automation data:", error)
    } finally {
      setAutomationLoading(false)
    }

  };

  // Arm every zone
  function armAll() {
    sendGarageCommand("arm")
    sendDoorCommand("ARM")
    sendWindowCommand("ARM")

    setSecurityPanels(previousPanels =>
      previousPanels.map(panel =>
        panel.name === "Temperature"
          ? panel
          : {
            ...panel,
            armed: true
          }
      )
    )
  }


  // Disarm every zone
  function disarmAll() {
    sendGarageCommand("disarm")
    sendDoorCommand("DISARM")
    sendWindowCommand("DISARM")

    setSecurityPanels(previousPanels =>
      previousPanels.map(panel =>
        panel.name === "Temperature"
          ? panel
          : {
            ...panel,
            armed: false
          }
      )
    )
  }


  // Toggle one individual zone
  function toggleArmed(panelName) {



    setSecurityPanels(previousPanels =>
      previousPanels.map(panel =>
        panel.name === panelName
          ? {
            ...panel,
            armed: !panel.armed
          }
          : panel
      )
    )
  }

  const toggleLocked = (panelName) => {
    setSecurityPanels(previousPanels =>
      previousPanels.map(panel =>
        panel.name === panelName
          ? {
            ...panel,
            locked: !panel.locked
          }
          : panel
      )
    )
  }


  const getActivityLogs = async () => {
    try {
      const response = await fetch("/api/activity")
      const data = await response.json()

      console.log("Activity logs:", data)

      setActivityLogs(data)
    } catch (error) {
      console.error("Failed to get activity logs:", error)
    }
  }




  {/*ON LOAD USE EFFECT */ }

  useEffect(() => {
    getAutomationData()
    getDeviceStatus()
    getActivityLogs()

    const interval = setInterval(() => {
      getDeviceStatus()
      getActivityLogs()
    }, 2000)

    return () => clearInterval(interval)
  }, [])


  const [securityPanels, setSecurityPanels] = useState([
    {
      name: "Front Door",
      armed: true,
      status: "Closed",
      mqtt: "home/frontdoor/status",
      lastmsg: "Never",
      icon: DoorClosed,
      command: sendDoorCommand,
      locked: false
    },
    {
      name: "Window",
      armed: true,
      status: "Open",
      mqtt: "home/window/status",
      lastmsg: "Never",
      icon: Grid2X2,
      command: sendWindowCommand

    },
    {
      name: "Garage",
      armed: true,
      status: "Closed",
      mqtt: "home/garage/status",
      lastmsg: "Never",
      icon: Warehouse,
      command: sendGarageCommand,


    },
    {
      name: "Temperature",
      status: "22 °C",
      mqtt: "home/temperature/status",
      lastmsg: "Never",
      icon: Thermometer
    }
  ])




  return (
    <>

      <Container maxWidth="xl">

        {/* HEADER */}
        <Card
          sx={{
            background: "#15191c",
            border: "1px solid",
            borderColor: "#353535ff",
            mt: 4,
            height: 100,
            borderRadius: 3,
            padding: 2
          }}
        >

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: "100%",
            }}
          >

            <Box>

              <Typography
                sx={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: {
                    xs: 0,
                    sm: 10,
                    md: 15
                  },
                  fontWeight: 400,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "oklch(0.66 0.01 250)",
                }}
              >
                SWE30011 · Distributed IoT
              </Typography>


              <Typography
                component="h1"
                sx={{
                  fontFamily: '"IBM Plex Sans", sans-serif',
                  fontSize: {
                    xs: 0,
                    sm: 30,
                    md: 35
                  },
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  color: "oklch(0.93 0.005 250)",
                  m: 0,
                }}
              >
                Smart Home Security &amp; Automation
              </Typography>

            </Box>


            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 2
              }}
            >

              <Button
                onClick={armAll}
                variant="contained"
                disableElevation
                sx={{ ...btnBase, height: 45 }}
              >
                Arm All
              </Button>


              <Button
                onClick={disarmAll}
                variant="contained"
                disableElevation
                sx={{ ...btnBase, height: 45 }}
              >
                Disarm All
              </Button>

              <Button
                onClick={handleOpenSettingsModel}
                variant="contained"
                disableElevation
                sx={{ ...btnBase, height: 45, }}

              >
                <Settings />

              </Button>
            </Box>

          </Box>

        </Card>


        {/* SECURITY PANELS */}
        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              md: "row"
            },
            gap: 2,
            mt: 2
          }}
        >

          {securityPanels.map((panel) => {

            const Icon = panel.icon


            const isTemperature = panel.name === "Temperature"

            const accentColor = isTemperature
              ? "#8b5cf6"
              : panel.armed
                ? "#56b16d"
                : "#e6a127"

            const softBg = isTemperature
              ? "rgba(139, 92, 246, 0.08)"
              : panel.armed
                ? "rgba(86, 177, 109, 0.08)"
                : "rgba(230, 161, 39, 0.08)"

            const softBorder = isTemperature
              ? "1px solid rgba(139, 92, 246, 0.25)"
              : panel.armed
                ? "1px solid rgba(86, 177, 109, 0.25)"
                : "1px solid rgba(230, 161, 39, 0.25)"

            const softShadow = isTemperature
              ? "0 0 20px rgba(139, 92, 246, 0.08)"
              : panel.armed
                ? "0 0 20px rgba(86, 177, 109, 0.08)"
                : "0 0 20px rgba(230, 161, 39, 0.08)"

            return (



              <Card
                sx={{
                  background: "#15191c",
                  border: "1px solid",
                  borderColor: "#353535ff",
                  borderRadius: 4,
                  height: 360,

                  boxSizing: "border-box",
                  minWidth: 0,

                  width: {
                    xs: "100%",
                    sm: "calc(50% - 8px)",
                    lg: "calc(25% - 12px)"
                  },

                  padding: 2,

                  borderLeft: `5px solid ${accentColor}`
                }}
              >

                {/* CARD HEADER */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >

                  <Typography
                    sx={{
                      fontFamily: '"IBM Plex Mono", monospace',
                      fontSize: 23,
                      fontWeight: 500,
                      letterSpacing: "-0.01em",
                      color: "oklch(0.93 0.005 250)",
                      m: 0,
                    }}
                  >
                    {panel.name}
                  </Typography>


                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 1
                    }}
                  >
                    {panel.name !== "Temperature" && (
                      <>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            backgroundColor: panel.armed
                              ? "#56b16d"
                              : "#e6a127",
                            borderRadius: "50%"
                          }}
                        />

                        <Typography
                          sx={{
                            fontFamily: '"IBM Plex Mono", monospace',
                            fontSize: 12,
                            fontWeight: 400,
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: "oklch(0.66 0.01 250)",
                          }}
                        >
                          {panel.armed ? "Armed" : "Disarmed"}
                        </Typography>
                      </>
                    )}




                  </Box>






                </Box>


                {/* MQTT TOPIC */}
                <Typography
                  sx={{
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontSize: 10,
                    fontWeight: 400,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "oklch(0.66 0.01 250)",
                    mt: 1
                  }}
                >
                  {panel.mqtt}
                </Typography>


                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>


                  {/* ICON */}
                  <Box
                    sx={{
                      width: 90,
                      height: 90,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',

                      backgroundColor: softBg,
                      border: softBorder,
                      boxShadow: softShadow
                    }}
                  >
                    {panel.name === "Front Door" ? (
                      panel.locked
                        ? <Lock size={50} color="white" />
                        : <Unlock size={50} color="white" />
                    ) : (
                      <Icon size={50} color="white" />
                    )}
                  </Box>


                  {/* SENSOR STATUS */}
                  <Typography
                    component="h2"
                    sx={{
                      fontFamily: '"IBM Plex Sans", sans-serif',
                      fontSize: 35,
                      fontWeight: 400,
                      letterSpacing: "-0.01em",
                      color: "oklch(0.93 0.005 250)",
                      mt: 4,
                      mb: 3
                    }}
                  >
                    {panel.status}
                  </Typography>

                </Box>



                <Divider sx={{ background: '#636363ff', mt: 2, mb: 2 }}></Divider>



                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                  <Clock color='white'></Clock>



                  <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                    {/* Last Message */}
                    <Typography
                      sx={{ ...smallGray, fontSize: 10 }}
                    >
                      Last Messge
                    </Typography>


                    <Typography
                      sx={{ ...smallGray, fontSize: 10 }}
                    >
                      {panel.lastmsg}
                    </Typography>



                  </Box>


                </Box>



                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>



                  {/* Front Door Buttons */}

                  {panel.name == "Front Door" && (

                    <Box sx={{ display: 'flex', justifyContent: "space-evenly", gap: 2 }}>

                      <Button
                        variant="contained"

                        onClick={() => { toggleArmed(panel.name); { panel.armed ? panel.command("DISARM") : panel.command("ARM") } }}

                        sx={{
                          ...btnBase,
                          width: 150
                        }}
                      >
                        {panel.armed ? "Disarm" : "Arm"}
                      </Button>

                      <Button
                        variant="contained"
                        onClick={() => {
                          panel.command(panel.locked ? "UNLOCK" : "LOCK")
                          toggleLocked(panel.name)
                        }}
                        sx={{
                          ...btnBase,
                          width: 150
                        }}
                      >
                        {panel.locked ? "Unlock" : "Lock"}
                      </Button>



                    </Box>


                  )}


                  {/* Window Buttons */}

                  {panel.name == "Window" && (

                    <Box sx={{ display: 'flex', justifyContent: "space-evenly", gap: 2 }}>
                      <Button
                        variant="contained"

                        onClick={() => { toggleArmed(panel.name); { panel.armed ? panel.command("DISARM") : panel.command("ARM") } }}
                        sx={{
                          ...btnBase,
                          width: 300
                        }}
                      >
                        {panel.armed ? "Disarm" : "Arm"}
                      </Button>

                    </Box>

                  )}



                  {/* Garage Buttons */}

                  {panel.name == "Garage" && (
                    <Box sx={{ display: 'flex', justifyContent: "space-evenly", gap: 2 }}>
                      <Button
                        variant="contained"

                        onClick={() => { toggleArmed(panel.name); { panel.armed ? panel.command("disarm") : panel.command("arm") } }}
                        sx={{
                          ...btnBase,
                          width: 150
                        }}
                      >
                        {panel.armed ? "Disarm" : "Arm"}
                      </Button>


                      <Button
                        variant='contained'
                        onClick={() => panel.command("silence")}
                        sx={{
                          ...btnBase,
                          width: 150

                        }}>Silence</Button>

                    </Box>
                  )}

                  {/* Tempreture Buttons */}

                  {panel.name == "Temperature" && (

                    <Box sx={{ display: 'flex', justifyContent: "space-evenly", gap: 2 }}>

                      <Button
                        variant='contained'
                        onClick={handleOpenEditModel}
                        sx={{
                          ...btnBase,
                          width: 300

                        }}>Configure</Button>

                    </Box>

                  )}

                </Box>

              </Card>

            )
          })}

        </Box>


        {/* Log */}
        <Card
          sx={{
            background: "#15191c",
            border: "1px solid",
            borderColor: "#353535ff",
            mt: 4,
            height: 420,
            borderRadius: 3,
            padding: 2
          }}

        >


          <Box
            sx={{
              display: "flex",
              flexDirection: {
                xs: "column",
                sm: "row"
              },
              gap: 2,
              justifyContent: "space-between",
              alignItems: {
                xs: "stretch",
                sm: "center"
              }
            }}
          >

            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>

              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',

                  backgroundColor: 'rgba(103, 119, 107, 0.08)',


                  border: '1px solid rgba(107, 129, 113, 0.25)',


                  boxShadow: '0 0 20px rgba(86, 177, 109, 0.08)'

                }}
              >
                <FileText
                  size={40}
                  color="white"
                />
              </Box>

              <Typography
                component="h1"
                sx={{
                  fontFamily: '"IBM Plex Sans", sans-serif',
                  fontSize: 35,
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  color: "oklch(0.93 0.005 250)",
                  m: 0,
                }}
              >
                Acitivity Log
              </Typography>


            </Box>

            {/*Drop Down*/}

            <Select
              value={zoneFilter}
              onChange={handleZoneFilterChange}
              displayEmpty
              sx={selectSx}
              MenuProps={menuProps}
            >
              {zoneFilters.map((z) => (
                <MenuItem key={z.value} value={z.value}>{z.label}</MenuItem>
              ))}
            </Select>

          </Box>

          <TableContainer
            sx={{
              mt: 2,
              maxHeight: 310,
              overflowY: "auto",
              border: "1px solid #353535ff",
              borderRadius: 2,

              "&::-webkit-scrollbar": {
                width: 8
              },

              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#444",
                borderRadius: 4
              },

              "&::-webkit-scrollbar-track": {
                backgroundColor: "#1a1e21"
              }
            }}
          >
            <Table stickyHeader>

              <TableHead>
                <TableRow>

                  {["Date / Time", "Zone", "Event", "Status"].map((heading) => (

                    <TableCell
                      key={heading}
                      sx={{
                        backgroundColor: "#1e2327",
                        borderBottom: "1px solid #353535",
                        ...smallGray,
                        fontSize: 11
                      }}
                    >
                      {heading}
                    </TableCell>

                  ))}

                </TableRow>
              </TableHead>


              <TableBody>

                {visibleLogs.map((log) => (

                  <TableRow
                    key={log.id}
                    hover
                    sx={{
                      "&:hover": {
                        backgroundColor: "#1b2024"
                      }
                    }}
                  >

                    <TableCell
                      sx={{
                        color: "#aaa",
                        borderBottom: "1px solid #292d30",
                        fontFamily: '"IBM Plex Mono", monospace'
                      }}
                    >
                      {new Date(log.event_time).toLocaleString()}
                    </TableCell>


                    <TableCell
                      sx={{
                        color: "#ddd",
                        borderBottom: "1px solid #292d30"
                      }}
                    >
                      {log.zone.charAt(0).toUpperCase() + log.zone.slice(1)}
                    </TableCell>


                    <TableCell
                      sx={{
                        color: "#ddd",
                        borderBottom: "1px solid #292d30"
                      }}
                    >
                      {log.event}
                    </TableCell>


                    <TableCell
                      sx={{
                        borderBottom: "1px solid #292d30"
                      }}
                    >

                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 1
                        }}
                      >

                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor:
                              log.status === "Warning"
                                ? "#e6a127"
                                : "#56b16d"
                          }}
                        />

                        <Typography
                          sx={{
                            ...smallGray,
                            fontSize: 10,
                            color:
                              log.status === "Warning"
                                ? "#e6a127"
                                : "#56b16d"
                          }}
                        >
                          {log.status}
                        </Typography>

                      </Box>

                    </TableCell>

                  </TableRow>

                ))}

              </TableBody>

            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredLogs.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 20]}
            sx={{
              color: "#aaa",

              "& .MuiTablePagination-selectIcon": {
                color: "#aaa"
              },

              "& .MuiIconButton-root": {
                color: "#ddd"
              }
            }}
          />

        </Card>

      </Container >



      {/* TEMPERATURE MODAL*/}

      < Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }
      }>
        <Modal
          open={editTempModal}
          onClose={handleCloseEditModel}
        >

          <Card sx={{
            width: 340,
            height: 300,
            transform: 'translate(-50%, -50%)',
            position: 'absolute',
            top: '50%',
            left: '50%',
            backgroundColor: "#14191c",

            border: '1px solid rgba(107, 129, 113, 0.25)',
          }}>

            <Box sx={{ padding: 2, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
              <Typography sx={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: 23,
                fontWeight: 500,
                letterSpacing: "-0.01em",
                color: "oklch(0.93 0.005 250)",
                m: 0,
              }}>
                Temperature Thresholds
              </Typography>

              <Box sx={{ padding: 2, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>


                <Box sx={{ padding: 2, display: 'flex', alignItems: 'center', flexDirection: 'row', gap: 3 }}>

                  <TextField
                    id="high-temp"
                    label="High Temp"
                    variant="outlined"
                    value={highTemp}
                    type='number'
                    onChange={(event) => setHighTemp(event.target.value)}
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: 'oklch(0.93 0.005 250)',
                        fontFamily: '"IBM Plex Mono", monospace',
                      },

                      '& .MuiInputLabel-root.Mui-focused': {
                        color: 'oklch(0.93 0.005 250)',
                      },

                      '& .MuiOutlinedInput-input': {
                        color: 'oklch(0.93 0.005 250)',
                        fontFamily: '"IBM Plex Mono", monospace',
                      },

                      '& .MuiOutlinedInput-root': {
                        fontFamily: '"IBM Plex Mono", monospace',

                        '& fieldset': {
                          borderColor: 'oklch(0.93 0.005 250)',
                        },

                        '&:hover fieldset': {
                          borderColor: 'oklch(0.93 0.005 250)',
                        },

                        '&.Mui-focused fieldset': {
                          borderColor: 'oklch(0.93 0.005 250)',
                        },
                      },
                    }}
                  />
                  <Button variant='contained' sx={btnBase} onClick={sendHighTemp}>Set</Button>

                </Box>


                <Box sx={{ padding: 2, display: 'flex', alignItems: 'center', flexDirection: 'row', gap: 3 }}>
                  <TextField
                    id="low-temp"
                    label="Low Temp"
                    variant="outlined"
                    type='number'
                    value={lowTemp}
                    onChange={(event) => setLowTemp(event.target.value)}
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: 'oklch(0.93 0.005 250)',
                        fontFamily: '"IBM Plex Mono", monospace',
                      },

                      '& .MuiInputLabel-root.Mui-focused': {
                        color: 'oklch(0.93 0.005 250)',
                      },

                      '& .MuiOutlinedInput-input': {
                        color: 'oklch(0.93 0.005 250)',
                        fontFamily: '"IBM Plex Mono", monospace',
                      },

                      '& .MuiOutlinedInput-root': {
                        fontFamily: '"IBM Plex Mono", monospace',

                        '& fieldset': {
                          borderColor: 'oklch(0.93 0.005 250)',
                        },

                        '&:hover fieldset': {
                          borderColor: 'oklch(0.93 0.005 250)',
                        },

                        '&.Mui-focused fieldset': {
                          borderColor: 'oklch(0.93 0.005 250)',
                        },
                      },
                    }}
                  />

                  <Button variant='contained' sx={btnBase} onClick={sendLowTemp}>Set</Button>
                </Box>

              </Box>




            </Box>

          </Card>



        </Modal>


      </Box >




      {/* SETTINGS MODAL */}

      < Modal
        open={settingsModal}
        onClose={handleCloseSettingsModel}
      >
        <Card
          sx={{
            width: {
              xs: 'calc(100% - 32px)',
              sm: 420,
            },

            maxWidth: 420,

            maxHeight: {
              xs: 'calc(100vh - 32px)',
              sm: '90vh',
            },

            overflowY: 'auto',

            transform: 'translate(-50%, -50%)',
            position: 'absolute',
            top: '50%',
            left: '50%',

            backgroundColor: '#14191c',

            border: '1px solid rgba(107, 129, 113, 0.25)',
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              p: {
                xs: 2,
                sm: 3,
              },

              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <Typography
              sx={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: {
                  xs: 20,
                  sm: 23,
                },
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: 'oklch(0.93 0.005 250)',
                mb: 2,
              }}
            >
              Settings
            </Typography>


            {automationLoading ? (<OrbitProgress color="#32cd32" size="medium" text="" textColor="" />) : (

              <>


                <FormControlLabel
                  sx={{
                    width: '100%',
                    mb: 2,

                    '& .MuiFormControlLabel-label': {
                      fontFamily: '"IBM Plex Mono", monospace',
                      color: 'oklch(0.93 0.005 250)',
                    },
                  }}
                  control={
                    <Checkbox
                      checked={automation}
                      onChange={(event) =>
                        setAutomation(event.target.checked)
                      }
                      sx={{
                        color: '#56b16d',

                        '&.Mui-checked': {
                          color: '#56b16d',
                        },
                      }}
                    />
                  }
                  label="Automatic Arming"
                />

                <Box
                  sx={{
                    opacity: automation ? 1 : 0.35,
                    pointerEvents: automation ? 'auto' : 'none',

                    transition: 'opacity 0.2s ease',

                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                  }}
                >
                  <CircularSlider
                    initialStartTime={initialArmTime}
                    initialEndTime={initialDisarmTime}

                    startIcon={
                      <g transform="translate(-10 -10) scale(0.8)">
                        <Shield
                          size={24}
                          strokeWidth={2}
                          color="#56b16d"
                        />
                      </g>
                    }

                    stopIcon={
                      <g transform="translate(-10 -10) scale(0.8)">
                        <Unlock
                          size={24}
                          strokeWidth={2}
                          color="#56b16d"
                        />
                      </g>
                    }

                    segments={5}

                    strokeWidth={isMobile ? 24 : 30}
                    radius={isMobile ? 105 : 140}

                    gradientColorFrom="#56b16d"
                    gradientColorTo="#56b16d"

                    showClockFace={true}

                    clockFaceColor="oklch(0.93 0.005 250)"
                    bgCircleColor="#252a2e"

                    onStartUpdate={({ startTime }) => {
                      console.log("ARM changed:", startTime)

                      setScheduleStart(startTime)
                    }}

                    onEndUpdate={({ endTime }) => {
                      console.log("DISARM changed:", endTime)

                      setScheduleEnd(endTime)
                    }}
                  />
                </Box>


                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    mt: 2,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: '"IBM Plex Mono", monospace',
                        fontSize: 11,
                        color: '#7d8589',
                      }}
                    >
                      ARM
                    </Typography>

                    <Typography
                      sx={{
                        fontFamily: '"IBM Plex Mono", monospace',
                        color: automation ? 'oklch(0.93 0.005 250)' : "#222121ff",
                      }}
                    >
                      {String(scheduleStart.h).padStart(2, '0')}:
                      {String(scheduleStart.m).padStart(2, '0')}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      sx={{
                        fontFamily: '"IBM Plex Mono", monospace',
                        fontSize: 11,
                        color: '#7d8589',
                      }}
                    >
                      DISARM
                    </Typography>

                    <Typography
                      sx={{
                        fontFamily: '"IBM Plex Mono", monospace',
                        color: automation ? 'oklch(0.93 0.005 250)' : "#222121ff",
                      }}
                    >
                      {String(scheduleEnd.h).padStart(2, '0')}:
                      {String(scheduleEnd.m).padStart(2, '0')}
                    </Typography>
                  </Box>
                </Box>


                <Button
                  variant="contained"
                  onClick={handleConfirmSchedule}
                  sx={{
                    ...btnBase, mt: 1
                  }}
                >
                  Confirm
                </Button>


              </>

            )}


          </Box>


        </Card>


      </Modal >
    </>
  )
}

export default App
