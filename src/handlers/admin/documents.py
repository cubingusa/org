import collections
import datetime
import logging
import webapp2

from google.appengine.ext import blobstore
from google.appengine.ext.webapp import blobstore_handlers

from src.handlers.admin.admin_base import AdminBaseHandler
from src.models.document import Document
from src.models.user import Roles
from src.models.user import User


class UploadDocumentHandler(blobstore_handlers.BlobstoreUploadHandler):
  def post(self):
    uploader = User.get_by_id(self.request.get('uploader'))
    if not uploader:
      logging.error('no uploader')
      self.error(404)
      return
    for upload in self.get_uploads():
      document = Document()
      document.uploader = uploader.key
      document.upload_time = datetime.datetime.now()
      if self.request.get('section') == '_other':
        document.section = self.request.get('other')
      else:
        document.section = self.request.get('section')
      document.blob_key = upload.key()
      document.original_filename = upload.filename
      document.name = self.request.get('name')
      document.put()
    self.redirect(webapp2.uri_for('documents') + '?success=1')

class DeleteDocumentHandler(AdminBaseHandler):
  def get(self, document_id):
    document = Document.get_by_id(int(document_id))
    if not document:
      logging.error('no document found')
      self.error(404)
      return
    document.deletion_time = datetime.datetime.now()
    document.put()
    self.redirect(webapp2.uri_for('documents') + '?success=1')

  def PermittedRoles(self):
    return Roles.AdminRoles()
    
class RestoreDocumentHandler(AdminBaseHandler):
  def get(self, document_id):
    document = Document.get_by_id(int(document_id))
    if not document:
      logging.error('no document found')
      self.error(404)
      return
    del document.deletion_time
    document.put()
    self.redirect(webapp2.uri_for('documents') + '?success=1')

  def PermittedRoles(self):
    return Roles.AdminRoles()
