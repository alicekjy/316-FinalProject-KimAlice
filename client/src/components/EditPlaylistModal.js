import { useEffect, useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

/**
 * edit modal for playlists: rename, reorder, remove songs with undo/redo.
 * Adding songs delegates to onAddSong.
 */
export default function EditPlaylistModal({
    open,
    playlist,
    onSave,
    onClose,
    onAddSong
}) {
    const initialName = playlist?.name || '';
    const initialSongs = useMemo(() => [...(playlist?.songs || [])], [playlist]);
    const [name, setName] = useState(initialName);
    const [songs, setSongs] = useState(initialSongs);
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [dragIndex, setDragIndex] = useState(null);

    useEffect(() => {
        setName(initialName);
        setSongs(initialSongs);
        setUndoStack([]);
        setRedoStack([]);
    }, [initialName, initialSongs, open]);

    const pushState = (nextSongs) => {
        setUndoStack((prev) => [...prev, songs]);
        setRedoStack([]);
        setSongs(nextSongs);
    };

    const handleDropReorder = (targetIndex) => {
        if (dragIndex === null || dragIndex === targetIndex) return;
        const next = [...songs];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(targetIndex, 0, moved);
        pushState(next);
        setDragIndex(null);
    };

    const handleRemove = (index) => {
        const next = songs.filter((_, i) => i !== index);
        pushState(next);
    };

    const handleDuplicate = (index) => {
        const song = songs[index];
        const copy = { ...song, _id: `${song._id || 'song'}-copy-${Date.now()}` };
        const next = [...songs];
        next.splice(index + 1, 0, copy);
        pushState(next);
    };

    const handleUndo = () => {
        setUndoStack((prev) => {
            if (prev.length === 0) return prev;
            const previous = prev[prev.length - 1];
            setRedoStack((redoPrev) => [...redoPrev, songs]);
            setSongs(previous);
            return prev.slice(0, -1);
        });
    };

    const handleRedo = () => {
        setRedoStack((prev) => {
            if (prev.length === 0) return prev;
            const nextState = prev[prev.length - 1];
            setUndoStack((undoPrev) => [...undoPrev, songs]);
            setSongs(nextState);
            return prev.slice(0, -1);
        });
    };

    const handleSave = () => {
        onSave?.(name, songs);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ bgcolor: '#205697', color: 'white' }}>
                Edit Playlist
            </DialogTitle>
            <DialogContent sx={{ bgcolor: '#f5f9ff', pt: 6, minHeight: 500 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 ,mt:3}}>
                    <TextField
                        fullWidth
                        label="Playlist Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        sx={{ bgcolor: 'white' }}
                        InputProps={{
                            endAdornment: (
                                <Tooltip title="Clear name">
                                    <IconButton size="small" onClick={() => setName('')}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )
                        }}
                    />
                    <Tooltip title="Add Song">
                        <IconButton
                            color="primary"
                            sx={{ bgcolor: '#537fb5', color: 'white', '&:hover': { bgcolor: '#537fb5' } }}
                            onClick={onAddSong}
                        >
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                </Box>

                <List sx={{ bgcolor: 'transparent', borderRadius: 1, maxHeight: 420, overflowY: 'auto' }}>
                    {songs.length === 0 && (
                        <Typography sx={{ p: 2, color: 'text.secondary' }}>
                            No songs in this playlist yet.
                        </Typography>
                    )}
                    {songs.map((song, index) => (
                        <ListItem
                            key={song._id || index}
                            draggable
                            onDragStart={() => setDragIndex(index)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDropReorder(index)}
                            sx={{
                                mb: 1,
                                px: 1,
                                py: 0.5,
                                bgcolor: '#fff7d6',
                                borderRadius: 1,
                                border: '1px solid #d2c084',
                                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                                <DragIndicatorIcon sx={{ color: '#757575' , cursor: 'grab'}} />
                                <Typography sx={{ width: 28, color: '#333', fontWeight: 700 }}>
                                    {index + 1}.
                                </Typography>
                                <ListItemText
                                    primaryTypographyProps={{ sx: { fontWeight: 600, color: '#333' } }}
                                    primary={`${song.title || 'Untitled'} by ${song.artist || ''} (${song.year || ''})`}
                                />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Tooltip title="Duplicate song">
                                        <IconButton size="small" onClick={() => handleDuplicate(index)}>
                                            <ContentCopyIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Remove song">
                                        <IconButton size="small" onClick={() => handleRemove(index)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                        </ListItem>
                    ))}
                </List>

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button
                        startIcon={<UndoIcon />}
                        variant="contained"
                        sx={{ bgcolor: '#537fb5', '&:hover': { bgcolor: '#41648e' } }}
                        onClick={handleUndo}
                        disabled={undoStack.length === 0}
                    >
                        Undo
                    </Button>
                    <Button
                        startIcon={<RedoIcon />}
                        variant="contained"
                        sx={{ bgcolor: '#537fb5', '&:hover': { bgcolor: '#41648e' } }}
                        onClick={handleRedo}
                        disabled={redoStack.length === 0}
                    >
                        Redo
                    </Button>
                </Box>
            </DialogContent>
            <DialogActions sx={{ bgcolor: '#205697', pb: 2, pr: 3 }}>
                <Button 
                    variant="contained" 
                    sx={{ bgcolor: '#537fb5', '&:hover': { bgcolor: '#41648e' } }}
                    onClick={handleSave}
                >
                    Save
                </Button>
                <Button 
                    variant="contained" 
                    sx={{ bgcolor: '#424242', '&:hover': { bgcolor: '#2c2c2c' } }}
                    onClick={onClose}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
