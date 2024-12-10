import React from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PieChart } from '@mui/x-charts/PieChart';
import './stats.css';

function formatStats(stats) {
  return {
    accuracy: {
      coarse: {
        'wins': {
          id: 0,
          value: stats.accuracy.coarse.wins, 
          label: 'Games Won', 
          color: '#16e09a', 
        },
        'losses': {
          id: 1,
          value: stats.accuracy.coarse.losses, 
          label: 'Games Lost', 
          color: '#fa5a5a', 
        },
      },
      fine: {
        'botsRescued': {
          id: 0,
          value: stats.accuracy.fine.botsRescued, 
          label: 'Bots Rescued', 
          color: '#b00e0e', 
        },
        'captchasFailed': {
          id: 1,
          value: stats.accuracy.fine.captchasFailed, 
          label: 'Captchas Failed', 
          color: '#fa8282', 
        },
        'connectionsLost': {
          id: 2,
          value: stats.accuracy.fine.connectionsLost, 
          label: 'Connections Lost', 
          color: '#d4c9c9', 
        },
      },
    },
    precision: {
      coarse: {
        'humans': {
          id: 0,
          value: stats.precision.coarse.humans, 
          label: 'Humans', 
          color: '#05b6fc', 
        },
        'bots': {
          id: 1,
          value: stats.precision.coarse.bots,
          label: 'Bots', 
          color: '#18ed1f', 
        },
      },
      fine: {
        'trueNegatives': {
          id: 0,
          value: stats.precision.fine.trueNegatives, 
          label: 'True Negatives', 
          color: '#2de2e6', 
        },
        'falsePositives': {
          id: 1,
          value: stats.precision.fine.falsePositives, 
          label: 'False Positives', 
          color: '#fc054b', 
        },
        'truePositives': {
          id: 2,
          value: stats.precision.fine.truePositives, 
          label: 'True Positives', 
          color: '#2de2e6',
        },
        'falseNegatives': {
          id: 3,
          value: stats.precision.fine.falseNegatives, 
          label: 'False Negatives', 
          color: '#fc054b', 
        },
      },
    },
  };
};

export function Stats(props) {
  const stats = formatStats(props.stats);
  console.log(stats);

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
                data: Array.from(Object.values(stats.accuracy.coarse)) || [],
                highlightScope: { 
                  fade: 'global', 
                  highlight: 'item', 
                },
                faded: { 
                  innerRadius: 40, 
                  additionalRadius: -20, 
                  color: 'gray', 
                },
              },
              {
                innerRadius: 120,
                outerRadius: 160,
                id: 'accuracy-series-fine',
                data: Array.from(Object.values(stats.accuracy.fine)) || [],
                startAngle: (stats.accuracy.coarse.wins.value / (stats.accuracy.coarse.wins.value + stats.accuracy.coarse.losses.value)) * 360, 
                endAngle: 360,
                highlightScope: { 
                  fade: 'global', 
                  highlight: 'item', 
                },
                faded: { 
                  innerRadius: 80, 
                  additionalRadius: -60, 
                  color: 'gray', 
                },
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
                data: Array.from(Object.values(stats.precision.coarse)) || [],
                highlightScope: { 
                  fade: 'global', 
                  highlight: 'item', 
                },
                faded: { 
                  innerRadius: 40, 
                  additionalRadius: -20, 
                  color: 'gray', 
                },
              },
              {
                innerRadius: 120,
                outerRadius: 160,
                id: 'precision-series-fine',
                data: Array.from(Object.values(stats.precision.fine)) || [],
                highlightScope: { 
                  fade: 'global',
                  highlight: 'item', 
                },
                faded: { 
                  innerRadius: 80, 
                  additionalRadius: -60, 
                  color: 'gray', 
                },
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
  slotProps: { 
    legend: { 
      hidden: true 
    } 
  },
}
