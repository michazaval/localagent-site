# #15 local proof — not production integration

Owner visual acceptance of PR22 remains pending. This isolated branch changes only `experiments/site-v3/storytelling/`; dist excludes it. Production HTML/CSS/controller/build/workflows stay untouched.

Run `python scripts/preview.py --port 8779 --minutes 60`, open `/experiments/site-v3/storytelling/` or `review.html` for evidence. Prototype reuses PR22 single renderer through a factory adapter. It paces actual chapter anchors and adds three native CSS scroll moments, with static/noJS/Pause/reduced fallbacks. Fourteen native-step navigation samples per viewport/locale; history Back and keyboard checked.

`V3_PLAYWRIGHT=<installed playwright module> node experiments/site-v3/storytelling/qa.mjs` expects the bounded loopback preview. `node --test` includes two pacing/reverse policy regressions. Video25fps; actual computed transforms recorded, no synthetic frames. Lab LCP/CLS comparison has uncontrolled cache/driver warmup; not field CWV or INP. Full production IA/integration, owner acceptance, physical phones and hosted CI are not claimed.
