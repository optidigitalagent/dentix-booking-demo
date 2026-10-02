# Qualified dental review packet

`professional-review.json` snapshots the exact local production-build fallback copy from all twelve patient pages, including all eight service pages. It includes titles, H1, answer/scope/questions, visible price names/costs/notes, clinician or no-clinician state, Service names/descriptions, exact visible blocks and source keys/hashes. For the microscope page it also records Service provider and area served. Values come from rendered source; this packet does not itself approve medical copy.

Status is UNKNOWN / NOT_COMPLETED. Reviewer identity, role, date and sign-off are intentionally null. A qualified reviewer should read each page entry, confirm the associated source and leave APPROVE, CHANGE_REQUIRED or NOT_APPLICABLE with reasons. Record exact changes and re-review regenerated output after any medical edit. No named surgeon, implantologist or orthopedist is inferred from existing staff.

Regenerate after a production build with `python3 scripts/release.py review`. The source commit/date identifies the last managed content change; the commit and Draft PR identify this candidate. The committed packet is checked against the artifact. Live managed content is disabled in the candidate; enabling it requires reviewing that exact runtime snapshot separately.
