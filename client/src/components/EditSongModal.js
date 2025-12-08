import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

export default function EditSongModal({
    open, title ='', artist ='', year='', youtubeId='', onChange, onCancel, onSave
}) {
    const handleClear = (field) => (event) => {
        event.preventDefault();
        event.stopPropagation();
        onChange?.({ field, value: '' });
    };
    return (
        <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ bgcolor: '#205697', color: 'white', fontWeight: '800', fontSize: '1.4rem'}}>
                Edit Song
            </DialogTitle>
            <DialogContent sx={{ bgcolor: '#f5f9ff', py: 3 , mb:2, mt:3}}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        fullWidth
                        placeholder="Title"
                        value={title}
                        onChange={(e) => onChange?.({ field: 'title', value: e.target.value })}
                        sx={{ bgcolor: '#e8f0fb' }}
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
                        placeholder="Artist"
                        value={artist}
                        onChange={(e) => onChange?.({ field: 'artist', value: e.target.value })}
                        sx={{ bgcolor: '#e8f0fb' }}
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
                        placeholder="Year"
                        value={year}
                        onChange={(e) => onChange?.({ field: 'year', value: e.target.value })}
                        sx={{ bgcolor: '#e8f0fb' }}
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
                        placeholder="YouTube Id"
                        value={youtubeId}
                        onChange={(e) => onChange?.({ field: 'youtubeId', value: e.target.value })}
                        sx={{ bgcolor: '#e8f0fb' }}
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
            <DialogActions sx={{ bgcolor: '#205697', pb: 2, pr: 3 }}>
                <Button 
                    variant="contained" 
                    sx={{ bgcolor: '#424242', '&:hover': { bgcolor: '#2c2c2c' } }}
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button 
                    variant="contained" 
                    sx={{ bgcolor: '#537fb5', '&:hover': { bgcolor: '#41648e' } }}
                    onClick={onSave}
                >
                    Complete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
