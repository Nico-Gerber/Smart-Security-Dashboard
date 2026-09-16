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
  TablePagination
} from '@mui/material'
import { useState } from 'react'

import { DoorClosed, Warehouse, Thermometer, Grid2X2, Clock, Wifi, FileText } from 'lucide-react'

function App() {


  const mockLogs = [
    {
      id: 1,
      time: "13:24:12",
      zone: "garage",
      device: "Garage",
      event: "Door closed",
      status: "Info"
    },
    {
      id: 2,
      time: "13:23:48",
      zone: "window",
      device: "Window",
      event: "Window opened",
      status: "Warning"
    },
    {
      id: 3,
      time: "13:22:31",
      zone: "frontdoor",
      device: "Front Door",
      event: "Door closed",
      status: "Info"
    },
    {
      id: 4,
      time: "13:21:05",
      zone: "temp",
      device: "Temperature",
      event: "Temperature updated to 22°C",
      status: "Info"
    },
    {
      id: 5,
      time: "13:19:42",
      zone: "garage",
      device: "Garage",
      event: "Garage armed",
      status: "Info"
    },
    {
      id: 6,
      time: "13:18:17",
      zone: "window",
      device: "Window",
      event: "Window closed",
      status: "Info"
    },
    {
      id: 7,
      time: "13:16:53",
      zone: "frontdoor",
      device: "Front Door",
      event: "Door opened",
      status: "Warning"
    },
    {
      id: 8,
      time: "13:14:26",
      zone: "temp",
      device: "Temperature",
      event: "Temperature changed to 23°C",
      status: "Info"
    },
    {
      id: 9,
      time: "13:12:10",
      zone: "garage",
      device: "Garage",
      event: "Door opened",
      status: "Warning"
    },
    {
      id: 10,
      time: "13:10:02",
      zone: "garage",
      device: "Garage",
      event: "Garage disarmed",
      status: "Info"
    },
    {
      id: 11,
      time: "13:08:44",
      zone: "window",
      device: "Window",
      event: "Window opened",
      status: "Warning"
    },
    {
      id: 12,
      time: "13:06:15",
      zone: "frontdoor",
      device: "Front Door",
      event: "Front door armed",
      status: "Info"
    }
  ]

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


  const [securityPanels, setSecurityPanels] = useState([
    {
      name: "Front Door",
      armed: true,
      status: "Closed",
      mqtt: "home/frontdoor/status",
      lastmsg: "2s",
      icon: DoorClosed
    },
    {
      name: "Window",
      armed: true,
      status: "Open",
      mqtt: "home/window/status",
      lastmsg: "20s",
      icon: Grid2X2
    },
    {
      name: "Garage",
      armed: true,
      status: "Closed",
      mqtt: "home/garage/status",
      lastmsg: "10m",
      icon: Warehouse
    },
    {
      name: "Temperature",
      armed: true,
      status: "22 °C",
      mqtt: "home/temperature/status",
      lastmsg: "15m",
      icon: Thermometer
    }
  ])


  // Arm every zone
  function armAll() {

    setSecurityPanels(previousPanels =>
      previousPanels.map(panel => ({
        ...panel,
        armed: true
      }))
    )
  }


  // Disarm every zone
  function disarmAll() {

    setSecurityPanels(previousPanels =>
      previousPanels.map(panel => ({
        ...panel,
        armed: false
      }))
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


  const zoneFilters = [
    { value: "all", label: "All zones" },
    { value: "frontdoor", label: "Front Door" },
    { value: "window", label: "Window" },
    { value: "garage", label: "Garage" },
    { value: "temp", label: "Temp" },
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

  const filteredLogs =
    zoneFilter === "all"
      ? mockLogs
      : mockLogs.filter(log => log.zone === zoneFilter)


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
                  fontSize: 15,
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
                  fontSize: 35,
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
                gap: 4
              }}
            >

              <Button
                onClick={armAll}
                variant="contained"
                disableElevation
                sx={btnBase}
              >
                Arm All
              </Button>


              <Button
                onClick={disarmAll}
                variant="contained"
                disableElevation
                sx={btnBase}
              >
                Disarm All
              </Button>

            </Box>

          </Box>

        </Card>


        {/* SECURITY PANELS */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mt: 2
          }}
        >

          {securityPanels.map((panel) => {

            const Icon = panel.icon

            return (



              <Card
                key={panel.name}
                sx={{
                  background: "#15191c",
                  border: "1px solid",
                  borderColor: "#353535ff",
                  borderRadius: 4,
                  height: 350,
                  width: 360,
                  padding: 2,

                  borderLeft: panel.armed
                    ? "5px solid #56b16d"
                    : "5px solid #e6a127"
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

                      backgroundColor: panel.armed
                        ? 'rgba(86, 177, 109, 0.08)'
                        : 'rgba(230, 161, 39, 0.08)',

                      border: panel.armed
                        ? '1px solid rgba(86, 177, 109, 0.25)'
                        : '1px solid rgba(230, 161, 39, 0.25)',

                      boxShadow: panel.armed
                        ? '0 0 20px rgba(86, 177, 109, 0.08)'
                        : '0 0 20px rgba(230, 161, 39, 0.08)'
                    }}
                  >
                    <Icon
                      size={50}
                      color="white"
                    />
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

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>

                  <Wifi color='white'></Wifi>

                  <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                    {/* Last Message */}
                    <Typography
                      sx={{ ...smallGray, fontSize: 10 }}
                    >
                      Device Status
                    </Typography>


                    <Typography
                      sx={{ ...smallGray, fontSize: 10, color: "#56b16d" }}
                    >
                      Online
                    </Typography>



                  </Box>



                </Box>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>

                  {/* ARM / DISARM BUTTON */}
                  <Button
                    variant="contained"
                    disableElevation
                    onClick={() => toggleArmed(panel.name)}
                    sx={{
                      ...btnBase,
                      width: 300
                    }}
                  >
                    {panel.armed ? "Disarm" : "Arm"}
                  </Button>

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


          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'space-between' }}>

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

                  {["Time", "Device", "Event", "Status"].map((heading) => (

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
                      {log.time}
                    </TableCell>


                    <TableCell
                      sx={{
                        color: "#ddd",
                        borderBottom: "1px solid #292d30"
                      }}
                    >
                      {log.device}
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

    </>
  )
}

export default App