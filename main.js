$(document).ready(function () {
  const $video = $(".js-video").get(0);
  const $videoInfo = $(".js-info");
  const $playButton = $(".js-play-btn");
  const $playPauseIcon = $(".js-play-pause-icon");
  const $timeline = $(".js-timeline");
  const $volume = $(".js-volume");
  const $speakerButton = $(".js-speaker-btn");
  const $skipButton = $(".js-skip");

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
  $playButton.click(function () {
    const isCoverPlayButton = $(this).data("cover-btn");

    if (isCoverPlayButton) {
      $(".js-video-cover").addClass("is-hidden");
      $videoInfo.removeClass("is-hidden");
    }

    $video.paused ? $video.play() : $video.pause();
    updateIcon("play-pause");
  });

  // Hide and show video controls
  function toggleInfoVisibility(show = false) {
    $videoInfo.stop()[show ? "fadeIn" : "fadeOut"]();
  }

  // $(".js-wrapper").on({
  //   mouseenter: () => toggleInfoVisibility(true),
  //   mouseleave: () => toggleInfoVisibility(false),
  // });

  // Handle timeline change
  $timeline.on("input", updateTime);

  function updateTime() {
    if ($video.duration) {
      const newTime = ($(this).val() / 100) * $video.duration;
      $video.currentTime = newTime;

      updateBar.bind(this)("timeline");
    }
  }

  // Volume change event handler
  $volume.on("input", function () {
    updateBar.bind(this)("volume");
  });

  // Handle timeline and volume bar update
  function updateBar(type) {
    const $element = type === "timeline" ? $timeline : $volume;
    const value =
      type === "timeline"
        ? $video.currentTime / $video.duration
        : $(this).val().length > 0
        ? $element.val()
        : $video.volume;

    if (value !== undefined && value !== null) {
      const progress = value * 100;
      const style = {
        "background-image": `linear-gradient(to right, var(--primary-color) ${progress}%, var(--secondary-color) ${progress}%, var(--secondary-color) 100%)`,
      };

      $element.val(progress).css(style);

      if (type === "volume") {
        $video.volume = value;
        $video.muted = $video.volume === 0;
        updateIcon("speaker");
      } else if (type === "timeline") {
      }
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
    updateBar.bind(this)("volume");
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
    }

    lucide.createIcons();
  }

  // Handle timeline skip through
  function changeTime() {
    const type = $(this).data("skip-type");
    const duration = $video.duration;
    const currentTime = parseFloat($video.currentTime);

    let value;

    if (type === "forward") {
      value = currentTime + 15 > duration ? duration : currentTime + 15;
    } else if (type === "backward") {
      value = currentTime - 15 < 1 ? 0 : currentTime - 15;
    }

    $video.currentTime = value;

    console.log(value);

    //Update timeline bar
    updateBar.bind(this)("timeline");
  }

  $skipButton.click(changeTime);
});
