import { useState, useEffect } from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material'
import { useNotify } from 'react-admin'
import { ThemeConfig } from '../../../types/wargame-d'

const fontFamilies = [
  'Arial, sans-serif',
  'Helvetica, sans-serif',
  'Verdana, sans-serif',
  'Tahoma, sans-serif',
  'Trebuchet MS, sans-serif',
  'Times New Roman, serif',
  'Georgia, serif',
  'Garamond, serif',
  'Courier New, monospace',
  'Roboto, sans-serif',
  'Open Sans, sans-serif',
  'Lato, sans-serif',
  'Montserrat, sans-serif',
  'Raleway, sans-serif',
]

interface ThemeEditorProps {
  open: boolean
  onClose: () => void
  initialTheme?: ThemeConfig
  onSave: (theme: ThemeConfig) => void
}

export const ThemeEditor = ({ open, onClose, initialTheme, onSave }: ThemeEditorProps) => {
  const notify = useNotify()
  
  const [theme, setTheme] = useState<ThemeConfig>({
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    fontFamily: 'Roboto, sans-serif',
    fontSize: 14,
    ...initialTheme
  })

  // Reset theme when initialTheme changes or dialog opens
  useEffect(() => {
    if (open) {
      setTheme({
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e',
        fontFamily: 'Roboto, sans-serif',
        fontSize: 14,
        ...initialTheme
      })
    }
  }, [initialTheme, open])

  const handleChange = (field: keyof ThemeConfig, value: string | number) => {
    setTheme(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    onSave(theme)
    notify('Theme saved successfully', { type: 'success' })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Edit Wargame Theme</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Left panel: Form controls */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Theme Settings</Typography>
              
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Primary Color"
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Secondary Color"
                  type="color"
                  value={theme.secondaryColor}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="font-family-label">Font Family</InputLabel>
                <Select
                  labelId="font-family-label"
                  value={theme.fontFamily}
                  onChange={(e) => handleChange('fontFamily', e.target.value)}
                  label="Font Family"
                >
                  {fontFamilies.map((font) => (
                    <MenuItem key={font} value={font}>
                      <span style={{ fontFamily: font }}>{font.split(',')[0]}</span>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Font Size (px)"
                  type="number"
                  value={theme.fontSize}
                  onChange={(e) => handleChange('fontSize', parseInt(e.target.value, 10))}
                  fullWidth
                  margin="normal"
                  inputProps={{ min: 8, max: 24, step: 1 }}
                />
              </FormControl>
            </Box>
          </Grid>
          
          {/* Right panel: Live preview */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Preview</Typography>
              
              <Box sx={{ 
                backgroundColor: '#f5f5f5', 
                p: 2, 
                borderRadius: 1,
                fontFamily: theme.fontFamily,
                fontSize: `${theme.fontSize}px`
              }}>
                <Card sx={{ 
                  backgroundColor: theme.primaryColor,
                  color: '#ffffff',
                  mb: 2
                }}>
                  <CardContent>
                    <Typography variant="h5" component="div" sx={{ fontFamily: 'inherit' }}>
                      Primary Color Header
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'inherit' }}>
                      This shows how your primary color will look
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" component="div" sx={{ 
                      color: theme.primaryColor,
                      fontFamily: 'inherit'
                    }}>
                      Text in Primary Color
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'inherit' }}>
                      This is how regular text will appear with your selected font family and size.
                    </Typography>
                    <Button 
                      variant="contained" 
                      sx={{ 
                        backgroundColor: theme.primaryColor,
                        '&:hover': { backgroundColor: theme.primaryColor },
                        mt: 1
                      }}
                    >
                      Primary Button
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="div" sx={{ 
                      color: theme.secondaryColor,
                      fontFamily: 'inherit'
                    }}>
                      Text in Secondary Color
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'inherit' }}>
                      Secondary colors are used for accents and highlights.
                    </Typography>
                    <Button 
                      variant="contained" 
                      sx={{ 
                        backgroundColor: theme.secondaryColor,
                        '&:hover': { backgroundColor: theme.secondaryColor },
                        mt: 1
                      }}
                    >
                      Secondary Button
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Theme
        </Button>
      </DialogActions>
    </Dialog>
  )
}
