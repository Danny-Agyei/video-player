$(document).ready(function () {
  const $video = $(".js-video").get(0);
  const $videoContainer = $(".js-container");
  const $videoInfo = $(".js-info");
  const $videoTitle = $(".js-title");
  const $playButton = $(".js-play-btn");
  const $playPauseIcon = $(".js-play-pause-icon");
  const $timeline = $(".js-timeline");
  const $timeDisplay = $(".js-time");
  const $volume = $(".js-volume");
  const $speakerButton = $(".js-speaker-btn");
  const $skipButton = $(".js-skip");
  const $minMaxButton = $(".js-minmax-btn");
  const $picInPicButton = $(".js-pip-btn");

  if (
    !$video ||
    !$videoInfo.length ||
    !$playButton.length ||
    !$playPauseIcon.length
  ) {
    console.error("Required elements are missing!");
    return;
  }

  // Disable controls if video has no source
  if (!$video.currentSrc) {
    $("button, input", $videoInfo).prop("disabled", true);
    $(".volume-bar").hide();
  }

  // Mute when loaded
  $video.muted = true;
  $video.volume = 0;

  // Set video title

  const videoSrc = $video.currentSrc;
  const videoName = videoSrc.split("/").pop().split(".")[0];
  const readableVideoName = decodeURI(videoName).replace(/[^a-zA-Z0-9]/g, " ");

  $videoTitle.text(readableVideoName);

  updateTimeDisplay();

  // handle play-pause state
  $(".js-video, .js-play-btn").each(function () {
    $(this).click((event) => {
      const isCoverPlayButton = $(this).data("cover-btn");

      if (isCoverPlayButton) {
        $(".js-video-cover").addClass("is-hidden");
        $videoInfo.removeClass("is-hidden");

        handlePlayPause();
      } else {
        if ($(this).hasClass("js-video") && event.pointerType !== "mouse") {

          toggleInfoVisibility('touch');
          return;
        }

        handlePlayPause();
      }
    });
  });

  function handlePlayPause() {
    $video.paused ? $video.play() : $video.pause();
    updateIcon("play-pause");
  }

  // Hide and show video controls
  let show = true;

  function toggleInfoVisibility(eventType) {
    console.log(eventType)
    eventType === "mouseenter" ?
      (show = true) :
      eventType === "mouseleave"
        ? (show = false)
        : (show = !show);
    console.log(show)

    $videoInfo.stop()[show ? "fadeIn" : "fadeOut"]();
  }

  $videoContainer.on({
    mouseenter: () => toggleInfoVisibility("mouseenter"),
    mouseleave: () => toggleInfoVisibility("mouseleave"),
  });

  // video timeline / progreens bar change event
  $timeline.on("input", function () {
    updateTime("timeline-bar");
  });

  // video skipping event handler
  $skipButton.click(function () {
    const type = $(this).data("skip-type");

    updateTime("skip-button", { type });
  });

  // Handle video time update
  function updateTime(target, options = {}) {
    const duration = $video.duration;
    if (!duration || isNaN(duration)) return;

    let newTime;

    if (target === "timeline-bar") {
      newTime = ($timeline.val() / 100) * duration;
    } else if (target === "skip-button") {
      const { type } = options;
      const currentTime = $video.currentTime;

      newTime =
        type === "forward"
          ? Math.min(currentTime + 15, duration)
          : Math.max(currentTime - 15, 0);
    }

    $video.currentTime = newTime;
    updateBar("timeline");
  }

  // Listen for video events
  $($video).on("timeupdate", () => {
    updateTimeDisplay();
    updateBar("timeline");
  });

  $($video).on("loadedmetadata seeked", updateTimeDisplay);

  // Volume change event handler
  $volume.on("input", function () {
    updateBar("volume", { targetElem: "volume-bar" });
  });

  // Handle timeline and volume bar update
  function updateBar(type, options = {}) {
    let $element;
    let value;

    if (type === "timeline") {
      $element = $timeline;
      value = $video.currentTime / $video.duration;
    } else if (type === "volume") {
      const { targetElem } = options;

      $element = $volume;
      value = targetElem === "volume-bar" ? $element.val() : $video.volume;

      if (value >= 0.98) value = 1;

      $video.volume = value;
      $video.muted = $video.volume === 0;

      updateIcon("speaker");
    }

    if (value !== undefined && value !== null) {
      const progress = value * 100;

      const style = {
        "background-image": `linear-gradient(to right, var(--primary-color) ${progress}%, var(--secondary-color) ${progress}%, var(--secondary-color) 100%)`,
      };

      $element.val(progress).css(style);
    }
  }

  // Video time
  // Format time to HH:MM:SS
  function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    // Pad with zeroes if needed
    const formattedHrs = hrs > 0 ? `${hrs}:` : "";
    const formattedMins = mins < 10 && hrs > 0 ? `0${mins}` : mins;
    const formattedSecs = secs < 10 ? `0${secs}` : secs;

    return `${formattedHrs}${formattedMins}:${formattedSecs}`;
  }

  // Update the current time and duration display
  function updateTimeDisplay() {
    const currentTime = $video.currentTime || 0;
    const duration = $video.duration || 0;

    $timeDisplay.text(`${formatTime(currentTime)} / ${formatTime(duration)}`);
  }

  // Mute & unmute handler
  $speakerButton.click(toggleAudio);

  let prevVolume = 0.25;

  function toggleAudio() {
    const isMuted = $video.muted || $video.volume === 0;

    $video.volume = isMuted ? prevVolume || 0.25 : 0;
    $video.muted = !isMuted;
    prevVolume = $video.volume;

    updateIcon("speaker");

    //Update volume bar
    updateBar("volume", "speaker-icon");
  }

  // Icons update Handler
  function updateIcon(target) {
    let iconName;

    if (target === "speaker") {
      iconName = $video.muted
        ? "volume-x"
        : $video.volume > 0.5
          ? "volume-2"
          : "volume-1";

      $speakerButton.html(
        $("<i>").addClass("icon").attr("data-lucide", iconName)
      );
    } else if (target === "play-pause") {
      iconName = $video.paused ? "play" : "pause";

      $playButton.html($("<i>").addClass("icon").attr("data-lucide", iconName));
    } else if (target === "fullscreen") {
      iconName = $videoContainer.hasClass("is-fullmode")
        ? "minimize"
        : "maximize";

      $minMaxButton.html(
        $("<i>").addClass("icon").attr("data-lucide", iconName)
      );
    }

    lucide.createIcons();
  }

  // Fullscreen toggle handler
  $minMaxButton.click(toggleFullScreen);
  $($video).on("dblclick", toggleFullScreen);

  function toggleFullScreen(keyExit = false) {
    const videoContainer = $videoContainer.get(0);

    if (!document.fullscreenElement) {
      // Enter fullscreen mode
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      } else if (videoContainer.mozRequestFullScreen) {
        videoContainer.mozRequestFullScreen(); // Firefox
      } else if (videoContainer.webkitRequestFullscreen) {
        videoContainer.webkitRequestFullscreen(); // Safari
      } else if (videoContainer.msRequestFullscreen) {
        videoContainer.msRequestFullscreen(); // IE/Edge
      }

      $videoContainer.addClass("is-fullmode");
    } else {
      // Exit fullscreen mode
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen(); // Firefox
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen(); // Safari
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen(); // IE/Edge
      }

      $videoContainer.removeClass("is-fullmode");
    }

    updateIcon("fullscreen");
  }

  // Prevent browser default fullscreen mode when hit f11
  $(document).keydown((event) => {
    const keyCode = event.code.toLowerCase();

    if (keyCode === "f11") event.preventDefault();
    if (keyCode === "space") handlePlayPause();
  });

  // Update minMax icon when exist fullscreen with escape or f11 key
  $(document).on("fullscreenchange", () => {
    if (!document.fullscreenElement) {
      $videoContainer.removeClass("is-fullmode");
      updateIcon("fullscreen");
    }
  });

  // Picture in picture handler
  $picInPicButton.click(async () => {
    try {
      // Check if Picture-in-Picture is supported
      if (!document.pictureInPictureEnabled) {
        console.log("Picture-in-Picture is not supported in this browser.");
        return;
      }

      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await $video.requestPictureInPicture();
      }
    } catch (error) {
      console.error(error.message);
    }
  });

  // Update play-pause icon when in PictureInPicture mode
  $($video).on("play pause", updateIconInPipMode);

  function updateIconInPipMode() {
    if (document.pictureInPictureElement) {
      updateIcon("play-pause");
    }
  }

  $($video).on("leavepictureinpicture", () => {
    if ($video.paused) return; //video was manually paused

    // Delay to allow the browser to update the state
    setTimeout(() => {
      if ($video.paused) {
        // fix video paused automatically after exiting PiP mode
        $video
          .play()
          .catch((err) =>
            console.error("Error resuming video playback:", err.message)
          );
      }
    }, 100);
  });
});
