import { AppBar, Button, AppBarProps } from 'react-admin'
import { Typography, Box } from '@mui/material'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import { useWargame } from '../../contexts/WargameContext'

const CustomAppBar = (props: AppBarProps) => {
  const {setRaDataProvider} = useWargame()
  const handleLogout = () => {
    setRaDataProvider(undefined)
  }
  return (
    <AppBar {...props}>
      <Box flex={1} display="flex" justifyContent="space-between">
        <Typography variant="h6" id="react-admin-title"></Typography>
        <Box display="flex" alignItems="center">
          <Button
            label="Logout"
            startIcon={<ExitToAppIcon />}
            color="inherit"
            onClick={handleLogout}
          />
        </Box>
      </Box>
    </AppBar>
  )
}

export default CustomAppBar
