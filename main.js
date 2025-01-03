$(document).ready(function () {
  const $video = $(".js-video").get(0);
  const $videoContainer = $(".js-container");
  const $videoInfo = $(".js-info");
  const $playButton = $(".js-play-btn");
  const $playPauseIcon = $(".js-play-pause-icon");
  const $timeline = $(".js-timeline");
  const $volume = $(".js-volume");
  const $speakerButton = $(".js-speaker-btn");
  const $skipButton = $(".js-skip");
  const $minMaxButton = $(".js-minmax-btn");

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

  // handle play-pause state
  $(".js-video, .js-play-btn").each(function () {
    $(this).click((event) => {
      const isCoverPlayButton = $(this).data("cover-btn");

      if (isCoverPlayButton) {
        $(".js-video-cover").addClass("is-hidden");
        $videoInfo.removeClass("is-hidden");
      }

      $video.paused ? $video.play() : $video.pause();
      updateIcon("play-pause");
    });
  });

  // Hide and show video controls
  function toggleInfoVisibility(show = false) {
    $videoInfo.stop()[show ? "fadeIn" : "fadeOut"]();
  }

  // $videoContainer.on({
  //   mouseenter: () => toggleInfoVisibility(true),
  //   mouseleave: () => toggleInfoVisibility(false),
  // });

  $timeline.on("input", function () {
    updateTime("timeline-bar");
  });

  $skipButton.click(function () {
    const type = $(this).data("skip-type");

    updateTime("skip-button", { type });
  });

  // Handle time update
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

  // Keep update the progress bar whenever video time chanages
  $video.addEventListener("timeupdate", () => {
    updateBar("timeline");
  });

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
      $video.muted = $video.volume === 0;
      $video.volume = value;

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

  function toggleFullScreen() {
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
});
