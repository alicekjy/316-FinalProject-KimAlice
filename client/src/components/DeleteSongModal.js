import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box'
export default function DeleteSongModal({
    open,
    songTitle = '',
    onConfirm,
    onClose
}) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
        PaperProps={{
            sx: {
                minHeight: 320,
                display: 'flex',
                flexDirection: 'column',
            }
        }}>
            <DialogTitle sx={{ bgcolor: '#205697', color: 'white',
                fontWeight: 'bold', textAlign: 'center' }}>
                Delete song?
            </DialogTitle>
            <DialogContent sx={{ bgcolor: '#f5f9ff' , display: 'flex', flexDirection: 'column',
                alignItems:'center', justifyContent: 'center' }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                    Are you sure you want to delete the "{songTitle}" song?
                </Typography>
                <Typography variant="body2"  align = "center" color="text.secondary" sx={{ mb: 2 , 
                fontSize: '0.62rem'}}>
                    Doing so means it will be permanently removed.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                    <Button 
                        variant="contained" 
                        sx={{ bgcolor: '#205697', '&:hover': { bgcolor: '#41648e' }, minWidth: 140 }}
                        onClick={onConfirm}
                    >
                        Delete Song
                    </Button>
                    <Button 
                        variant="contained" 
                        sx={{ bgcolor: '#424242', '&:hover': { bgcolor: '#2c2c2c' }, minWidth: 140 }}
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}