import React from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PieChart } from '@mui/x-charts/PieChart';
import './stats.css';

const accFake = {
  coarse: [
    {id: 0, value: 27, label: 'Games Won', color: '#16e09a' },
    {id: 1, value: 60, label: 'Games Lost', color: '#fa5a5a' },
  ],
  fine: [
    {id: 0, value: 12, label: 'Bots Rescued', color: '#b00e0e' },
    {id: 1, value: 46, label: 'Captchas Failed', color: '#fa8282' },
    {id: 2, value: 2, label: 'Connections Lost', color: '#d4c9c9' },
  ],
}

const precFake = {
  coarse: [
    {id: 0, value: 485, label: 'Humans', color: '#05b6fc' },
    {id: 1, value: 122, label: 'Bots', color: '#18ed1f' },
  ],
  fine: [
    {id: 0, value: 400, label: 'True Negatives', color: '#2de2e6' },
    {id: 1, value: 85, label: 'False Positives', color: '#fc054b' },
    {id: 2, value: 39, label: 'True Postives', color: '#2de2e6' },
    {id: 3, value: 83, label: 'False Negatives', color: '#fc054b' },
  ],
}

export function Stats(props) {
  const [acc, setAcc] = React.useState(accFake);
  const [prec, setPrec] = React.useState(precFake);

  /**
  // Demonstrates calling a service asynchronously so that
  // React can properly update state objects with the results.
  React.useEffect(() => {
    const statsText = localStorage.getItem('stats');
    if (statsText) {
      const pojo = JSON.parse(statsText);
      setAcc(pojo.accuracy || {});
      setPrec(pojo.precision || {});
    }
  }, []);
  **/

  return (
    <main className='container-fluid bg-secondary'>
      <Stack 
        direction="row" 
        width="100%" 
        spacing={2}
        sx={{ 
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box flexGrow={1}>
          <Typography variant="h3">Wins</Typography>
          <PieChart
            series={[
              {
                innerRadius: 0,
                outerRadius: 80,
                id: 'accuracy-series-coarse',
                data: acc.coarse || [],
                highlightScope: { fade: 'global', highlight: 'item' },
                faded: { innerRadius: 40, additionalRadius: -20, color: 'gray' },
              },
              {
                innerRadius: 120,
                outerRadius: 160,
                id: 'accuracy-series-fine',
                data: acc.fine || [],
                startAngle: (acc.coarse[0].value / (acc.coarse[0].value + acc.coarse[1].value)) * 360, 
                endAngle: 360,
                highlightScope: { fade: 'global', highlight: 'item' },
                faded: { innerRadius: 80, additionalRadius: -60, color: 'gray' },
              },
            ]}
            {...params}  
          />{' '}
        </Box>
        <Box flexGrow={1}>
          <Typography variant="h3">Votes</Typography>
          <PieChart
            series={[
              {
                innerRadius: 0,
                outerRadius: 80,
                id: 'precision-series-coarse',
                data: prec.coarse || [],
                highlightScope: { fade: 'global', highlight: 'item' },
                faded: { innerRadius: 40, additionalRadius: -20, color: 'gray' },
              },
              {
                innerRadius: 120,
                outerRadius: 160,
                id: 'precision-series-fine',
                data: prec.fine || [],
                highlightScope: { fade: 'global', highlight: 'item' },
                faded: { innerRadius: 80, additionalRadius: -60, color: 'gray' },
              },
            ]}
            {...params}
          />{' '}
        </Box>
      </Stack>
    </main>
  );
}

const params = {
  height: 500,
  width: 500,
  slotProps: { legend: { hidden: true } },
}
