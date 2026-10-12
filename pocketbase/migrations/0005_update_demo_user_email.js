/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'alexandre@armodonto.com')
      user.setEmail('alexandre@risomed.com.br')
      user.setVerified(true)
      user.set('name', 'Alexandre Risomed')
      app.save(user)
    } catch (_) {
      // If user with alexandre@armodonto.com doesn't exist, try ensuring alexandre@risomed.com.br exists
      try {
        app.findAuthRecordByEmail('_pb_users_auth_', 'alexandre@risomed.com.br')
      } catch (err) {
        const users = app.findCollectionByNameOrId('_pb_users_auth_')
        const record = new Record(users)
        record.setEmail('alexandre@risomed.com.br')
        record.setPassword('Skip@Pass')
        record.setVerified(true)
        record.set('name', 'Alexandre Risomed')
        app.save(record)
      }
    }
  },
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'alexandre@risomed.com.br')
      user.setEmail('alexandre@armodonto.com')
      app.save(user)
    } catch (_) {}
  },
)
