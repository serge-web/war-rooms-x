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
  IconButton,
  Tooltip,
  InputAdornment,
  SelectChangeEvent,
} from '@mui/material'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import { useNotify } from 'react-admin'
import { ConfigProvider, Button, Space, Card as AntCard, Typography as AntTypography, Divider } from 'antd'
import type { ThemeConfig } from 'antd/es/config-provider/context'

// Default token values
const defaultTokenValues = {
  // Colors
  colorPrimary: '#1890ff',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorError: '#f5222d',
  colorInfo: '#1890ff',
  colorLink: '#1890ff',
  colorBgBase: '#ffffff',
  colorTextBase: '#000000',
  colorBorder: '#d9d9d9',
  colorTextSecondary: '#666666',
  
  // Typography
  fontFamily: 'Roboto, sans-serif',
  fontSize: 14,
  lineHeight: 1.5715,
  fontWeightStrong: 600,
  
  // Spacing and sizing
  borderRadius: 6,
  controlHeight: 32,
  lineWidth: 1,
}

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
      ...defaultTokenValues,
      ...(initialTheme?.token || {})
    }
  })

  // Reset theme when initialTheme changes or dialog opens
  useEffect(() => {
    if (open) {
      setThemeConfig({
        token: {
          ...defaultTokenValues,
          ...(initialTheme?.token || {})
        }
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
  
  const handleResetToken = (tokenName: string) => {
    setThemeConfig(prev => ({
      ...prev,
      token: {
        ...prev.token,
        [tokenName]: defaultTokenValues[tokenName as keyof typeof defaultTokenValues]
      }
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
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Brand Colors</Typography>
              <Stack direction="row" spacing={2}>
                <FormControl sx={{ flex: 1 }}>
                  <TextField
                    label="Primary Color"
                    type="color"
                    value={themeConfig.token?.colorPrimary || defaultTokenValues.colorPrimary}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTokenChange('colorPrimary', e.target.value)}
                    slotProps={{
                      inputLabel: { shrink: true },
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Reset to default">
                              <IconButton
                                size="small"
                                onClick={() => handleResetToken('colorPrimary')}
                                edge="end"
                                sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                              >
                                <RestartAltIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <TextField
                    label="Success Color"
                    type="color"
                    value={themeConfig.token?.colorSuccess || defaultTokenValues.colorSuccess}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTokenChange('colorSuccess', e.target.value)}
                    slotProps={{
                      inputLabel: { shrink: true },
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Reset to default">
                              <IconButton
                                size="small"
                                onClick={() => handleResetToken('colorSuccess')}
                                edge="end"
                                sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                              >
                                <RestartAltIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <TextField
                    label="Warning Color"
                    type="color"
                    value={themeConfig.token?.colorWarning || defaultTokenValues.colorWarning}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTokenChange('colorWarning', e.target.value)}
                    slotProps={{
                      inputLabel: { shrink: true },
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Reset to default">
                              <IconButton
                                size="small"
                                onClick={() => handleResetToken('colorWarning')}
                                edge="end"
                                sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                              >
                                <RestartAltIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <TextField
                    label="Error Color"
                    type="color"
                    value={themeConfig.token?.colorError || defaultTokenValues.colorError}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTokenChange('colorError', e.target.value)}
                    slotProps={{
                      inputLabel: { shrink: true },
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Reset to default">
                              <IconButton
                                size="small"
                                onClick={() => handleResetToken('colorError')}
                                edge="end"
                                sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                              >
                                <RestartAltIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </FormControl>
              </Stack>
              
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Base Colors</Typography>
              <Stack direction="row" spacing={2}>
                <FormControl sx={{ flex: 1 }}>
                  <TextField
                    label="Background Base"
                    type="color"
                    value={themeConfig.token?.colorBgBase || defaultTokenValues.colorBgBase}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTokenChange('colorBgBase', e.target.value)}
                    slotProps={{
                      inputLabel: { shrink: true },
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Reset to default">
                              <IconButton
                                size="small"
                                onClick={() => handleResetToken('colorBgBase')}
                                edge="end"
                                sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                              >
                                <RestartAltIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <TextField
                    label="Text Base"
                    type="color"
                    value={themeConfig.token?.colorTextBase || defaultTokenValues.colorTextBase}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTokenChange('colorTextBase', e.target.value)}
                    slotProps={{
                      inputLabel: { shrink: true },
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Reset to default">
                              <IconButton
                                size="small"
                                onClick={() => handleResetToken('colorTextBase')}
                                edge="end"
                                sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                              >
                                <RestartAltIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <TextField
                    label="Border Color"
                    type="color"
                    value={themeConfig.token?.colorBorder || defaultTokenValues.colorBorder}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTokenChange('colorBorder', e.target.value)}
                    slotProps={{
                      inputLabel: { shrink: true },
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Reset to default">
                              <IconButton
                                size="small"
                                onClick={() => handleResetToken('colorBorder')}
                                edge="end"
                                sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                              >
                                <RestartAltIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <TextField
                    label="Link Color"
                    type="color"
                    value={themeConfig.token?.colorLink || defaultTokenValues.colorLink}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTokenChange('colorLink', e.target.value)}
                    slotProps={{
                      inputLabel: { shrink: true },
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Reset to default">
                              <IconButton
                                size="small"
                                onClick={() => handleResetToken('colorLink')}
                                edge="end"
                                sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                              >
                                <RestartAltIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </FormControl>
              </Stack>
              
              <Stack direction="row" spacing={2}>
                <FormControl sx={{ flex: 1 }}>
                  <TextField
                    label="Secondary Text"
                    type="color"
                    value={themeConfig.token?.colorTextSecondary || defaultTokenValues.colorTextSecondary}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTokenChange('colorTextSecondary', e.target.value)}
                    slotProps={{
                      inputLabel: { shrink: true },
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Reset to default">
                              <IconButton
                                size="small"
                                onClick={() => handleResetToken('colorTextSecondary')}
                                edge="end"
                                sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                              >
                                <RestartAltIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </FormControl>
                <FormControl sx={{ flex: 3 }}>
                  {/* Placeholder to maintain grid alignment */}
                </FormControl>
              </Stack>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Typography</Typography>
              <Stack direction="row" spacing={2}>
                <FormControl sx={{ width: 180 }}>
                  <InputLabel id="font-family-label">Font Family</InputLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Select
                      labelId="font-family-label"
                      value={themeConfig.token?.fontFamily || defaultTokenValues.fontFamily}
                      onChange={(e: SelectChangeEvent) => handleTokenChange('fontFamily', e.target.value)}
                      label="Font Family"
                      sx={{ flex: 1 }}
                    
                  >
                    {fontFamilies.map((font) => (
                      <MenuItem key={font} value={font}>
                        <span style={{ fontFamily: font }}>{font.split(',')[0]}</span>
                      </MenuItem>
                    ))}
                  </Select>
                    <Tooltip title="Reset to default">
                      <IconButton
                        size="small"
                        onClick={() => handleResetToken('fontFamily')}
                        sx={{ opacity: 0.5, '&:hover': { opacity: 1 }, ml: 1 }}
                      >
                        <RestartAltIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </FormControl>
                <FormControl sx={{ width: 120 }}>
                  <TextField
                    label="Font Size (px)"
                    type="number"
                    style={{marginTop: 0}}
                    value={themeConfig.token?.fontSize || defaultTokenValues.fontSize}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTokenChange('fontSize', parseInt(e.target.value, 10))}
                    inputProps={{ min: 8, max: 24, step: 1 }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Reset to default">
                              <IconButton
                                size="small"
                                onClick={() => handleResetToken('fontSize')}
                                edge="end"
                                sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                              >
                                <RestartAltIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </FormControl>
                <FormControl sx={{ width: 120 }}>
                  <TextField
                    label="Line Height"
                    type="number"
                    style={{marginTop: 0}}
                    value={themeConfig.token?.lineHeight || defaultTokenValues.lineHeight}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTokenChange('lineHeight', parseFloat(e.target.value))}
                    inputProps={{ min: 1, max: 3, step: 0.1 }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Reset to default">
                              <IconButton
                                size="small"
                                onClick={() => handleResetToken('lineHeight')}
                                edge="end"
                                sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                              >
                                <RestartAltIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </FormControl>
                <FormControl sx={{ width: 120 }}>
                  <TextField
                    label="Font Weight"
                    type="number"
                    style={{marginTop: 0}}
                    value={themeConfig.token?.fontWeightStrong || defaultTokenValues.fontWeightStrong}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTokenChange('fontWeightStrong', parseInt(e.target.value, 10))}
                    inputProps={{ min: 400, max: 900, step: 100 }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Reset to default">
                              <IconButton
                                size="small"
                                onClick={() => handleResetToken('fontWeightStrong')}
                                edge="end"
                                sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                              >
                                <RestartAltIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </FormControl>
              </Stack>

              
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Spacing & Sizing</Typography>
              <Stack direction="row" spacing={2}>
                <FormControl sx={{ width: 150 }}>
                  <TextField
                    label="Border Radius (px)"
                    type="number"
                    value={themeConfig.token?.borderRadius || defaultTokenValues.borderRadius}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTokenChange('borderRadius', parseInt(e.target.value, 10))}
                    inputProps={{ min: 0, max: 24, step: 1 }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Reset to default">
                              <IconButton
                                size="small"
                                onClick={() => handleResetToken('borderRadius')}
                                edge="end"
                                sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                              >
                                <RestartAltIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </FormControl>
                <FormControl sx={{ width: 150 }}>
                  <TextField
                    label="Control Height (px)"
                    type="number"
                    value={themeConfig.token?.controlHeight || defaultTokenValues.controlHeight}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTokenChange('controlHeight', parseInt(e.target.value, 10))}
                    inputProps={{ min: 24, max: 48, step: 1 }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Reset to default">
                              <IconButton
                                size="small"
                                onClick={() => handleResetToken('controlHeight')}
                                edge="end"
                                sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                              >
                                <RestartAltIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </FormControl>
                <FormControl sx={{ width: 150 }}>
                  <TextField
                    label="Line Width (px)"
                    type="number"
                    value={themeConfig.token?.lineWidth || defaultTokenValues.lineWidth}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTokenChange('lineWidth', parseInt(e.target.value, 10))}
                    inputProps={{ min: 1, max: 5, step: 1 }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Reset to default">
                              <IconButton
                                size="small"
                                onClick={() => handleResetToken('lineWidth')}
                                edge="end"
                                sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                              >
                                <RestartAltIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
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
