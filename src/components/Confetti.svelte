<script>
  const COLORS = ["#f5b301", "#ffe08a", "#34d399", "#38bdf8", "#f43f5e", "#ffffff"];

  let { show = false, count = 28 } = $props();
  let pieces = $state([]);

  $effect(() => {
    if (show) {
      pieces = Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        dur: 1.1 + Math.random() * 1.2,
        rot: 320 + Math.random() * 520,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        w: 5 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        radius: Math.random() > 0.6 ? "50%" : "2px",
      }));
    } else {
      pieces = [];
    }
  });
</script>

{#if show}
  <div class="confetti" aria-hidden="true">
    {#each pieces as p (p.id)}
      <span
        style="left:{p.left}%; background:{p.color}; width:{p.w}px; height:{p
          .h}px; border-radius:{p.radius}; animation-delay:{p
          .delay}s; animation-duration:{p.dur}s; --rot:{p.rot}deg;"
      ></span>
    {/each}
  </div>
{/if}

<style>
  .confetti {
    position: fixed;
    inset: 0;
    z-index: 60;
    pointer-events: none;
    overflow: hidden;
  }

  .confetti span {
    position: absolute;
    top: -24px;
    display: block;
    animation-name: fall;
    animation-timing-function: cubic-bezier(0.3, 0.6, 0.7, 1);
    animation-fill-mode: both;
  }

  @keyframes fall {
    0% {
      transform: translateY(-6vh) rotate(0deg);
      opacity: 0;
    }
    12% {
      opacity: 1;
    }
    100% {
      transform: translateY(112vh) rotate(var(--rot, 400deg));
      opacity: 0.85;
    }
  }
</style>
