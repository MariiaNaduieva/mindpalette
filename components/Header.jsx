import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';

export default function Header() {
  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar>
        <PaletteIcon sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h5" component="div" fontWeight="bold">
          MindPalette
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
