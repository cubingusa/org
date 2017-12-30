import webapp2

def AddExtension(extension_name, extension_dict, output_dict):
  if 'extensions' not in output_dict:
    output_dict['extensions'] = []
  extension_container = {}
  extension_container['id'] = 'org.cubingusa.' + extension_name
  extension_container['specUrl'] = (
      webapp2.uri_for('wcif_spec', _full=True) + '#' + extension_name)
  extension_container['data'] = extension_dict
  output_dict['extensions'].append(extension_container)

def GetExtension(extension_name, data_dict):
  if 'extensions' not in data_dict:
    return {}
  for extension in data_dict['extensions']:
    if extension['id'] == 'org.cubingusa.' + extension_name:
      return extension['data']
  return {}
