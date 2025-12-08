import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

export default function AddSongModal({
    open, title = '', artist = '', year = '', youtubeId = '', onChange, onCancel, onSave
}) {
    const handleClear = (field) => (event) => {
        event.preventDefault();
        event.stopPropagation();
        onChange?.({ field, value: '' });
    };

    return (
        <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Song</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        fullWidth
                        label="Title"
                        value={title}
                        onChange={(e) => onChange?.({ field: 'title', value: e.target.value })}
                        autoFocus
                        InputProps={{
                            endAdornment: (
                                <IconButton size="small" onMouseDown={handleClear('title')} onClick={handleClear('title')}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            )
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Artist"
                        value={artist}
                        onChange={(e) => onChange?.({ field: 'artist', value: e.target.value })}
                        InputProps={{
                            endAdornment: (
                                <IconButton size="small" onMouseDown={handleClear('artist')} onClick={handleClear('artist')}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            )
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Year"
                        type="number"
                        value={year}
                        onChange={(e) => onChange?.({ field: 'year', value: e.target.value })}
                        InputProps={{
                            endAdornment: (
                                <IconButton size="small" onMouseDown={handleClear('year')} onClick={handleClear('year')}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            )
                        }}
                    />
                    <TextField
                        fullWidth
                        label="YouTube Video ID"
                        value={youtubeId}
                        onChange={(e) => onChange?.({ field: 'youtubeId', value: e.target.value })}
                        InputProps={{
                            endAdornment: (
                                <IconButton size="small" onMouseDown={handleClear('youtubeId')} onClick={handleClear('youtubeId')}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            )
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>Cancel</Button>
                <Button onClick={onSave} variant="contained">Add Song</Button>
            </DialogActions>
        </Dialog>
    );
}
