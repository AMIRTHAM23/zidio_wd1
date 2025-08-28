export const notFound = (req, res) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: error.message,
    availableEndpoints: {
      auth: [
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET /api/auth/me',
        'PUT /api/auth/profile'
      ],
      users: [
        'GET /api/users',
        'GET /api/users/:id',
        'PUT /api/users/:id',
        'DELETE /api/users/:id'
      ],
      files: [
        'GET /api/files',
        'POST /api/files/upload',
        'GET /api/files/:id',
        'DELETE /api/files/:id',
        'GET /api/files/:id/download'
      ],
      analytics: [
        'GET /api/analytics',
        'POST /api/analytics',
        'GET /api/analytics/:id',
        'PUT /api/analytics/:id',
        'DELETE /api/analytics/:id'
      ]
    }
  });
};