# Survey_Corps_final

✅ The system is deployed and working on GCP (Cloud Run + Cloud SQL).

**Reliability Note:** Inventory now uses a transactional outbox so callbacks are retried even if it crashes after committing inventory.

## GCP Deploy (Cloud Run)

### Prereqs
- GCP project: `warehouse-485805`
- Cloud SQL (PostgreSQL) instance: `your-self`
- Database: `warehouse_db`
- User: `warehouse_user`
- Password: `Pir08CXKH7DAuNVgby2p`
- Cloud Tasks queue: `inventory-queue` (region `us-central1`)
- Region: `us-central1`

### Deploy user-service
From `backend/services/user-service`:
```
gcloud builds submit "e:\hackathon_final\Survey_Corps_final\backend\services\user-service" --tag "gcr.io/warehouse-485805/user-service"
gcloud run deploy user-service --region us-central1 --image gcr.io/warehouse-485805/user-service --allow-unauthenticated --add-cloudsql-instances warehouse-485805:us-central1:your-self --set-env-vars "JWT_SECRET=super-secret,DB_HOST=/cloudsql/warehouse-485805:us-central1:your-self,DB_PORT=5432,DB_NAME=warehouse_db,DB_USER=warehouse_user,DB_PASSWORD=Pir08CXKH7DAuNVgby2p"
```

### Deploy inventory-service
From `backend/services/inventory-service`:
```
gcloud builds submit "e:\hackathon_final\Survey_Corps_final\backend\services\inventory-service" --tag "gcr.io/warehouse-485805/inventory-service"
gcloud run deploy inventory-service --region us-central1 --image gcr.io/warehouse-485805/inventory-service --allow-unauthenticated --add-cloudsql-instances warehouse-485805:us-central1:your-self --set-env-vars "DB_HOST=/cloudsql/warehouse-485805:us-central1:your-self,DB_PORT=5432,DB_NAME=warehouse_db,DB_USER=warehouse_user,DB_PASSWORD=Pir08CXKH7DAuNVgby2p,ORDER_SERVICE_URL=https://order-service-186174310908.us-central1.run.app,ORDER_CALLBACK_SECRET=sorry-for-late,OUTBOX_RETRY_MS=5000,OUTBOX_MAX_ATTEMPTS=10"
```

### Cloud SQL Migration (Outbox)
Apply the new outbox table in Cloud SQL using:
- [backend/services/inventory-service/sql/schema.sql](backend/services/inventory-service/sql/schema.sql)

### Deploy order-service
From `backend/services/order-service`:
```
gcloud builds submit "e:\hackathon_final\Survey_Corps_final\backend\services\order-service" --tag "gcr.io/warehouse-485805/order-service"
gcloud run deploy order-service --region us-central1 --image gcr.io/warehouse-485805/order-service --allow-unauthenticated --add-cloudsql-instances warehouse-485805:us-central1:your-self --set-env-vars "JWT_SECRET=super-secret,DB_HOST=/cloudsql/warehouse-485805:us-central1:your-self,DB_PORT=5432,DB_NAME=warehouse_db,DB_USER=warehouse_user,DB_PASSWORD=Pir08CXKH7DAuNVgby2p,PROJECT_ID=warehouse-485805,LOCATION=us-central1,QUEUE_NAME=inventory-queue,INVENTORY_HTTP_URL=https://inventory-service-186174310908.us-central1.run.app,INVENTORY_TASK_URL=https://inventory-service-186174310908.us-central1.run.app/tasks/reserve,INVENTORY_WAIT_MS=15000,INVENTORY_POLL_MS=1000,ORDER_CALLBACK_SECRET=sorry-for-late"
```

### Deploy frontend
From `frontend`:
```
gcloud builds submit "e:\hackathon_final\Survey_Corps_final\frontend" --tag "gcr.io/warehouse-485805/frontend"
gcloud run deploy frontend --region us-central1 --image gcr.io/warehouse-485805/frontend --allow-unauthenticated --port 8080
```

## Service Links (Cloud Run)
- Frontend: https://frontend-186174310908.us-central1.run.app
- User service: https://user-service-186174310908.us-central1.run.app
- Order service: https://order-service-186174310908.us-central1.run.app
- Inventory service: https://inventory-service-186174310908.us-central1.run.app