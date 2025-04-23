import { useState, useEffect } from 'react'
import {
  Button as MuiButton,
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
  Stack,
} from '@mui/material'
import { useNotify } from 'react-admin'
import { theme as antTheme, ConfigProvider, Button, Space, Card as AntCard, Typography as AntTypography, Divider } from 'antd'
import type { ThemeConfig } from 'antd/es/config-provider/context'

// Default algorithm from Ant Design
const { defaultAlgorithm, darkAlgorithm } = antTheme

// Common font families
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
  
  // Initialize with default Ant Design tokens
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    token: {
      colorPrimary: '#1890ff',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#f5222d',
      colorInfo: '#1890ff',
      fontFamily: 'Roboto, sans-serif',
      fontSize: 14,
      borderRadius: 6,
      ...(initialTheme?.token || {})
    },
    algorithm: defaultAlgorithm
  })

  // Reset theme when initialTheme changes or dialog opens
  useEffect(() => {
    if (open) {
      setThemeConfig({
        token: {
          colorPrimary: '#1890ff',
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#f5222d',
          colorInfo: '#1890ff',
          fontFamily: 'Roboto, sans-serif',
          fontSize: 14,
          borderRadius: 6,
          ...(initialTheme?.token || {})
        },
        algorithm: initialTheme?.algorithm || defaultAlgorithm
      })
    }
  }, [initialTheme, open])

  const handleTokenChange = (tokenName: string, value: string | number) => {
    setThemeConfig(prev => ({
      ...prev,
      token: {
        ...prev.token,
        [tokenName]: value
      }
    }))
  }
  
  const handleAlgorithmChange = (isDark: boolean) => {
    setThemeConfig(prev => ({
      ...prev,
      algorithm: isDark ? darkAlgorithm : defaultAlgorithm
    }))
  }

  const handleSave = () => {
    onSave(themeConfig)
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
              <Typography variant="h6" gutterBottom>Ant Design Theme Settings</Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <FormControl sx={{ flex: 1 }}>
                  <TextField
                    label="Primary Color"
                    type="color"
                    value={themeConfig.token?.colorPrimary || '#1890ff'}
                    onChange={(e) => handleTokenChange('colorPrimary', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <TextField
                    label="Success Color"
                    type="color"
                    value={themeConfig.token?.colorSuccess || '#52c41a'}
                    onChange={(e) => handleTokenChange('colorSuccess', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <TextField
                    label="Warning Color"
                    type="color"
                    value={themeConfig.token?.colorWarning || '#faad14'}
                    onChange={(e) => handleTokenChange('colorWarning', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <TextField
                    label="Error Color"
                    type="color"
                    value={themeConfig.token?.colorError || '#f5222d'}
                    onChange={(e) => handleTokenChange('colorError', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </FormControl>
              </Stack>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel id="font-family-label">Font Family</InputLabel>
                  <Select
                    labelId="font-family-label"
                    value={themeConfig.token?.fontFamily || 'Roboto, sans-serif'}
                    onChange={(e) => handleTokenChange('fontFamily', e.target.value)}
                    label="Font Family"
                  >
                    {fontFamilies.map((font) => (
                      <MenuItem key={font} value={font}>
                        <span style={{ fontFamily: font }}>{font.split(',')[0]}</span>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ width: 120 }}>
                  <TextField
                    label="Font Size (px)"
                    type="number"
                    style={{marginTop: 0}}
                    value={themeConfig.token?.fontSize || 14}
                    onChange={(e) => handleTokenChange('fontSize', parseInt(e.target.value, 10))}
                    inputProps={{ min: 8, max: 24, step: 1 }}
                  />
                </FormControl>
              </Stack>

              
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <FormControl sx={{ width: 150 }}>
                  <TextField
                    label="Border Radius (px)"
                    type="number"
                    value={themeConfig.token?.borderRadius || 6}
                    onChange={(e) => handleTokenChange('borderRadius', parseInt(e.target.value, 10))}
                    inputProps={{ min: 0, max: 24, step: 1 }}
                  />
                </FormControl>
              </Stack>
              
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <FormControl sx={{ width: 150 }}>
                  <InputLabel id="algorithm-label">Theme Mode</InputLabel>
                  <Select
                    labelId="algorithm-label"
                    value={themeConfig.algorithm === darkAlgorithm ? 'dark' : 'light'}
                    onChange={(e) => handleAlgorithmChange(e.target.value === 'dark')}
                    label="Theme Mode"
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Box>
          </Grid>
          
          {/* Right panel: Live preview using Ant Design components */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Preview</Typography>
              
              <Box sx={{ 
                backgroundColor: '#f5f5f5', 
                p: 2, 
                borderRadius: 1,
                overflow: 'hidden'
              }}>
                <ConfigProvider theme={themeConfig}>
                  <div style={{ padding: '16px', backgroundColor: 'var(--ant-background-container)' }}>
                    <AntTypography.Title level={4}>Ant Design Components Preview</AntTypography.Title>
                    <Divider />                    
                    
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <AntCard title="Primary Card" style={{ marginBottom: '16px' }}>
                        <p>This is a standard card with default styling.</p>
                        <Button type="primary">Primary Button</Button>
                      </AntCard>
                      
                      <Space style={{ marginBottom: '16px' }}>
                        <Button type="primary">Primary</Button>
                        <Button>Default</Button>
                        <Button type="dashed">Dashed</Button>
                      </Space>
                      
                      <Space style={{ marginBottom: '16px' }}>
                        <Button type="primary" danger>Danger</Button>
                        <Button type="primary" ghost>Ghost</Button>
                        <Button type="link">Link</Button>
                      </Space>
                      
                      <AntCard>
                        <AntTypography.Title level={5}>Typography</AntTypography.Title>
                        <AntTypography.Text>Default text</AntTypography.Text>
                        <br />
                        <AntTypography.Text type="success">Success text</AntTypography.Text>
                        <br />
                        <AntTypography.Text type="warning">Warning text</AntTypography.Text>
                        <br />
                        <AntTypography.Text type="danger">Danger text</AntTypography.Text>
                      </AntCard>
                    </Space>
                  </div>
                </ConfigProvider>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <MuiButton onClick={onClose}>Cancel</MuiButton>
        <MuiButton onClick={handleSave} variant="contained" color="primary">Save</MuiButton>
      </DialogActions>
    </Dialog>
  )
}
