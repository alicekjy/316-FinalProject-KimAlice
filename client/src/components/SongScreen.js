import { useContext, useEffect, useState } from 'react';
import AuthContext from '../auth';
import GlobalStoreContext from '../store';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import AppBanner from './AppBanner';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import Menu from '@mui/material/Menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function SongScreen() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    
    const [searchTitle, setSearchTitle] = useState('');
    const [searchArtist, setSearchArtist] = useState('');
    const [searchYear, setSearchYear] = useState('');
    const [sortBy, setSortBy] = useState('title');
    const [sortOrder, setSortOrder] = useState('asc');
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedSong, setSelectedSong] = useState(null);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [playlistAnchor, setPlaylistAnchor] = useState(null);
    const [menuSong, setMenuSong] = useState(null);

    const [songTitle, setSongTitle] = useState('');
    const [songArtist, setSongArtist] = useState('');
    const [songYear, setSongYear] = useState('');
    const [songYoutubeId, setSongYoutubeId] = useState('');

    useEffect(() => {
        store.loadSongs();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        const filtered = getFilteredSongs();
        if (filtered.length > 0) {
            setSelectedSong(filtered[0]);
        } else {
            setSelectedSong(null);
        }
        // eslint-disable-next-line
    }, [store.songs, searchTitle, searchArtist, searchYear, sortBy, sortOrder]);

    const handleOpenAdd = () => {
        setSongTitle('');
        setSongArtist('');
        setSongYear('');
        setSongYoutubeId('');
        setAddDialogOpen(true);
    };

    const handleAdd = async () => {
        const year = parseInt(songYear);
        if (songTitle && songArtist && year && songYoutubeId) {
            await store.createSong(songTitle, songArtist, year, songYoutubeId);
            setAddDialogOpen(false);
        }
    };

    const handleOpenEdit = (song) => {
        setSelectedSong(song);
        setSongTitle(song.title);
        setSongArtist(song.artist);
        setSongYear(song.year.toString());
        setSongYoutubeId(song.youtubeId);
        setEditDialogOpen(true);
    };

    const handleEdit = async () => {
        if (selectedSong) {
            const year = parseInt(songYear);
            if (songTitle && songArtist && year && songYoutubeId) {
                await store.updateSong(selectedSong._id, songTitle, songArtist, year, songYoutubeId);
                setEditDialogOpen(false);
            }
        }
    };

    const handleOpenDelete = (song) => {
        setSelectedSong(song);
        setDeleteDialogOpen(true);
    };

    const handleOpenMenu = (song, event) => {
        event.stopPropagation();
        setMenuSong(song);
        setMenuAnchor(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setMenuAnchor(null);
        setPlaylistAnchor(null);
        setMenuSong(null);
    };

    const handleOpenPlaylistMenu = (event) => {
        event.stopPropagation();
        setPlaylistAnchor(event.currentTarget);
    };

    const handleAddToPlaylist = async (playlistId) => {
        if (!menuSong) return;
        try {
            const api = require('../store/requests').default;
            await api.addSongToPlaylist(playlistId, menuSong._id);
            handleCloseMenu();
        } catch (error) {
            console.error('Failed to add song to playlist:', error);
        }
    };

    const handleDelete = async () => {
        if (selectedSong) {
            await store.deleteSong(selectedSong._id);
            setDeleteDialogOpen(false);
        }
    };

    const getFilteredSongs = () => {
        let filtered = [...store.songs];
        
        if (searchTitle) {
            filtered = filtered.filter(song => 
                song.title.toLowerCase().includes(searchTitle.toLowerCase())
            );
        }
        if (searchArtist) {
            filtered = filtered.filter(song => 
                song.artist.toLowerCase().includes(searchArtist.toLowerCase())
            );
        }
        if (searchYear) {
            filtered = filtered.filter(song => 
                song.year.toString().includes(searchYear)
            );
        }

        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'artist':
                    comparison = a.artist.localeCompare(b.artist);
                    break;
                case 'year':
                    comparison = a.year - b.year;
                    break;
                case 'listens':
                    comparison = (a.numListens || 0) - (b.numListens || 0);
                    break;
                case 'playlists':
                    comparison = (a.numPlaylists || 0) - (b.numPlaylists || 0);
                    break;
                default:
                    comparison = 0;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    };

    const filteredSongs = getFilteredSongs();
    const sortValue = `${sortBy}-${sortOrder}`;

    return (
        <Box
            sx={{
                padding: 3,
                minHeight: '100vh',
                bgcolor: '#e6f0ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Box
                sx={{
                    bgcolor: '#f5f9ff',
                    border: '2px solid #b5c7e0',
                    borderRadius: 1,
                    boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
                    width: 'calc(100% - 48px)',
                    maxWidth: '1200px',
                    minHeight: '700px',
                    margin: '0 auto',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3
                }}
            >
                <AppBanner 
                    title="The Playlister" 
                    mode="nav"
                    navButtons={[
                        { label: 'Playlists', to: '/playlists', bgcolor: '#e3f2fd', color: '#0d47a1', hoverBg: '#d0e6ff' },
                        { label: 'Song Catalog', to: '/songs', bgcolor: '#0d47a1', color: 'white', hoverBg: '#1565c0' }
                    ]}
                />

                <Box sx={{ padding: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 3, flexGrow: 1 }}>
                        {/* Left column filters */}
                        <Box sx={{ flex: 1, maxWidth: 360 }}>
                            <Typography variant="h4" sx={{ color: '#1565c0', fontWeight: 800, mb: 2 }}>
                                Songs Catalog
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    placeholder="by Title"
                                    value={searchTitle}
                                    onChange={(e) => setSearchTitle(e.target.value)}
                                    size="small"
                                    sx={{ bgcolor: '#e8f0fb' }}
                                />
                                <TextField
                                    fullWidth
                                    placeholder="by Artist"
                                    value={searchArtist}
                                    onChange={(e) => setSearchArtist(e.target.value)}
                                    size="small"
                                    sx={{ bgcolor: '#e8f0fb' }}
                                />
                                <TextField
                                    fullWidth
                                    placeholder="by Year"
                                    value={searchYear}
                                    onChange={(e) => setSearchYear(e.target.value)}
                                    size="small"
                                    sx={{ bgcolor: '#e8f0fb' }}
                                />
                                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                    <Button 
                                        variant="contained" 
                                        startIcon={<SearchIcon />}
                                        sx={{ bgcolor: '#205697', '&:hover': { bgcolor: '#1565c0' }, flex: 1 }}
                                        onClick={() => setSearchTitle(searchTitle)}
                                    >
                                        Search
                                    </Button>
                                    <Button 
                                        variant="contained" 
                                        startIcon={<ClearIcon />}
                                        sx={{ bgcolor: '#205697', '&:hover': { bgcolor: '#1565c0' }, flex: 1 }}
                                        onClick={() => {
                                            setSearchTitle('');
                                            setSearchArtist('');
                                            setSearchYear('');
                                        }}
                                    >
                                        Clear
                                    </Button>
                                </Box>
                            </Box>

                            {selectedSong?.youtubeId && (
                                <Box sx={{ mt: 3 }}>
                                    <Box sx={{ position: 'relative', paddingTop: '56.25%', borderRadius: 1, overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                                        <iframe
                                            title={selectedSong.title}
                                            src={`https://www.youtube.com/embed/${selectedSong.youtubeId}`}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                        />
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        <Divider orientation="vertical" flexItem sx={{ borderColor: '#d6cfcf' }} />

                        {/* Right column list */}
                        <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="body1">Sort:</Typography>
                                    <FormControl size="small" sx={{ minWidth: 220 }}>
                                        <InputLabel>Sort</InputLabel>
                                        <Select
                                            value={sortValue}
                                            label="Sort"
                                            onChange={(e) => {
                                                const [by, order] = e.target.value.split('-');
                                                setSortBy(by);
                                                setSortOrder(order);
                                            }}
                                        >
                                            <MenuItem value="listens-desc">Listens (Hi-Lo)</MenuItem>
                                            <MenuItem value="listens-asc">Listens (Lo-Hi)</MenuItem>
                                            <MenuItem value="title-asc">Title (A-Z)</MenuItem>
                                            <MenuItem value="title-desc">Title (Z-A)</MenuItem>
                                            <MenuItem value="artist-asc">Artist (A-Z)</MenuItem>
                                            <MenuItem value="artist-desc">Artist (Z-A)</MenuItem>
                                            <MenuItem value="year-desc">Year (Hi-Lo)</MenuItem>
                                            <MenuItem value="year-asc">Year (Lo-Hi)</MenuItem>
                                            <MenuItem value="playlists-desc">Playlists (Hi-Lo)</MenuItem>
                                            <MenuItem value="playlists-asc">Playlists (Lo-Hi)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {filteredSongs.length} Song{filteredSongs.length === 1 ? '' : 's'}
                                </Typography>
                            </Box>

                            {auth.loggedIn && (
                                <Box sx={{ textAlign: 'right' }}>
                                    <Button 
                                        variant="contained" 
                                        sx={{ bgcolor: '#205697', '&:hover': { bgcolor: '#1565c0' } }}
                                        onClick={handleOpenAdd}
                                    >
                                        + Add Song
                                    </Button>
                                </Box>
                            )}

                            {filteredSongs.length === 0 ? (
                                <Box sx={{
                                    bgcolor: 'white',
                                    borderRadius: 2,
                                    padding: 4,
                                    textAlign: 'center',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                                }}>
                                    <Typography variant="h6" sx={{ mb: 2 }}>
                                        No songs found
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {store.songs.length === 0 
                                            ? (auth.loggedIn ? 'Click "Add Song" to add the first song!' : 'Login to add songs')
                                            : 'Try different search criteria'}
                                    </Typography>
                                </Box>
                            ) : (
                                <List sx={{ bgcolor: '#fff7d6', borderRadius: 2, boxShadow: '0 2px 6px rgba(0,0,0,0.12)', border: '1px solid #d2c084', p: 1 }}>
                                    {filteredSongs.map((song, index) => {
                                        const isOwner = auth.loggedIn && auth.user && song.addedBy === auth.user._id;
                                        
                                        return (
                                            <ListItem
                                                key={song._id}
                                                onClick={() => setSelectedSong(song)}
                                                sx={{
                                                    borderBottom: '1px solid #e0e0e0',
                                                    '&:last-child': { borderBottom: 'none' },
                                                    cursor: 'pointer',
                                                    '&:hover': { bgcolor: '#f5edc6' },
                                                    bgcolor: '#f7c66f',
                                                    border: '1px solid #e0a63b',
                                                    mb: 1,
                                                    borderRadius: 1,
                                                    pr: 6
                                                }}
                                                secondaryAction={
                                                    <IconButton
                                                        edge="end"
                                                        aria-label="more"
                                                        onClick={(e) => handleOpenMenu(song, e)}
                                                    >
                                                        <MoreVertIcon />
                                                    </IconButton>
                                                }
                                            >
                                                <ListItemText
                                                    primaryTypographyProps={{ sx: { fontWeight: 700 } }}
                                                    primary={`${index + 1}. ${song.title} by ${song.artist} (${song.year})`}
                                                    secondary={`Listens: ${song.numListens || 0} • Playlists: ${song.numPlaylists || 0}`}
                                                />
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            )}
                        </Box>
                    </Box>
                </Box>

            </Box>

            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                MenuListProps={{ dense: true }}
            >
                <MenuItem onClick={handleOpenPlaylistMenu}>Add to Playlist</MenuItem>
                <MenuItem onClick={() => { if (menuSong) handleOpenEdit(menuSong); handleCloseMenu(); }}>Edit Song</MenuItem>
                <MenuItem onClick={() => { if (menuSong) handleOpenDelete(menuSong); handleCloseMenu(); }}>Remove from Catalog</MenuItem>
            </Menu>

            <Menu
                anchorEl={playlistAnchor}
                open={Boolean(playlistAnchor)}
                onClose={() => setPlaylistAnchor(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                MenuListProps={{ dense: true }}
                PaperProps={{ sx: { maxHeight: 240 } }}
            >
                {(store.playlists || []).map((plist) => (
                    <MenuItem key={plist._id} onClick={() => handleAddToPlaylist(plist._id)}>
                        {plist.name}
                    </MenuItem>
                ))}
                {(!store.playlists || store.playlists.length === 0) && (
                    <MenuItem disabled>No playlists</MenuItem>
                )}
            </Menu>

            {/* Add Song Modal */}
            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Song</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Title"
                        value={songTitle}
                        onChange={(e) => setSongTitle(e.target.value)}
                        margin="normal"
                        autoFocus
                    />
                    <TextField
                        fullWidth
                        label="Artist"
                        value={songArtist}
                        onChange={(e) => setSongArtist(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Year"
                        type="number"
                        value={songYear}
                        onChange={(e) => setSongYear(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="YouTube Video ID"
                        value={songYoutubeId}
                        onChange={(e) => setSongYoutubeId(e.target.value)}
                        margin="normal"
                        helperText="Example: dQw4w9WgXcQ (from youtube.com/watch?v=dQw4w9WgXcQ)"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAdd} variant="contained">Add Song</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Song Modal */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Song</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Title"
                        value={songTitle}
                        onChange={(e) => setSongTitle(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Artist"
                        value={songArtist}
                        onChange={(e) => setSongArtist(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Year"
                        type="number"
                        value={songYear}
                        onChange={(e) => setSongYear(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="YouTube Video ID"
                        value={songYoutubeId}
                        onChange={(e) => setSongYoutubeId(e.target.value)}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleEdit} variant="contained">Save Changes</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Song Modal */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Song</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete "{selectedSong?.title}"?
                    </Typography>
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        This will remove it from all playlists and cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
