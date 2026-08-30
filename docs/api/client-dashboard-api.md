# Client Dashboard API

## Authentication

All requests require a valid Bearer token:

```http
Authorization: Bearer {token}
Accept: application/json
```

## 1. Current Draft

### Endpoint

```http
GET /api/legal-requests/draft
```

Returns the client's latest unfinished legal request.

### Success response — draft exists

```json
{
  "legal_request": {
    "id": "uuid",
    "public_id": "uuid",
    "client_user_id": "uuid",
    "title": "اختلاف قرارداد",
    "description": "شرح مسئله حقوقی",
    "legal_category_id": 1,
    "province_id": 123,
    "city_id": 1001,
    "urgency": "normal",
    "service_intent": null,
    "status": "draft",
    "submitted_at": null,
    "cancelled_at": null,
    "parties": [],
    "documents": [],
    "created_at": "2026-08-27T18:00:00.000000Z",
    "updated_at": "2026-08-27T18:00:00.000000Z"
  }
}
```

### Success response — no draft

```json
{
  "legal_request": null
}
```

## 2. Non-draft Legal Requests

### Endpoint

```http
GET /api/legal-requests
```

Returns the client's LegalRequest records whose status is not `draft`.

> The current response key is `active_cases`, but these records are LegalRequests and are not necessarily formed LegalMatters.

### Success response

```json
{
  "active_cases": [
    {
      "id": "uuid",
      "public_id": "uuid",
      "title": "اختلاف قرارداد",
      "status": "submitted",
      "urgency": "normal",
      "service_intent": "lawyer_selection",
      "legal_category": {
        "id": 1,
        "name": "قراردادها"
      },
      "province": {
        "id": 123,
        "name": "تهران"
      },
      "city": {
        "id": 1001,
        "name": "تهران"
      },
      "submitted_at": "2026-08-27T18:00:00.000000Z",
      "updated_at": "2026-08-27T18:00:00.000000Z"
    }
  ]
}
```

## Frontend Dashboard Usage

- Use `GET /api/legal-requests/draft` for the **Continue Draft** section.
- Use `GET /api/legal-requests` for the **Submitted Requests** section.
- Do not treat an item returned by `GET /api/legal-requests` as a LegalMatter unless the LegalMatter API confirms that a matter has been formed.