"""Turn a rendered card into a vertical MP4 that Facebook accepts as a Reel.

The card is 4:5 and a Reel is 9:16, so the card is placed on a blurred,
darkened copy of itself and the whole frame drifts in slowly: the text keeps
its shape instead of being cropped, and the picture fills the screen.

The output follows Facebook's Reels specs — 1080x1920, 30 fps, H.264 4:2:0
with a closed 2-second GOP, and a stereo AAC track. The API requires an audio
stream: a track from ``assets/music`` is looped under the video, and silence is
used when that folder is empty. Only CC0 / public-domain tracks belong there.
"""

from __future__ import annotations

import logging
import random
import shutil
import subprocess
from pathlib import Path
from typing import Iterable

from . import config
from .config import setting

LOGGER = logging.getLogger(__name__)

REEL_SIZE = (1080, 1920)
FPS = 30
MIN_SECONDS = 3
MAX_SECONDS = 90
DEFAULT_SECONDS = 12
CARD_WIDTH = 1040
ZOOM = 1.05
DEFAULT_MUSIC_VOLUME = 0.6
MUSIC_SUFFIXES = (".mp3", ".m4a", ".aac", ".ogg", ".opus", ".wav")


class ReelError(RuntimeError):
    """ffmpeg is missing, or it could not produce the video."""


def ffmpeg_path() -> str:
    """System ffmpeg, else the static binary shipped by imageio-ffmpeg."""
    configured = setting("FFMPEG_PATH")
    if configured:
        found = shutil.which(configured)
        if not found and Path(configured).is_file():
            found = configured
        if not found:
            raise ReelError(
                f"FFMPEG_PATH points to {configured}, which is not an executable file."
            )
        return found

    found = shutil.which("ffmpeg")
    if found:
        return found

    try:
        import imageio_ffmpeg  # optional: a static ffmpeg bundled with the venv

        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception as exc:  # noqa: BLE001 - fall through to the install hint
        LOGGER.debug("No bundled ffmpeg available: %s", exc)

    raise ReelError(
        "ffmpeg was not found, so the reel cannot be rendered. Install it "
        "(Debian/Ubuntu: sudo apt install ffmpeg), or pip install imageio-ffmpeg, "
        "or set FFMPEG_PATH in .env."
    )


def music_dir() -> Path:
    """Folder holding the background tracks; ``REEL_MUSIC_DIR`` overrides it."""
    configured = setting("REEL_MUSIC_DIR")
    if configured:
        return Path(configured).expanduser()
    return config.SCRIPTS_DIR / "assets" / "music"


def available_music() -> list[Path]:
    folder = music_dir()
    if not folder.is_dir():
        return []
    return sorted(
        path
        for path in folder.iterdir()
        if path.is_file()
        and not path.name.startswith(".")
        and path.suffix.lower() in MUSIC_SUFFIXES
    )


def pick_music(
    rng: random.Random | None = None, avoid: Iterable[str] = ()
) -> Path | None:
    """A random track, preferring ones not used in the last few posts."""
    tracks = available_music()
    if not tracks:
        return None
    skip = {str(name) for name in avoid if name}
    fresh = [path for path in tracks if path.name not in skip]
    return (rng or random).choice(fresh or tracks)


def _volume() -> float:
    raw = setting("REEL_MUSIC_VOLUME", str(DEFAULT_MUSIC_VOLUME))
    try:
        value = float(raw)
    except (TypeError, ValueError):
        return DEFAULT_MUSIC_VOLUME
    return max(0.0, min(2.0, value))


def clamp_seconds(seconds: float) -> float:
    try:
        value = float(seconds)
    except (TypeError, ValueError):
        value = DEFAULT_SECONDS
    return max(float(MIN_SECONDS), min(float(MAX_SECONDS), value))


def _filter(seconds: float, with_music: bool = False) -> str:
    frames = max(1, int(round(seconds * FPS)))
    step = (ZOOM - 1.0) / max(1, frames - 1)
    fade_out = max(0.0, seconds - 0.6)
    graph = (
        "[0:v]split=2[bgsrc][fgsrc];"
        "[bgsrc]scale=1080:1920:force_original_aspect_ratio=increase,"
        "crop=1080:1920,gblur=sigma=48,eq=brightness=-0.16[bgb];"
        f"[fgsrc]scale={CARD_WIDTH}:-2:flags=lanczos[fgs];"
        "[bgb][fgs]overlay=(W-w)/2:(H-h)/2[comp];"
        f"[comp]zoompan=z='1+{step:.6f}*on':"
        "x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,"
        f"fade=t=in:st=0:d=0.4,fade=t=out:st={fade_out:.2f}:d=0.6,"
        "format=yuv420p[v]"
    )
    if not with_music:
        return graph
    # Loop as needed, fade with the picture, and land on stereo 48 kHz AAC.
    music_fade = max(0.5, seconds - 1.0)
    return graph + (
        f";[1:a]atrim=duration={seconds:.2f},asetpts=N/SR/TB,"
        "afade=t=in:st=0:d=1.2,"
        f"afade=t=out:st={music_fade:.2f}:d=1.0,"
        f"volume={_volume():.2f},aresample=48000,"
        "aformat=sample_fmts=fltp:channel_layouts=stereo[a]"
    )


def build_reel(
    image_path: Path,
    output_path: Path,
    seconds: float = DEFAULT_SECONDS,
    music: Path | None = None,
) -> Path:
    """Render the card at ``image_path`` into a 9:16 MP4 at ``output_path``."""
    image_path = Path(image_path)
    output_path = Path(output_path)
    if not image_path.is_file():
        raise ReelError(f"Image not found: {image_path}")
    if music is not None and not Path(music).is_file():
        raise ReelError(f"Music file not found: {music}")
    seconds = clamp_seconds(seconds)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    command = [
        ffmpeg_path(),
        "-hide_banner", "-loglevel", "error", "-y",
        "-loop", "1", "-framerate", str(FPS), "-t", f"{seconds:.2f}", "-i", str(image_path),
    ]
    if music is not None:
        command += ["-stream_loop", "-1", "-i", str(music)]
    else:
        command += [
            "-f", "lavfi", "-t", f"{seconds:.2f}",
            "-i", "anullsrc=channel_layout=stereo:sample_rate=48000",
        ]
    command += [
        "-filter_complex", _filter(seconds, with_music=music is not None),
        "-map", "[v]", "-map", "[a]" if music is not None else "1:a",
        "-c:v", "libx264", "-profile:v", "high", "-level", "4.2",
        "-preset", "veryfast", "-crf", "21", "-pix_fmt", "yuv420p",
        "-r", str(FPS), "-g", "60", "-keyint_min", "60", "-sc_threshold", "0",
        "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-ac", "2",
        "-movflags", "+faststart", "-shortest",
        str(output_path),
    ]

    if music is not None:
        LOGGER.info("Rendering a %.0f-second reel from %s with music %s", seconds, image_path.name, music.name)
    else:
        LOGGER.info(
            "Rendering a %.0f-second reel from %s with a silent track "
            "(no music in %s)",
            seconds, image_path.name, music_dir(),
        )
    try:
        result = subprocess.run(
            command, capture_output=True, text=True, timeout=900, check=False
        )
    except subprocess.TimeoutExpired as exc:
        raise ReelError(f"ffmpeg timed out rendering {output_path.name}") from exc

    if result.returncode != 0 or not output_path.is_file():
        detail = (result.stderr or result.stdout or "").strip()[-1500:]
        raise ReelError(f"ffmpeg failed (exit {result.returncode}): {detail}")

    size = output_path.stat().st_size
    if size == 0:
        raise ReelError(f"ffmpeg produced an empty file: {output_path}")
    LOGGER.info("Reel written to %s (%.1f MB)", output_path, size / (1024 * 1024))
    return output_path
