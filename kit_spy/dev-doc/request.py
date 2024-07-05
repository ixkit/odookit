_request_stack = werkzeug.local.LocalStack()
request = _request_stack()

debug = request and request.session.debug 