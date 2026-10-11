WAYNE OS // BatPanel composite assets
======================================

Drop your 15 images here, using this EXACT structure and naming.
The BatPanel reads the user's tier (1–5) per sector and loads the matching file.
Until a file exists, the panel shows a labelled gradient fallback (no broken images).

FORMAT: WebP, sized for the screen (max ~1600 px wide). The originals that
used to live here (22 MB of PNG/JPG) are kept in /art-source/ at the project
root, outside the build. To convert a new image:
  python -c "from PIL import Image; im=Image.open('in.png'); im.thumbnail((1600,1600)); im.save('level-1.webp','WEBP',quality=80,method=6)"

public/assets/
  empire/        (Layer 1 · background · Wealth/Admin)
    level-1.webp   alley            (art-source/empire/Level-5 (2).jpg)
    level-2.webp   workshop         (art-source/empire/Level-5 (6).jpg)
    level-3.webp   command center   (art-source/empire/Level-5 (7).jpg)
    level-4.webp   cave HQ          (art-source/empire/Level-5 (8).jpg)
    level-5.webp   the tower        (art-source/empire/Level-5 (9).jpg)
  machine/       (Layer 2 · midground · Tech/Tools — WebP with transparency)
    level-1.webp … level-5.webp
  body/          (Layer 3 · foreground · Fitness/Mind — WebP with transparency)
    level-1.webp … level-5.webp

Intro sequence
--------------
  public/assets/batman-head.webp   (the Cortical Sync cowl)
- A high-res image of Batman's head/cowl, ideally transparent background,
  roughly square or portrait. The intro zooms into the eye line (~40% from
  top), so center the cowl horizontally with the eyes a little above middle.
- If absent, IntroSequence renders a vector cowl fallback automatically.

V7 character & gadget art (all optional — vector fallbacks render until added)
------------------------------------------------------------------------------
  public/assets/alfred-avatar.png        Daily Briefing portrait (square, ~128px)
  public/assets/boss-silhouette.png      Weekly Rogue boss (gritty silhouette, transparent)
  public/assets/gadgets/grapnel.png      Utility Belt — isometric 3D renders,
  public/assets/gadgets/batarang.png       transparent background, ~128px square each
  public/assets/gadgets/smoke-pellet.png
  public/assets/gadgets/explosive-gel.png
  public/assets/gadgets/optics.png
  public/assets/gadgets/emp.png
  public/assets/gadgets/cape.png
  public/assets/gadgets/tumbler.png

V9 art (all optional — vector/styled fallbacks render until added)
------------------------------------------------------------------
  public/assets/major-sticky.png         Detective Board core sticky-note (square-ish)
  public/assets/sub-sticky.png           Detective Board sub-task sticky (small)
  public/assets/villains/riddler-okay.png      Arkham Cell minigame — 3 states each:
  public/assets/villains/riddler-hurt.png        okay → hurt → plastered (transparent PNG)
  public/assets/villains/riddler-plastered.png
  public/assets/villains/joker-okay.png   (+ joker-hurt, joker-plastered)
  public/assets/villains/bane-okay.png    (+ bane-hurt,  bane-plastered)

Notes
-----
- Empire is a full-frame background. Machine and Body keep their transparency
  (WebP supports alpha) so the layers behind show through for the parallax depth.
- Tiers map from sector mastery: tier = floor(level / 6) + 1, clamped to 1–5.
    Empire  = average of Wealth + Allies levels
    Machine = Project (the Batmobile build) level
    Body    = average of Body + Mind levels
- Recommended size: 1600×640 (matches the panel's cinematic aspect), but any
  16:6.5-ish ratio works since layers are object-cover.
