import {useContext, useState} from 'react';
import {Link, useHistory} from 'react-router-dom'
import AuthContext from '../auth';
import GlobalStoreContext from '../store';

import AccountCircle from '@mui/icons-material/AccountCircle';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import HomeIcon from '@mui/icons-material/Home';