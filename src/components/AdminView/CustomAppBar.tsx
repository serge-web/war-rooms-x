import { AppBar, Button, AppBarProps } from 'react-admin'
import { Typography, Box } from '@mui/material'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'

const CustomAppBar = (props: AppBarProps) => {
  return (
    <AppBar {...props}>
      <Box flex={1} display="flex" justifyContent="space-between">
        <Typography variant="h6" id="react-admin-title"></Typography>
        <Box display="flex" alignItems="center">
          <Button
            label="Logout"
            startIcon={<ExitToAppIcon />}
            color="inherit"
            onClick={() => {
              // Logout functionality will be implemented later
              console.log('Logout clicked')
            }}
          />
        </Box>
      </Box>
    </AppBar>
  )
}

export default CustomAppBar
