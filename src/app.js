import express from 'express';
import { userRouter } from './routes/user.routes.js';
import swaggerUi from 'swagger-ui-express';
import { bundle } from '@readme/openapi-parser';
import { issueRouter } from './routes/issue.routes.js';
import { auditRouter } from './routes/audit.routes.js';
import { aiRouter } from './routes/ai.routes.js';
import { telemetryRouter } from './routes/telemetry.routes.js';

const app = express();

app.use(express.static('src/public')); // N1-4

app.use(express.json());
app.use('/api/v1', telemetryRouter);
app.use('/api/v1', userRouter);
app.use('/api/v1', issueRouter); //N1-1
app.use('/api/v1', auditRouter);
app.use('/api/v1', aiRouter); //N1-3

// Bundle OpenAPI and set up Swagger UI
bundle('src/docs/openapi.yaml')
    .then((api) => {
        app.use('/docs', swaggerUi.serve, swaggerUi.setup(api));
    })
    .catch((err) => {
        console.error('Error loading OpenAPI document:', err);
    });

export default app;