import datetime
import logging
import urllib

from src import common
from src.handlers.base import BaseHandler
from src.handlers.oauth import OAuthBaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.refresh_token import RefreshToken
from src.models.scheduling.competition import ScheduleCompetition
from src.models.scheduling.person import SchedulePerson
from src.models.scheduling.person import SchedulePersonRoles
from src.models.scheduling.schedule import Schedule

class SchedulingBaseHandler(BaseHandler):
  def RespondWithError(self, error_string):
    template = JINJA_ENVIRONMENT.get_template('error.html')
    logging.error('Responding with error: %s' % error_string)
    self.response.write(template.render({
        'c': common.Common(self),
        'error': error_string,
    }))
    self.response.status = 500

  def SetCompetition(self, competition_id,
                     edit_access_needed=True,
                     login_required=True,
                     fail_if_not_found=True):
    self.competition = ScheduleCompetition.get_by_id(competition_id)
    if not self.competition:
      if fail_if_not_found:
        self.RespondWithError(
            'Unknown competition %s.  Scheduling may not be enabled for this '
            'competition.' % competition_id)
        return False
      else:
        self.competition = ScheduleCompetition(id=competition_id)
        # If we're creating a new competition, then we'll believe that the
        # user doesn't have edit access.  So we pretend that we don't need edit
        # access.  The only way that this can succeed is if the user has access
        # on the WCA page.
        edit_access_needed = False

    if not self.user and login_required:
      self.redirect('/login')
      return False
    elif not self.user:
      self.is_editor = False
      return True

    self.is_editor = True
    person = SchedulePerson.get_by_id(SchedulePerson.Id(competition_id, self.user.key.id()))
    if not person or SchedulePersonRoles.EDITOR not in person.roles:
      self.is_editor = False
      if edit_access_needed:
        self.RespondWithError(
            'You don\'t have access to edit this schedule.')
        return False
    return True

  def SetSchedule(self, schedule_version):
    self.schedule = Schedule.get_by_id(schedule_version)
    if not self.schedule:
      self.RespondWithError(
          'Unknown schedule version %s' % schedule_version)
      return False
    return self.SetCompetition(self.schedule.competition.id())

class SchedulingOAuthBaseHandler(SchedulingBaseHandler, OAuthBaseHandler):
  # SetCompetition or SetSchedule must first be called if we're going to use a
  # refresh token.
  def GetToken(self, handler_data={}):
    self.auth_token = None
    if (self.competition and self.competition.refresh_token and
        self.competition.refresh_token.get()):
      refresh_token = self.competition.refresh_token.get()
      # Set the token to expire two weeks after the competition.  We do this
      # check before GetTokenFromRefreshToken because that method writes the
      # refresh token.
      if not refresh_token.expiry_time and self.competition.wca_competition.get():
        refresh_token.expiry_time = datetime.datetime.combine(
            self.competition.wca_competition.get().end_date,
            datetime.time()) + datetime.timedelta(days=14)
      self.GetTokenFromRefreshToken(refresh_token)
    elif self.request.get('state'):
      # If we don't have a refresh token, or if it's expired, check the URL for
      # a &state parameter.  This indicates that the authentication flow has
      # run.
      self.GetTokenFromCode()
      if self.refresh_token and self.competition:
        refresh_token = RefreshToken(id=self.competition.key.id())
        refresh_token.user = self.user.key
        refresh_token.token = self.refresh_token
        refresh_token.creation_time = datetime.datetime.now()
        refresh_token.scope = 'public email manage_competitions'
        refresh_token.put()
        self.competition.refresh_token = refresh_token.key
        self.competition.put()
    else:
      # We have no token.  Redirect to /authenticate, which triggers the WCA
      # OAuth flow.  When it comes back to this URL, we'll have a token in the
      # state parameter.
      self.redirect('/authenticate?' + urllib.urlencode({
          'scope': 'public email manage_competitions',
          'callback': self.request.url,
          'handler_data': handler_data,
      }))
    return self.auth_token
