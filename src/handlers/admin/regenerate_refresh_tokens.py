import datetime
import logging

from src.handlers.oauth import OAuthBaseHandler
from src.models.refresh_token import RefreshToken
from src.models.user import Roles

# Regenerates all refresh tokens daily.  They have a 5 day lifespan.
class RegenerateRefreshTokensHandler(OAuthBaseHandler):
  def get(self):
    for token in RefreshToken.query().iter():
      if token.expiry_time and token.expiry_time < datetime.datetime.now():
        logging.info('Deleting token %s created by %s' % (token.key.id(), token.user.get().name))
        token.key.delete()
      else:
        logging.info('Refreshing token %s created by %s' % (token.key.id(), token.user.get().name))
        self.GetTokenFromRefreshToken(token)

  def RequireAuth(self):
    return True

  def PermittedRoles(self):
    return Roles.AdminRoles()
