import { Button, Box, Typography, Card, Container, Divider } from '@mui/material'
import { useState } from 'react'

import { DoorClosed, Warehouse, Thermometer, Grid2X2, Clock, Wifi } from 'lucide-react'

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

      </Container >

    </>
  )
}

export default App