import { useEffect, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import LoopIcon from '@mui/icons-material/Loop';

export default function PlayPlaylistModal({
    open,
    playlist,
    currentSongIndex,
    onSelectSong,
    onClose,
    onPrev,
    onNext,
    isPlaying,
    onTogglePlay,
    repeatAll,
    onToggleRepeat,
    ownerName: ownerNameProp,
    ownerAvatar: ownerAvatarProp
}) {
    const songs = playlist?.songs || [];
    const currentSong = songs[currentSongIndex] || null;

    const ownerName = ownerNameProp || playlist?.owner?.username || playlist?.ownerName || playlist?.ownerEmail || playlist?.owner?.email || '';
    const ownerAvatar = ownerAvatarProp || playlist?.owner?.avatar || playlist?.ownerAvatar || playlist?.owner?.avatarUrl || playlist?.owner?.profileImage || playlist?.owner?.image;

    const videoId = currentSong?.youtubeId;
    const playerRef = useRef(null);
    const playerReadyRef = useRef(false);
    const containerRef = useRef(null);
    const destroyPlayer = () => {
        if (playerRef.current) {
            try {
                playerRef.current.destroy();
            } catch (e) {

            }
            playerRef.current = null;
            playerReadyRef.current = false;
        }
    };

    // load YouTube API // create player once modal opens
    useEffect(() => {
        let cancelled = false;       

        if (!open || !videoId) {
            destroyPlayer();
            return;
        }

        const setupPlayer = () => {
            if (cancelled) return;
            if (!containerRef.current) {
                requestAnimationFrame(setupPlayer);
                return;
            }
            if (!(window.YT && window.YT.Player)) {
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                window.onYouTubeIframeAPIReady = () => {
                    if (!cancelled) setupPlayer();
                };
                document.body.appendChild(tag);
                return;
            }
            destroyPlayer();
            playerRef.current = new window.YT.Player(containerRef.current, {
                height: '100%',
                width: '100%',
                videoId: videoId || '',
                playerVars: { origin: window.location.origin, rel: 0, modestbranding: 1, enablejsapi: 1 },
                events: {
                    onReady: (event) => {
                        if(cancelled) return;
                        playerReadyRef.current = true;
                        if (isPlaying) event.target.playVideo();
                    }
                }
            });
        };

        setupPlayer();

        return () => {
            cancelled = true;
            destroyPlayer();
        };

    }, [open, videoId]);

    // respond to video changes
    useEffect(() => {
        if (!playerReadyRef.current || !playerRef.current || !videoId) return;
        playerRef.current.loadVideoById(videoId);
        if (!isPlaying) {
            playerRef.current.pauseVideo();
        }
    }, [videoId]);

    // respond to play/pause
    useEffect(() => {
        if (!playerReadyRef.current || !playerRef.current) return;
        if (isPlaying) {
            playerRef.current.playVideo();
        } else {
            playerRef.current.pauseVideo();
        }
    }, [isPlaying]);

    
    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ bgcolor: '#205697', color: 'white', fontWeight: 700 , fontSize: '2rem'}}>
                Play Playlist
            </DialogTitle>
            <DialogContent sx={{ bgcolor: '#f5f9ff', minHeight: 480, pt: 6, pb:3 }}>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } ,mt:3 }}>
                    <Box sx={{ flex: 1, bgcolor: '#d3e1ee', borderRadius: 1, border: '1px solid #d3e1ee', p: 2, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 , mt :3}}>
                            <Avatar src={ownerAvatar || undefined} sx={{ bgcolor: '#e3f2fd', color: '#0d47a1' }}>
                                {!ownerAvatar && ownerName ? ownerName.substring(0, 2).toUpperCase() : ''}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800 , fontSize: '1.4rem'}}>
                                    {playlist?.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {ownerName}
                                </Typography>
                            </Box>
                        </Box>
                        <List dense>
                            {songs.length === 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    No songs in this playlist.
                                </Typography>
                            )}
                            {songs.map((song, idx) => (
                                <ListItem
                                    key={song._id || idx}
                                    button
                                    selected={idx === currentSongIndex}
                                    onClick={() => onSelectSong(idx)}
                                    sx={{
                                        mb: 1,
                                        borderRadius: 1,
                                        bgcolor: idx === currentSongIndex ? '#a6c9eb' : 'transparent'
                                    }}
                                >
                                    <ListItemText
                                        primaryTypographyProps={{ sx: { fontWeight: 600 , fontSize: '0.87rem'} }}
                                        primary={`${idx + 1}. ${song.title} by ${song.artist} (${song.year})`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ position: 'relative', paddingTop: '56.25%', borderRadius: 1, overflow: 'hidden', border: '1px solid #d2c084', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', bgcolor: 'black' }}>
                            <Box
                                    ref={containerRef}
                                    sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Tooltip title="Repeat playlist">
                                <IconButton
                                    onClick={onToggleRepeat}
                                    sx={{ bgcolor: repeatAll ? '#537fb5' : '#e0e0e0', color: repeatAll ? 'white' : '#333', '&:hover': { bgcolor: repeatAll ? '#41648e' : '#d6d6d6' } }}
                                >
                                    <LoopIcon />
                                </IconButton>
                            </Tooltip>
                            <IconButton
                                onClick={onPrev}
                                sx={{ bgcolor: '#e0e0e0', '&:hover': { bgcolor: '#d6d6d6' } }}
                            >
                                <SkipPreviousIcon />
                            </IconButton>
                            <IconButton
                                onClick={onTogglePlay}
                                sx={{ bgcolor: '#537fb5', color: 'white', '&:hover': { bgcolor: '#41648e' } }}
                            >
                                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                            </IconButton>
                            <IconButton
                                onClick={onNext}
                                sx={{ bgcolor: '#e0e0e0', '&:hover': { bgcolor: '#d6d6d6' } }}
                            >
                                <SkipNextIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ bgcolor: '#205697', pb: 2, pr: 3 }}>
                <Button 
                    variant="contained" 
                    sx={{ bgcolor: '#537fb5', '&:hover': { bgcolor: '#41648e' } }}
                    onClick={onClose}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
