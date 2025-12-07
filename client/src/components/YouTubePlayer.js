import { useState, useEffect, useContext } from 'react';
import GlobalStoreContext from '../store';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';

export default function YouTubePlayer({ playlist }) {
    const { store } = useContext(GlobalStoreContext);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [player, setPlayer] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        // Load YouTube IFrame API
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = () => {
            initPlayer();
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        }

        return () => {
            if (player) {
                player.destroy();
            }
        };
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (player && playlist && playlist.songs.length > 0) {
            const song = playlist.songs[currentSongIndex];
            if (song && song.youtubeId) {
                player.loadVideoById(song.youtubeId);
            }
        }
        // eslint-disable-next-line
    }, [currentSongIndex, playlist]);

    const initPlayer = () => {
        if (!playlist || playlist.songs.length === 0) return;

        const song = playlist.songs[0];
        if (!song || !song.youtubeId) return;

        const newPlayer = new window.YT.Player('youtube-player', {
            height: '390',
            width: '640',
            videoId: song.youtubeId,
            playerVars: {
                autoplay: 0,
                controls: 1,
                modestbranding: 1,
                rel: 0
            },
            events: {
                onStateChange: onPlayerStateChange
            }
        });

        setPlayer(newPlayer);
    };

    const onPlayerStateChange = (event) => {
        // When video ends, play next
        if (event.data === window.YT.PlayerState.ENDED) {
            handleNext();
        }
        // Update playing state
        if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
        }
    };

    const handlePlayPause = () => {
        if (!player) return;

        if (isPlaying) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    };

    const handleNext = () => {
        if (!playlist || playlist.songs.length === 0) return;

        const nextIndex = (currentSongIndex + 1) % playlist.songs.length;
        setCurrentSongIndex(nextIndex);
    };

    const handlePrevious = () => {
        if (!playlist || playlist.songs.length === 0) return;

        const prevIndex = currentSongIndex === 0 
            ? playlist.songs.length - 1 
            : currentSongIndex - 1;
        setCurrentSongIndex(prevIndex);
    };

    if (!playlist || playlist.songs.length === 0) {
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

    const currentSong = playlist.songs[currentSongIndex];

    return (
        <Box sx={{ bgcolor: 'white', borderRadius: 2, padding: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Now Playing
            </Typography>

            <Box sx={{ mb: 2 }}>
                <div id="youtube-player"></div>
            </Box>

            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 2
            }}>
                <IconButton onClick={handlePrevious} size="large">
                    <SkipPreviousIcon fontSize="large" />
                </IconButton>

                <IconButton onClick={handlePlayPause} size="large">
                    {isPlaying ? (
                        <PauseIcon fontSize="large" />
                    ) : (
                        <PlayArrowIcon fontSize="large" />
                    )}
                </IconButton>

                <IconButton onClick={handleNext} size="large">
                    <SkipNextIcon fontSize="large" />
                </IconButton>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">
                    {currentSong?.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {currentSong?.artist} • {currentSong?.year}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Song {currentSongIndex + 1} of {playlist.songs.length}
                </Typography>
            </Box>
        </Box>
    );
}