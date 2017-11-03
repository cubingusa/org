import collections
import webapp2

from google.appengine.ext import blobstore
from google.appengine.ext.webapp import blobstore_handlers

from src import common
from src.handlers.base import BaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.document import Document


class DocumentsHandler(BaseHandler):
  def get(self):
    is_admin = self.app.config.get('is_admin')

    template = JINJA_ENVIRONMENT.get_template('documents.html')
    documents_by_section = collections.defaultdict(list)

    for document in Document.query().iter():
      if not document.deletion_time or is_admin:
        documents_by_section[document.section].append(document)

    template_dict = {
        'c': common.Common(self),
        'documents_by_section': documents_by_section,
        'admin_page': is_admin,
        'just_uploaded': self.request.get('uploaded') == '1',
    }

    if is_admin:
      template_dict['upload_url'] = blobstore.create_upload_url(
          webapp2.uri_for('upload_document'))

    self.response.write(template.render(template_dict))

class GetDocumentHandler(blobstore_handlers.BlobstoreDownloadHandler):
  def get(self, document_id, document_name):
    document = Document.get_by_id(document_id)
    if not document or not blobstore.get(document.blob_key):
      self.error(404)
    if not self.app.config.get('is_admin') and document.deletion_time:
      self.error(404)
    else:
      self.send_blob(document.blob_key)
