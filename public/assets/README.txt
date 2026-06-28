WAYNE OS // BatPanel composite assets
======================================

Drop your 15 generated images here, using this EXACT structure and naming.
The BatPanel reads the user's tier (1–5) per sector and loads the matching file.
Until a file exists, the panel shows a labelled gradient fallback (no broken images).

public/assets/
  empire/        (Layer 1 · background · Wealth/Admin)
    level-1.jpg
    level-2.jpg
    level-3.jpg
    level-4.jpg
    level-5.jpg
  machine/       (Layer 2 · midground · Tech/Tools — PNG with transparency)
    level-1.png
    level-2.png
    level-3.png
    level-4.png
    level-5.png
  body/          (Layer 3 · foreground · Fitness/Mind — PNG with transparency)
    level-1.png
    level-2.png
    level-3.png
    level-4.png
    level-5.png

Intro sequence
--------------
  public/assets/batman-head.png   (the Cortical Sync cowl)
- A high-res PNG of Batman's head/cowl, ideally transparent background,
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

Notes
-----
- Empire is a JPG (full-frame background). Machine and Body are PNGs so their
  transparent areas let the layers behind show through for the parallax depth.
- Tiers map from sector mastery: tier = floor(level / 6) + 1, clamped to 1–5.
    Empire  = average of Wealth + Allies levels
    Machine = Project (the Batmobile build) level
    Body    = average of Body + Mind levels
- Recommended size: 1600×640 (matches the panel's cinematic aspect), but any
  16:6.5-ish ratio works since layers are object-cover.
