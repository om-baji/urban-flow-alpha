const swaggerConfig = {
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'UrbanFlow API',
        version: '1.0.0',
        description: 'API documentation for UrbanFlow application with accident and violation detection microservices',
        contact: {
          name: 'UrbanFlow Team',
          email: 'support@urbanflow.com'
        }
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Main Next.js server'
        },
        {
          url: 'http://localhost:5000',
          description: 'Detection Microservices'
        }
      ],
      tags: [
        {
          name: 'User Management',
          description: 'User-related operations (Next.js)'
        },
        {
          name: 'Accident Detection',
          description: 'Accident detection service endpoints'
        },
        {
          name: 'Violation Detection',
          description: 'Traffic violation and license plate detection service endpoints'
        }, 
        {
          name: 'Authentication',
          description: 'Clerk Auth Webhook'
        }
      ],
      paths: {
        // Next.js Main Server Endpoints (port 3000)
        '/api/users': {
          get: {
            tags: ['User Management'],
            summary: 'Get all users',
            operationId: 'getUsers',
            servers: [{ url: 'http://localhost:3000' }],
            responses: {
              '200': {
                description: 'Successful operation',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/User'
                      }
                    }
                  }
                }
              }
            }
          }
        },
  
        // Accident Detection Endpoints
        '/api/accidents/detect': {
          post: {
            tags: ['Accident Detection'],
            summary: 'Detect accidents in video using URL',
            operationId: 'detectAccident',
            servers: [{ url: 'http://localhost:5000' }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      video_url: {
                        type: 'string',
                        description: 'URL of the video to analyze'
                      }
                    },
                    required: ['video_url']
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Accident detection results',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/AccidentDetectionResult'
                    }
                  }
                }
              },
              '400': {
                description: 'Bad request - No video URL provided'
              },
              '500': {
                description: 'Internal server error'
              }
            }
          }
        },
        '/api/accidents/detect_base64': {
          post: {
            tags: ['Accident Detection'],
            summary: 'Detect accidents in video using base64 data',
            operationId: 'detectAccidentBase64',
            servers: [{ url: 'http://localhost:5000' }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      video_base64: {
                        type: 'string',
                        description: 'Base64 encoded video data'
                      }
                    },
                    required: ['video_base64']
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Accident detection results',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/AccidentDetectionResult'
                    }
                  }
                }
              },
              '400': {
                description: 'Bad request - No base64 video provided'
              },
              '500': {
                description: 'Internal server error'
              }
            }
          }
        },
  
        // Violation Detection Endpoints
        '/api/violations/detect': {
          post: {
            tags: ['Violation Detection'],
            summary: 'Detect traffic violations and license plates in image',
            operationId: 'detectViolations',
            servers: [{ url: 'http://localhost:5000' }],
            requestBody: {
              required: true,
              content: {
                'multipart/form-data': {
                  schema: {
                    type: 'object',
                    properties: {
                      image: {
                        type: 'string',
                        format: 'binary',
                        description: 'Image file to analyze'
                      }
                    },
                    required: ['image']
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Violation detection results',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        detections: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/ViolationDetection'
                          }
                        }
                      }
                    }
                  }
                }
              },
              '400': {
                description: 'Bad request - No image file provided or invalid image'
              },
              '500': {
                description: 'Internal server error'
              }
            }
          }
        },
        '/api/violations/detect_video': {
          get: {
            tags: ['Violation Detection'],
            summary: 'Process default video for violation detection',
            operationId: 'detectVideoViolations',
            servers: [{ url: 'http://localhost:5000' }],
            responses: {
              '200': {
                description: 'Video processing results',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        detections: {
                          type: 'array',
                          items: {
                            allOf: [
                              { $ref: '#/components/schemas/ViolationDetection' },
                              {
                                type: 'object',
                                properties: {
                                  frame: {
                                    type: 'integer',
                                    description: 'Frame number in the video'
                                  }
                                }
                              }
                            ]
                          }
                        }
                      }
                    }
                  }
                }
              },
              '404': {
                description: 'Default video file not found'
              },
              '500': {
                description: 'Internal server error'
              }
            }
          }
        },
  
        '/api/violations/health': {
          get: {
            tags: ['Violation Detection'],
            operationId: 'healthCheck/v',
            servers: [{ url: 'http://localhost:5000' }],
            responses: {
              '200': {
                description: 'Health check response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: {
                          type: 'string',
                          enum: ['ok', 'model_not_loaded']
                        },
                        model_info: {
                          type: 'boolean',
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
  
        // Health Check Endpoint
        '/api/health': {
          get: {
            tags: ['Accident Detection'],
            summary: 'Check accident detection service health status',
            operationId: 'healthCheck',
            servers: [{ url: 'http://localhost:5000' }],
            responses: {
              '200': {
                description: 'Health check response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: {
                          type: 'string',
                          enum: ['ok', 'model_not_loaded']
                        },
                        model_info: {
                          type: 'object',
                          properties: {
                            input_shape: { type: 'string' },
                            output_shape: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Clerk User ID'
              },
              username: {
                type: 'string'
              },
              email: {
                type: 'string',
                format: 'email'
              }
            }
          },
          AccidentDetectionResult: {
            type: 'object',
            properties: {
              accident_detected: { type: 'boolean' },
              confidence: { type: 'number' },
              average_confidence: { type: 'number' },
              highest_confidence_frame: { type: 'integer' },
              timestamp_seconds: { type: 'number' },
              video_duration_seconds: { type: 'number' },
              frames_processed: { type: 'integer' },
              total_frames: { type: 'integer' },
              processing_time_seconds: { type: 'number' },
              prediction_stats: {
                type: 'object',
                properties: {
                  min: { type: 'number' },
                  max: { type: 'number' },
                  median: { type: 'number' },
                  num_above_90_percent: { type: 'integer' },
                  num_above_80_percent: { type: 'integer' },
                  num_above_50_percent: { type: 'integer' }
                }
              }
            }
          },
          ViolationDetection: {
            type: 'object',
            properties: {
              bbox: {
                type: 'array',
                items: {
                  type: 'number'
                },
                description: 'Bounding box coordinates [x1, y1, x2, y2]'
              },
              confidence: {
                type: 'number',
                description: 'Detection confidence score'
              },
              class: {
                type: 'string',
                description: 'Vehicle class/type'
              },
              license_plate: {
                type: 'string',
                description: 'Detected license plate text'
              },
              wrong_lane: {
                type: 'boolean',
                description: 'Whether vehicle is in wrong lane'
              }
            }
          }
        },
        securitySchemes: {
          clerkAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
            description: 'Clerk session token. Format: Bearer <token>'
          }
        }
      },
      security: [
        {
          clerkAuth: []
        }
      ]
    }
  };
  
  export default swaggerConfig;