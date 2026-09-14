import { Button, Box, Typography, Card, Container } from '@mui/material'

import { useState } from 'react';


function App() {

  const [isArmed, SetIsArmed] = useState(true)

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
    "&:hover": { backgroundColor: "oklch(0.32 0.015 250)", boxShadow: "none" },
  };


  function toggleArmed() {

    if (isArmed) {
      SetIsArmed(false)
    } else {

      SetIsArmed(true)
    }

  }

  return (
    <>

      <Container maxWidth="xl" >

        <Card sx={{ background: "#15191c", border: '1px solid', borderColor: '#353535ff', mt: 4, height: 100, borderRadius: 3, padding: 2 }}>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: '100%',
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

            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 }}>

              <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>

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
                  System
                </Typography>

                <Typography
                  component="h1"
                  sx={{
                    fontFamily: '"IBM Plex Sans", sans-serif',
                    fontSize: 35,
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    color: isArmed ? "#56b16d" : "#e6a127",
                    m: 0,
                  }}
                >
                  {isArmed ? "Armed" : "Disarmed"}
                </Typography>


              </Box>


              <Button
                onClick={toggleArmed}
                variant="contained"
                disableElevation
                sx={btnBase}
              >
                {isArmed ? "Disarm All" : "Arm All"}
              </Button>
            </Box>




          </Box>


        </Card>




      </Container >
    </>
  )
}

export default App