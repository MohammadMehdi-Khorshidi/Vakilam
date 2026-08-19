# Iran location seed data

The province and city seed files are derived from the public administrative-division dataset at:

`https://github.com/sajaddp/list-of-cities-in-Iran`

- Source revision: `474942269f75ec247e1af5684f5e3eca9f304431`
- Administrative data coverage stated by the source: through 1402 (2023)
- Included here: 31 provinces and 1,451 city records
- Transformation: numbered municipality-region entries such as `اراک 1` were excluded because the Vakilam schema models cities, not urban regions.
- Same-name cities in different counties remain separate rows with their source identifiers.
- Source license: GPL-3.0; a copy is included in `LICENSE-IRAN-LOCATIONS.txt`.

The source repository documents that city and county are distinct administrative concepts. Vakilam imports only its city dataset because the current project schema has no county table.
