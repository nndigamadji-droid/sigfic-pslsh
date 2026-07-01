function loadDatabaseConfig(env = {}) {
  const modulePath = require.resolve('../config/database');
  jest.resetModules();
  delete require.cache[modulePath];

  const originalEnv = {};
  Object.keys(env).forEach((key) => {
    originalEnv[key] = process.env[key];
    if (env[key] === undefined || env[key] === null || env[key] === '') {
      delete process.env[key];
    } else {
      process.env[key] = env[key];
    }
  });
  try {
    return require('../config/database');
  } finally {
    Object.keys(env).forEach((key) => {
      if (originalEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalEnv[key];
      }
    });
  }
}

describe('Configuration base de donnees', () => {
  const instances = [];

  afterEach(async () => {
    while (instances.length) {
      const sequelize = instances.pop();
      await sequelize.close();
    }
  });

  it('utilise SQLite localement quand DATABASE_URL est absent', () => {
    const sequelize = loadDatabaseConfig({
      DATABASE_URL: '',
      DB_DIALECT: '',
      DATABASE_STORAGE_PATH: '',
      NODE_ENV: 'test',
    });
    instances.push(sequelize);

    expect(sequelize.getDialect()).toBe('sqlite');
    expect(sequelize.options.storage).toContain('database');
    expect(sequelize.options.storage).toContain('pslsh.db');
  });

  it('refuse de demarrer en production sans DATABASE_URL persistant', () => {
    expect(() =>
      loadDatabaseConfig({
        DATABASE_URL: '',
        DB_DIALECT: '',
        NODE_ENV: 'production',
        RENDER: 'true',
      })
    ).toThrow(/DATABASE_URL/);
  });

  it('utilise Postgres avec SSL quand DATABASE_URL est present en production', () => {
    const sequelize = loadDatabaseConfig({
      DATABASE_URL: 'postgres://user:pass@example.render.com:5432/pslsh',
      NODE_ENV: 'production',
      RENDER: 'true',
    });
    instances.push(sequelize);

    expect(sequelize.getDialect()).toBe('postgres');
    expect(sequelize.config.database).toBe('pslsh');
    expect(sequelize.options.dialectOptions.ssl.require).toBe(true);
  });

  it('desactive SSL quand DATABASE_SSL=false pour une connexion Postgres interne', () => {
    const sequelize = loadDatabaseConfig({
      DATABASE_URL: 'postgres://user:pass@dpg-render-internal/pslsh',
      NODE_ENV: 'production',
      RENDER: 'true',
      DATABASE_SSL: 'false',
    });
    instances.push(sequelize);

    expect(sequelize.getDialect()).toBe('postgres');
    expect(sequelize.options.dialectOptions).not.toHaveProperty('ssl');
  });
});
