import React, { useState } from 'react';
import {
  AppBar,
  Box,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Avatar,
  Badge,
  Chip,
  Stack,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccountBalance as InstrumentIcon,
  AccountBalance as AccountBalanceIcon,
  Timeline as PriceIcon,
  Person as ClientIcon,
  History as AuditIcon,
  Logout,
  Settings,
  AccountCircle,
  NotificationsNone as NotificationsNoneIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  TableChart as TableChartIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Collapse, Tooltip } from '@mui/material';

const drawerWidth = 280;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [showDownstreamTab, setShowDownstreamTab] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
    setNotifLoading(true);
    // Simulate loading notifications
    setTimeout(() => {
      setNotifications([
        { id: 1, message: 'New validation rule added', time: '5 mins ago', type: 'success' },
        { id: 2, message: 'Price feed update failed', time: '10 mins ago', type: 'error' },
        { id: 3, message: 'System maintenance scheduled', time: '1 hour ago', type: 'info' },
      ]);
      setNotifLoading(false);
    }, 1000);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleProfileMenu = (path: string) => {
    handleProfileClose();
    navigate(path);
  };

  // Simulate periodic notifications check
  React.useEffect(() => {
    const interval = setInterval(() => {
      // Add notification check logic here
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Instrument Management', icon: <InstrumentIcon />, path: '/instrument-management' },
    { text: 'Price Feed Monitoring', icon: <PriceIcon />, path: '/price-feed-monitoring' },
    { text: 'Client Onboarding', icon: <ClientIcon />, path: '/client-management' },
    { text: 'SSI Data Management', icon: <ClientIcon />, path: '/ssi-management' },
    // { text: 'Reports & Analytics', icon: <ReportsIcon />, path: '/reports-analytics' }, // HIDDEN FOR NOW
    { text: 'Audit Trail', icon: <AuditIcon />, path: '/audit-trail' },
    // { text: 'Consolidated Data', icon: <TableChartIcon />, path: '/consolidated-data' },
  ];

  const downstreamSyncItem = {
    text: 'Downstream Sync',
    icon: <TableChartIcon />,
    path: '/consolidated-data',
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />;
      case 'error':
        return <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />;
      case 'info':
        return <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main' }} />;
      default:
        return <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'grey.400' }} />;
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Logo Section */}
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        height: { sm: 64 },
        px: 3,
        boxSizing: 'border-box',
        borderBottom: '1px solid',
        borderColor: 'divider',
        background: 'linear-gradient(135deg, #00AEEF 0%, #0099CC 100%)',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            p: 1, 
            borderRadius: 2, 
            bgcolor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AccountBalanceIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Reference Data
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Management System
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, p: 2 }}>
        <Typography variant="overline" sx={{ 
          color: 'text.secondary', 
          fontWeight: 600, 
          fontSize: '0.75rem',
          mb: 2,
          display: 'block'
        }}>
          Navigation
        </Typography>
        <List sx={{ p: 0 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem
                key={item.text}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'text.primary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.dark' : 'action.hover',
                    transform: 'translateX(4px)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: isActive ? 'white' : 'text.secondary',
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: isActive ? 600 : 500,
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
                {isActive && (
                  <Box sx={{ 
                    width: 4, 
                    height: 4, 
                    borderRadius: '50%', 
                    bgcolor: 'white',
                    ml: 1
                  }} />
                )}
              </ListItem>
            );
          })}
        </List>
        <Collapse in={showDownstreamTab} timeout="auto" unmountOnExit>
          <List sx={{ p: 0 }}>
            <ListItem
              key={downstreamSyncItem.text}
              onClick={() => navigate(downstreamSyncItem.path)}
              sx={{
                borderRadius: 2,
                mb: 1,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                bgcolor: location.pathname === downstreamSyncItem.path ? 'primary.main' : 'transparent',
                color: location.pathname === downstreamSyncItem.path ? 'white' : 'text.primary',
                '&:hover': {
                  bgcolor: location.pathname === downstreamSyncItem.path ? 'primary.dark' : 'action.hover',
                  transform: 'translateX(4px)',
                },
                '& .MuiListItemIcon-root': {
                  color: location.pathname === downstreamSyncItem.path ? 'white' : 'text.secondary',
                },
                '& .MuiListItemText-primary': {
                  fontWeight: location.pathname === downstreamSyncItem.path ? 600 : 500,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {downstreamSyncItem.icon}
              </ListItemIcon>
              <ListItemText primary={downstreamSyncItem.text} />
              {location.pathname === downstreamSyncItem.path && (
                <Box sx={{ 
                  width: 4, 
                  height: 4, 
                  borderRadius: '50%', 
                  bgcolor: 'white',
                  ml: 1
                }} />
              )}
            </ListItem>
          </List>
        </Collapse>
      </Box>

      {/* User Info Section */}
      <Box sx={{ flexGrow: 0, p: 2, mt: 'auto' }}>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box>
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
              KK
            </Avatar>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Kshitij Kadam
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label="Online"
                size="small"
                sx={{
                  bgcolor: 'success.main',
                  color: 'white',
                  height: 20,
                  fontSize: '0.65rem',
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Senior Analyst
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Tooltip title="Toggle Downstream Sync Tab" placement="top">
        <IconButton
          onClick={() => setShowDownstreamTab(!showDownstreamTab)}
          sx={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            color: 'text.secondary',
            bgcolor: 'action.hover',
            '&:hover': {
              bgcolor: 'action.selected',
            }
          }}
          size="small"
        >
          {showDownstreamTab ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: 'none',
          background: 'linear-gradient(135deg, #00AEEF 0%, #0099CC 100%)',
        }}
      >
        <Toolbar sx={{ px: 3 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {menuItems.find(item => item.path === location.pathname)?.text || 
               (location.pathname === downstreamSyncItem.path ? downstreamSyncItem.text : 'Dashboard')}
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} sx={{ color: 'white' }}>
            {/* Notifications */}
            <IconButton 
              color="inherit" 
              onClick={handleNotifClick}
              sx={{ 
                position: 'relative',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>
            
            <Menu
              anchorEl={notifAnchorEl}
              open={Boolean(notifAnchorEl)}
              onClose={handleNotifClose}
              PaperProps={{ 
                sx: { 
                  width: 360,
                  mt: 1,
                  borderRadius: 2,
                  boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1)'
                } 
              }}
            >
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Notifications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {notifications.length} new notifications
                </Typography>
              </Box>
              
              {notifLoading ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <CircularProgress size={24} />
                </Box>
              ) : notifications.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No notifications
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {notifications.map((n: any) => (
                    <MenuItem key={n.id} sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
                        {getNotificationIcon(n.type)}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                            {n.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {n.time}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Box>
              )}
            </Menu>

            {/* Profile Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'white' }}>
                Kshitij Kadam
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                USR123
              </Typography>
            </Box>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                onClick={handleProfileClick}
                sx={{ 
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <Avatar sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}>
                  KK
                </Avatar>
              </IconButton>
              <IconButton
                size="small"
                color="inherit"
                onClick={handleProfileClick}
                sx={{ 
                  display: { xs: 'none', sm: 'flex' },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <KeyboardArrowDownIcon />
              </IconButton>
            </Box>
            
            <Menu
              anchorEl={profileAnchorEl}
              open={Boolean(profileAnchorEl)}
              onClose={handleProfileClose}
              PaperProps={{ 
                sx: { 
                  width: 240,
                  mt: 1,
                  borderRadius: 2,
                  boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1)'
                } 
              }}
            >
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Signed in as
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Kshitij Kadam
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  kshitij.kadam@barclays
                </Typography>
              </Box>
              
              <MenuItem onClick={() => handleProfileMenu('/profile')} sx={{ py: 1.5 }}>
                <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
                <ListItemText primary="Profile" />
              </MenuItem>
              <MenuItem onClick={() => handleProfileMenu('/settings')} sx={{ py: 1.5 }}>
                <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
                <ListItemText primary="Settings" />
              </MenuItem>
              
              <Divider />
              
              <MenuItem onClick={() => handleProfileMenu('/login')} sx={{ py: 1.5 }}>
                <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                <ListItemText primary="Sign out" />
              </MenuItem>
            </Menu>
          </Stack>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 