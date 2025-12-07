import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';

export default function YouTubePlayer({ playlist, currentSongIndex, onSongChange }) {
    const [player, setPlayer] = useState(null);
    const [playerReady, setPlayerReady] = useState(false);

    useEffect(() => {
        // Load YouTube IFrame API
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = () => {
            console.log('YouTube API Ready');
            initPlayer();
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        }

        return () => {
            if (player && player.destroy) {
                try {
                    player.destroy();
                } catch (e) {
                    console.log('Player already destroyed');
                }
            }
        };
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (playerReady && player && player.loadVideoById && playlist && playlist.songs && playlist.songs.length > 0) {
            const song = playlist.songs[currentSongIndex];
            if (song && song.youtubeId) {
                player.loadVideoById(song.youtubeId);
            }
        }
        // eslint-disable-next-line
    }, [currentSongIndex, playerReady]);

    const initPlayer = () => {
        if (!playlist || !playlist.songs || playlist.songs.length === 0) return;

        const song = playlist.songs[currentSongIndex || 0];
        if (!song || !song.youtubeId) return;

        // Destroy existing player if any
        const existingIframe = document.getElementById('youtube-player');
        if (existingIframe && existingIframe.tagName === 'IFRAME') {
            existingIframe.remove();
        }

        // Create new div for player
        const playerDiv = document.createElement('div');
        playerDiv.id = 'youtube-player';
        const container = document.getElementById('youtube-player-container');
        if (container) {
            container.appendChild(playerDiv);
        }

        try {
            const newPlayer = new window.YT.Player('youtube-player', {
                height: '390',
                width: '100%',
                videoId: song.youtubeId,
                playerVars: {
                    autoplay: 0,
                    controls: 1,
                    modestbranding: 1,
                    rel: 0
                },
                events: {
                    onReady: (event) => {
                        console.log('Player ready!');
                        setPlayer(event.target);
                        setPlayerReady(true);
                    },
                    onStateChange: (event) => {
                        console.log('Player state:', event.data);
                        // Auto-play next when video ends
                        if (event.data === window.YT.PlayerState.ENDED) {
                            handleNext();
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error creating YouTube player:', error);
        }
    };

    const handlePlayPause = () => {
        if (!player || !playerReady) {
            console.log('Player not ready');
            return;
        }

        try {
            const state = player.getPlayerState();
            console.log('Current state:', state);
            
            if (state === 1) { // Playing
                player.pauseVideo();
            } else { // Paused or other
                player.playVideo();
            }
        } catch (error) {
            console.error('Error toggling play/pause:', error);
        }
    };

    const handleNext = () => {
        if (!playlist || !playlist.songs || playlist.songs.length === 0) return;

        const nextIndex = (currentSongIndex + 1) % playlist.songs.length;
        if (onSongChange) {
            onSongChange(nextIndex);
        }
    };

    const handlePrevious = () => {
        if (!playlist || !playlist.songs || playlist.songs.length === 0) return;

        const prevIndex = currentSongIndex === 0 
            ? playlist.songs.length - 1 
            : currentSongIndex - 1;
        if (onSongChange) {
            onSongChange(prevIndex);
        }
    };

    if (!playlist || !playlist.songs || playlist.songs.length === 0) {
        return (
            <Box sx={{ 
                bgcolor: 'white', 
                borderRadius: 2, 
                padding: 3,
                textAlign: 'center'
            }}>
                <Typography variant="body1" color="text.secondary">
                    Add songs to this playlist to start playing!
                </Typography>
            </Box>
        );
    }

    const currentSong = playlist.songs[currentSongIndex] || playlist.songs[0];

    return (
        <Box sx={{ bgcolor: 'white', borderRadius: 2, padding: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Now Playing
            </Typography>

            <Box sx={{ mb: 2 }} id="youtube-player-container">
                {/* YouTube player will be inserted here */}
            </Box>

            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 2
            }}>
                <IconButton 
                    onClick={handlePrevious} 
                    size="large"
                    disabled={!playerReady}
                >
                    <SkipPreviousIcon fontSize="large" />
                </IconButton>

                <IconButton 
                    onClick={handlePlayPause} 
                    size="large"
                    disabled={!playerReady}
                    sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                            bgcolor: 'primary.dark'
                        },
                        mx: 2
                    }}
                >
                    <PlayArrowIcon fontSize="large" />
                </IconButton>

                <IconButton 
                    onClick={handleNext} 
                    size="large"
                    disabled={!playerReady}
                >
                    <SkipNextIcon fontSize="large" />
                </IconButton>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">
                    {currentSong?.title || 'Loading...'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {currentSong?.artist} • {currentSong?.year}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Song {currentSongIndex + 1} of {playlist.songs.length}
                </Typography>
                {!playerReady && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }} color="info.main">
                        Loading player...
                    </Typography>
                )}
            </Box>
        </Box>
    );
}