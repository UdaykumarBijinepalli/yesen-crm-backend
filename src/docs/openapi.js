import { PIPELINE_STAGES, INQUIRY_SOURCES } from '../config/pipeline.js';
import config from '../config/env.js';

const objectId = {
  type: 'string',
  pattern: '^[a-fA-F0-9]{24}$',
  description: 'MongoDB ObjectId',
  example: '507f1f77bcf86cd799439011',
};

const ErrorResponse = {
  type: 'object',
  required: ['error', 'requestId'],
  properties: {
    error: { type: 'string' },
    details: {},
    requestId: { type: 'string', format: 'uuid' },
  },
};

const User = {
  type: 'object',
  properties: {
    _id: objectId,
    name: { type: 'string', example: 'Administrator' },
    username: { type: 'string', example: 'admin' },
    email: { type: 'string', format: 'email' },
    role: { type: 'string', enum: ['admin', 'staff'] },
    active: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const Quotation = {
  type: 'object',
  properties: {
    sent: { type: 'boolean' },
    sentAt: { type: 'string', format: 'date-time', nullable: true },
    sentBy: { ...objectId, nullable: true },
  },
};

const Inquiry = {
  type: 'object',
  properties: {
    _id: objectId,
    clientName: { type: 'string' },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },
    company: { type: 'string' },
    message: { type: 'string' },
    source: { type: 'string', enum: INQUIRY_SOURCES },
    sourcePage: { type: 'string' },
    productOrServiceName: { type: 'string' },
    stage: { type: 'string', enum: PIPELINE_STAGES },
    value: {
      type: 'number',
      nullable: true,
      minimum: 0,
      description: 'Estimated deal value (optional)',
      example: 85000,
    },
    tags: { type: 'array', items: { type: 'string' } },
    quotation: Quotation,
    assignedTo: { ...objectId, nullable: true },
    lost: {
      type: 'object',
      properties: { reason: { type: 'string', nullable: true } },
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const InteractionLog = {
  type: 'object',
  properties: {
    _id: objectId,
    inquiry: objectId,
    type: {
      type: 'string',
      enum: ['note', 'call', 'email', 'whatsapp', 'meeting', 'stage_change', 'system'],
    },
    message: { type: 'string' },
    createdBy: { ...objectId, nullable: true },
    meta: { type: 'object', additionalProperties: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const Document = {
  type: 'object',
  properties: {
    _id: objectId,
    inquiry: objectId,
    type: { type: 'string', enum: ['invoice', 'quotation', 'other'] },
    originalName: { type: 'string' },
    storedFilename: { type: 'string' },
    mimeType: { type: 'string' },
    sizeBytes: { type: 'integer' },
    uploadedBy: { ...objectId, nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const FormIntakeBody = {
  type: 'object',
  description:
    'Provide clientName or name, and at least one of email or phone. productOrServiceName is used for auto-tagging on product/service forms.',
  properties: {
    clientName: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1, description: 'Alias for clientName' },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string', minLength: 5, maxLength: 20 },
    company: { type: 'string' },
    message: { type: 'string' },
    productOrServiceName: { type: 'string' },
    sourcePage: { type: 'string' },
    value: { type: 'number', minimum: 0, description: 'Optional estimated deal value' },
  },
  example: {
    clientName: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+919876543210',
    company: 'Acme Corp',
    message: 'Interested in a demo',
    productOrServiceName: 'CRM Suite',
    sourcePage: '/products/crm',
    value: 85000,
  },
};

const bearer = [{ bearerAuth: [] }];
const formsKey = [{ formsApiKey: [] }];

const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Yesen CRM Backend API',
    version: config.apiVersion,
    description: [
      'Admin panel / CRM backend for the Yesen Technologies Kanban inquiry pipeline.',
      '',
      '**Auth**',
      '- Admin routes: `Authorization: Bearer <JWT>` from `POST /api/v1/auth/login`',
      '- Public form intake: `x-forms-key` header matching `FORMS_API_KEY`',
      '',
      '**Versioning**: prefer `/api/v1/...`. An unversioned `/api/...` alias also works.',
    ].join('\n'),
  },
  servers: [
    { url: '/', description: 'Current host' },
    { url: `http://localhost:${config.port}`, description: 'Local development' },
  ],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Forms', description: 'Public website form intake' },
    { name: 'Inquiries', description: 'Kanban board + inquiry drawer' },
    { name: 'Documents' },
    { name: 'Users', description: 'Admin-only user management' },
    { name: 'Meta' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT from POST /api/v1/auth/login',
      },
      formsApiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'x-forms-key',
        description: 'Shared secret for public form endpoints (`FORMS_API_KEY`)',
      },
    },
    schemas: {
      ErrorResponse,
      User,
      Inquiry,
      InteractionLog,
      Document,
      FormIntakeBody,
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', example: 'admin' },
          password: { type: 'string', format: 'password', example: 'ChangeMe123!' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: User,
        },
      },
      MeResponse: {
        type: 'object',
        properties: { user: User },
      },
      InquiryResponse: {
        type: 'object',
        properties: { inquiry: Inquiry },
      },
      InquiriesResponse: {
        type: 'object',
        properties: {
          inquiries: { type: 'array', items: Inquiry },
        },
      },
      BoardResponse: {
        type: 'object',
        properties: {
          columns: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                stage: { type: 'string', enum: PIPELINE_STAGES },
                cards: { type: 'array', items: Inquiry },
              },
            },
          },
        },
      },
      InquiryDetailResponse: {
        type: 'object',
        properties: {
          inquiry: Inquiry,
          logs: { type: 'array', items: InteractionLog },
          documents: { type: 'array', items: Document },
        },
      },
      UpdateInquiryRequest: {
        type: 'object',
        minProperties: 1,
        properties: {
          clientName: { type: 'string', minLength: 1 },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          company: { type: 'string' },
          message: { type: 'string' },
          value: { type: 'number', minimum: 0, nullable: true },
          assignedTo: { ...objectId, nullable: true },
        },
      },
      MoveStageRequest: {
        type: 'object',
        required: ['stage'],
        properties: {
          stage: { type: 'string', enum: PIPELINE_STAGES },
          lostReason: { type: 'string', description: 'Optional when moving to Lost' },
        },
      },
      TagRequest: {
        type: 'object',
        required: ['tag'],
        properties: { tag: { type: 'string', minLength: 1 } },
      },
      QuotationRequest: {
        type: 'object',
        required: ['sent'],
        properties: { sent: { type: 'boolean' } },
      },
      AddLogRequest: {
        type: 'object',
        required: ['message'],
        properties: {
          type: {
            type: 'string',
            enum: ['note', 'call', 'email', 'whatsapp', 'meeting'],
            default: 'note',
          },
          message: { type: 'string', minLength: 1 },
        },
      },
      LogResponse: {
        type: 'object',
        properties: { log: InteractionLog },
      },
      LogsResponse: {
        type: 'object',
        properties: { logs: { type: 'array', items: InteractionLog } },
      },
      DocumentResponse: {
        type: 'object',
        properties: { document: Document },
      },
      DocumentsResponse: {
        type: 'object',
        properties: { documents: { type: 'array', items: Document } },
      },
      CreateUserRequest: {
        type: 'object',
        required: ['name', 'username', 'password'],
        properties: {
          name: { type: 'string', minLength: 1 },
          username: { type: 'string', minLength: 3, maxLength: 30, pattern: '^[a-zA-Z0-9]+$' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8, format: 'password' },
          role: { type: 'string', enum: ['admin', 'staff'], default: 'staff' },
        },
      },
      UpdateUserRequest: {
        type: 'object',
        minProperties: 1,
        properties: {
          name: { type: 'string', minLength: 1 },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['admin', 'staff'] },
          active: { type: 'boolean' },
          password: { type: 'string', minLength: 8, format: 'password' },
        },
      },
      UsersResponse: {
        type: 'object',
        properties: { users: { type: 'array', items: User } },
      },
      UserResponse: {
        type: 'object',
        properties: { user: User },
      },
      PipelineMetaResponse: {
        type: 'object',
        properties: {
          stages: { type: 'array', items: { type: 'string', enum: PIPELINE_STAGES } },
          sources: { type: 'array', items: { type: 'string', enum: INQUIRY_SOURCES } },
        },
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          service: { type: 'string', example: 'yesen-crm-backend' },
          env: { type: 'string', example: 'development' },
        },
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string', format: 'password' },
          newPassword: { type: 'string', minLength: 8, format: 'password' },
        },
      },
      ChangePasswordResponse: {
        type: 'object',
        properties: { success: { type: 'boolean', example: true } },
      },
      TeamMember: {
        type: 'object',
        properties: {
          _id: objectId,
          name: { type: 'string' },
          username: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'staff'] },
        },
      },
      TeamResponse: {
        type: 'object',
        properties: { team: { type: 'array', items: { $ref: '#/components/schemas/TeamMember' } } },
      },
    },
    parameters: {
      InquiryId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: objectId,
      },
      DocumentId: {
        name: 'docId',
        in: 'path',
        required: true,
        schema: objectId,
      },
      UserId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: objectId,
      },
    },
    responses: {
      BadRequest: {
        description: 'Validation or bad request',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      Unauthorized: {
        description: 'Missing or invalid auth',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      Forbidden: {
        description: 'Authenticated but not allowed',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      NotFound: {
        description: 'Resource not found',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      Conflict: {
        description: 'Duplicate / conflict',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Liveness check',
        security: [],
        responses: {
          200: {
            description: 'Service is up',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/HealthResponse' } },
            },
          },
        },
      },
    },

    [`/api/${config.apiVersion}/auth/login`]: {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        description: 'Rate-limited (failed attempts only). Returns a JWT for Bearer auth.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } },
          },
        },
        responses: {
          200: {
            description: 'Authenticated',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    [`/api/${config.apiVersion}/auth/me`]: {
      get: {
        tags: ['Auth'],
        summary: 'Current user',
        security: bearer,
        responses: {
          200: {
            description: 'Current user profile',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/MeResponse' } },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    [`/api/${config.apiVersion}/auth/password`]: {
      patch: {
        tags: ['Auth'],
        summary: 'Change own password',
        description:
          'Self-service password change for the logged-in user. Requires the current password.',
        security: bearer,
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordRequest' } },
          },
        },
        responses: {
          200: {
            description: 'Password updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ChangePasswordResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    [`/api/${config.apiVersion}/forms/product`]: {
      post: {
        tags: ['Forms'],
        summary: 'Product inquiry intake',
        description: 'Creates an inquiry with `source=product` and auto-tags the product name.',
        security: formsKey,
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/FormIntakeBody' } },
          },
        },
        responses: {
          201: {
            description: 'Inquiry created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/InquiryResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    [`/api/${config.apiVersion}/forms/service`]: {
      post: {
        tags: ['Forms'],
        summary: 'Service inquiry intake',
        description: 'Creates an inquiry with `source=service` and auto-tags the service name.',
        security: formsKey,
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/FormIntakeBody' } },
          },
        },
        responses: {
          201: {
            description: 'Inquiry created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/InquiryResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    [`/api/${config.apiVersion}/forms/contact`]: {
      post: {
        tags: ['Forms'],
        summary: 'Contact form intake',
        description: 'Creates an inquiry with `source=contact` and auto-tags `"Open"`.',
        security: formsKey,
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/FormIntakeBody' } },
          },
        },
        responses: {
          201: {
            description: 'Inquiry created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/InquiryResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    [`/api/${config.apiVersion}/inquiries`]: {
      get: {
        tags: ['Inquiries'],
        summary: 'List inquiries or Kanban board',
        description:
          'Pass `board=true` for Kanban columns. Otherwise returns a flat filtered list.',
        security: bearer,
        parameters: [
          {
            name: 'board',
            in: 'query',
            schema: { type: 'string', enum: ['true', 'false', '1', '0'] },
            description: 'When true/1, returns `{ columns }` instead of `{ inquiries }`',
          },
          { name: 'tag', in: 'query', schema: { type: 'string' } },
          {
            name: 'source',
            in: 'query',
            schema: { type: 'string', enum: INQUIRY_SOURCES },
          },
          {
            name: 'q',
            in: 'query',
            schema: { type: 'string', maxLength: 200 },
            description: 'Search name / email / phone / company / product / tags',
          },
          {
            name: 'assignedTo',
            in: 'query',
            schema: {
              oneOf: [objectId, { type: 'string', enum: ['unassigned'] }],
            },
            description: 'Filter by owner user id, or `unassigned` for cards with no owner',
          },
        ],
        responses: {
          200: {
            description: 'Flat list or board columns',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    { $ref: '#/components/schemas/InquiriesResponse' },
                    { $ref: '#/components/schemas/BoardResponse' },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    [`/api/${config.apiVersion}/inquiries/{id}`]: {
      get: {
        tags: ['Inquiries'],
        summary: 'Get inquiry drawer payload',
        security: bearer,
        parameters: [{ $ref: '#/components/parameters/InquiryId' }],
        responses: {
          200: {
            description: 'Inquiry with logs and documents',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/InquiryDetailResponse' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Inquiries'],
        summary: 'Update inquiry fields',
        security: bearer,
        parameters: [{ $ref: '#/components/parameters/InquiryId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateInquiryRequest' } },
          },
        },
        responses: {
          200: {
            description: 'Updated inquiry',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/InquiryResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Inquiries'],
        summary: 'Delete inquiry',
        security: bearer,
        parameters: [{ $ref: '#/components/parameters/InquiryId' }],
        responses: {
          204: { description: 'Deleted' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    [`/api/${config.apiVersion}/inquiries/{id}/stage`]: {
      patch: {
        tags: ['Inquiries'],
        summary: 'Move Kanban stage',
        security: bearer,
        parameters: [{ $ref: '#/components/parameters/InquiryId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/MoveStageRequest' } },
          },
        },
        responses: {
          200: {
            description: 'Stage updated',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/InquiryResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    [`/api/${config.apiVersion}/inquiries/{id}/tags`]: {
      post: {
        tags: ['Inquiries'],
        summary: 'Add tag',
        security: bearer,
        parameters: [{ $ref: '#/components/parameters/InquiryId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/TagRequest' } },
          },
        },
        responses: {
          200: {
            description: 'Tag added',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/InquiryResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    [`/api/${config.apiVersion}/inquiries/{id}/tags/{tag}`]: {
      delete: {
        tags: ['Inquiries'],
        summary: 'Remove tag',
        security: bearer,
        parameters: [
          { $ref: '#/components/parameters/InquiryId' },
          {
            name: 'tag',
            in: 'path',
            required: true,
            schema: { type: 'string', minLength: 1 },
          },
        ],
        responses: {
          200: {
            description: 'Tag removed',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/InquiryResponse' } },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    [`/api/${config.apiVersion}/inquiries/{id}/quotation`]: {
      patch: {
        tags: ['Inquiries'],
        summary: 'Set quotation sent status',
        security: bearer,
        parameters: [{ $ref: '#/components/parameters/InquiryId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/QuotationRequest' } },
          },
        },
        responses: {
          200: {
            description: 'Quotation status updated',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/InquiryResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    [`/api/${config.apiVersion}/inquiries/{id}/logs`]: {
      get: {
        tags: ['Inquiries'],
        summary: 'List interaction logs',
        security: bearer,
        parameters: [{ $ref: '#/components/parameters/InquiryId' }],
        responses: {
          200: {
            description: 'Logs for inquiry',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/LogsResponse' } },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      post: {
        tags: ['Inquiries'],
        summary: 'Add interaction log',
        security: bearer,
        parameters: [{ $ref: '#/components/parameters/InquiryId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/AddLogRequest' } },
          },
        },
        responses: {
          201: {
            description: 'Log created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/LogResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    [`/api/${config.apiVersion}/inquiries/{id}/documents`]: {
      get: {
        tags: ['Inquiries'],
        summary: 'List documents',
        security: bearer,
        parameters: [{ $ref: '#/components/parameters/InquiryId' }],
        responses: {
          200: {
            description: 'Documents for inquiry',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/DocumentsResponse' } },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      post: {
        tags: ['Inquiries'],
        summary: 'Upload document',
        description:
          'Multipart upload. Field name must be `file`. Allowed: PDF, images, Word, Excel.',
        security: bearer,
        parameters: [{ $ref: '#/components/parameters/InquiryId' }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: { type: 'string', format: 'binary' },
                  type: {
                    type: 'string',
                    enum: ['invoice', 'quotation', 'other'],
                    default: 'other',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Document uploaded',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/DocumentResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    [`/api/${config.apiVersion}/documents/{docId}/download`]: {
      get: {
        tags: ['Documents'],
        summary: 'Download document file',
        security: bearer,
        parameters: [{ $ref: '#/components/parameters/DocumentId' }],
        responses: {
          200: {
            description: 'File download',
            content: {
              'application/octet-stream': {
                schema: { type: 'string', format: 'binary' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    [`/api/${config.apiVersion}/documents/{docId}`]: {
      delete: {
        tags: ['Documents'],
        summary: 'Delete document',
        security: bearer,
        parameters: [{ $ref: '#/components/parameters/DocumentId' }],
        responses: {
          204: { description: 'Deleted' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    [`/api/${config.apiVersion}/users`]: {
      get: {
        tags: ['Users'],
        summary: 'List users',
        security: bearer,
        description: 'Requires `admin` role.',
        responses: {
          200: {
            description: 'All users',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UsersResponse' } },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Create user',
        security: bearer,
        description: 'Requires `admin` role.',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateUserRequest' } },
          },
        },
        responses: {
          201: {
            description: 'User created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UserResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    [`/api/${config.apiVersion}/users/{id}`]: {
      patch: {
        tags: ['Users'],
        summary: 'Update user',
        security: bearer,
        description: 'Requires `admin` role.',
        parameters: [{ $ref: '#/components/parameters/UserId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateUserRequest' } },
          },
        },
        responses: {
          200: {
            description: 'User updated',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UserResponse' } },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    [`/api/${config.apiVersion}/meta/pipeline`]: {
      get: {
        tags: ['Meta'],
        summary: 'Pipeline stages and sources',
        security: bearer,
        responses: {
          200: {
            description: 'Fixed pipeline metadata',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PipelineMetaResponse' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    [`/api/${config.apiVersion}/meta/team`]: {
      get: {
        tags: ['Meta'],
        summary: 'Active team roster',
        description:
          'Safe public fields for assignment pickers (all authenticated roles). Not the admin Users list.',
        security: bearer,
        responses: {
          200: {
            description: 'Active team members',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/TeamResponse' } },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
  },
};

export default openapi;
