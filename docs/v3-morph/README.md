# LocalAgent V3 review

Run `python scripts/preview.py --port 8776 --minutes 60`, open http://127.0.0.1:8776/v3/ . Windows: `py -3` can replace `python`. Comparison/screenshots/motion: http://127.0.0.1:8776/docs/v3-morph/ . V2 root retained; no publication.

Foundation #13: PR #21, based on develop. Morph #14: stacked on that foundation, reuses reviewed PR19 renderer lifecycle/pacing/query policy and extends it with five seeded static target attributes. No runtime dependencies. Buffers and DPR bounded. Mode owns geometry until Follow; scroll owns composition. Pause/reduced requests discarded. Point-core occludes far ribbons analytically without a solid primary mesh.

Local: `npm run build` (25 tests); `V3_PLAYWRIGHT=<installed playwright module> PYTHON=<python executable> node scripts/v3-smoke.mjs`. Optional `V3_EVIDENCE=<directory>` writes captures/raw metrics. No tool installation or Actions dispatch. Smoke hard deadline175s, own loopback server/browser cleanup.

See verification.json for 2.6-second rolling samples at1440×1000, RTX3090Ti Windows Chrome; High22k/Balanced8.5k. GPU timer measures scene submission, not compositor. 4×CPU throttling is emulation. Short samples do not establish sustained battery/thermal/mobile performance. Lighthouse mobile accessibility/best practices100; lab localhostLCP81ms/CLS0.00, not production field data. No physical phones, screen-reader, Safari/Firefox. HostedCI NOT RUN; QA checkpoint/merge/production activation pending.

CaptureStream requested60Hz; encoded clips preserve variable timing (~58.9desktop/58.4mobile fps), no invented/interpolated frames. Initial local navigation recorded one168ms long task (compile/target setup included); heap~3.55MB is one snapshot, not a leak benchmark. Full-page walkthrough25fps. Platform/rawvideo stats included.
