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
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

export default function SongScreen() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    
    // Search/Filter states
    const [searchTitle, setSearchTitle] = useState('');
    const [searchArtist, setSearchArtist] = useState('');
    const [searchYear, setSearchYear] = useState('');
    const [sortBy, setSortBy] = useState('title');
    const [sortOrder, setSortOrder] = useState('asc');
    
    // Modal states
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedSong, setSelectedSong] = useState(null);
    
    // Form states
    const [songTitle, setSongTitle] = useState('');
    const [songArtist, setSongArtist] = useState('');
    const [songYear, setSongYear] = useState('');
    const [songYoutubeId, setSongYoutubeId] = useState('');

    useEffect(() => {
        store.loadSongs();
        // eslint-disable-next-line
    }, []);

    const handleOpenAdd = () => {
        setSongTitle('');
        setSongArtist('');
        setSongYear('');
        setSongYoutubeId('');
        setAddDialogOpen(true);
    }

    const handleAdd = async () => {
        const year = parseInt(songYear);
        if (songTitle && songArtist && year && songYoutubeId) {
            await store.createSong(songTitle, songArtist, year, songYoutubeId);
            setAddDialogOpen(false);
        }
    }

    const handleOpenEdit = (song) => {
        setSelectedSong(song);
        setSongTitle(song.title);
        setSongArtist(song.artist);
        setSongYear(song.year.toString());
        setSongYoutubeId(song.youtubeId);
        setEditDialogOpen(true);
    }

    const handleEdit = async () => {
        if (selectedSong) {
            const year = parseInt(songYear);
            if (songTitle && songArtist && year && songYoutubeId) {
                await store.updateSong(selectedSong._id, songTitle, songArtist, year, songYoutubeId);
                setEditDialogOpen(false);
            }
        }
    }

    const handleOpenDelete = (song) => {
        setSelectedSong(song);
        setDeleteDialogOpen(true);
    }

    const handleDelete = async () => {
        if (selectedSong) {
            await store.deleteSong(selectedSong._id);
            setDeleteDialogOpen(false);
        }
    }

    // Filter and sort songs
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
    }

    const filteredSongs = getFilteredSongs();

    return (
        <Box sx={{ padding: 3 }}>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3
            }}>
                <Typography variant="h5" sx={{ color: 'white' }}>
                    Song Catalog ({filteredSongs.length} songs)
                </Typography>
                {auth.loggedIn && (
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={handleOpenAdd}
                    >
                        + Add Song
                    </Button>
                )}
            </Box>

            {/* Search/Filter Box */}
            <Box sx={{ bgcolor: 'white', borderRadius: 2, padding: 2, mb: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            label="Search Title"
                            value={searchTitle}
                            onChange={(e) => setSearchTitle(e.target.value)}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            label="Search Artist"
                            value={searchArtist}
                            onChange={(e) => setSearchArtist(e.target.value)}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <TextField
                            fullWidth
                            label="Year"
                            value={searchYear}
                            onChange={(e) => setSearchYear(e.target.value)}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                label="Sort By"
                            >
                                <MenuItem value="title">Title</MenuItem>
                                <MenuItem value="artist">Artist</MenuItem>
                                <MenuItem value="year">Year</MenuItem>
                                <MenuItem value="listens">Listens</MenuItem>
                                <MenuItem value="playlists">Playlists</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Order</InputLabel>
                            <Select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                label="Order"
                            >
                                <MenuItem value="asc">Ascending</MenuItem>
                                <MenuItem value="desc">Descending</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>

            {/* Songs List */}
            {filteredSongs.length === 0 ? (
                <Box sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    padding: 4,
                    textAlign: 'center'
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
                <List sx={{ bgcolor: 'white', borderRadius: 2 }}>
                    {filteredSongs.map((song) => {
                        const isOwner = auth.loggedIn && auth.user && song.addedBy === auth.user._id;
                        
                        return (
                            <ListItem
                                key={song._id}
                                sx={{
                                    borderBottom: '1px solid #e0e0e0',
                                    '&:last-child': { borderBottom: 'none' }
                                }}
                            >
                                <ListItemText
                                    primary={song.title}
                                    secondary={`${song.artist} • ${song.year} • Listens: ${song.numListens || 0} • In ${song.numPlaylists || 0} playlist(s)`}
                                />
                                {isOwner && (
                                    <>
                                        <IconButton
                                            edge="end"
                                            aria-label="edit"
                                            sx={{ mr: 1 }}
                                            onClick={() => handleOpenEdit(song)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={() => handleOpenDelete(song)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </>
                                )}
                            </ListItem>
                        );
                    })}
                </List>
            )}

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