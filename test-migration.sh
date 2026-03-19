#!/bin/bash
curl -X POST http://localhost:3000/api/admin/system/migrate-programs \
  -H "Authorization: Bearer default_dev_secret"
