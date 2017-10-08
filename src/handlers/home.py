import webapp2

class Home(webapp2.RequestHandler):
  def get(self):
    self.response.write('Hello world!')
