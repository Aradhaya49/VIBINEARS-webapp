from rest_framework.response import Response


def success(data=None, message="Success", status=200):
    return Response({"status": "success", "message": message, "data": data}, status=status)


def error(message="Error", status=400, errors=None):
    payload = {"status": "error", "message": message}
    if errors:
        payload["errors"] = errors
    return Response(payload, status=status)
