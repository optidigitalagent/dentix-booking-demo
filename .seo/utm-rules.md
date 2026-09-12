# DENTIX UTM rules — planning only

Use lowercase ASCII, underscores for multiword source/campaign/content values, and ISO `yyyy-mm` or `yyyy-mm-dd` dates. Evergreen `gbp`, `profile`, `citations` campaigns have no invented start date. Replace directory_slug/partner_slug/creative placeholders only with approved real placement IDs. No patient/person identifiers, symptoms, form values or diagnosis in UTMs.

Use only on external incoming links. Never add UTMs to internal links. Canonicals and XML sitemaps always use the clean absolute HTTPS dentix.ua URL without tracking parameters; preserve usable query strings at the hosting layer without indexing campaign duplicates. GBP website uses homepage; appointment link uses a verified available contact destination until booking delivery exists. No appointment guarantee from a UTM.

GBP organic campaign traffic must be separable from classic organic using `source=google`, `medium=organic`, `campaign=gbp`; retain the raw dimensions. AI referrals keep their actual referrer/source, including `chatgpt.com` when observed; never manufacture a ChatGPT visit through our own UTM links. Paid/partner examples are drafts and require separate campaign authorization. No external links changed in PR02.
