import os
import sys
import types
import uuid
import operator

# Pure-Python fallbacks for Windows Defender Application Control (WDAC)
dummy_uuid_module = types.ModuleType("uuid_utils._uuid_utils")
dummy_uuid_module.__file__ = "_uuid_utils.py"
dummy_uuid_module.MAX = uuid.UUID('ffffffff-ffff-ffff-ffff-ffffffffffff')
dummy_uuid_module.NIL = uuid.UUID('00000000-0000-0000-0000-000000000000')
dummy_uuid_module.NAMESPACE_DNS = uuid.NAMESPACE_DNS
dummy_uuid_module.NAMESPACE_OID = uuid.NAMESPACE_OID
dummy_uuid_module.NAMESPACE_URL = uuid.NAMESPACE_URL
dummy_uuid_module.NAMESPACE_X500 = uuid.NAMESPACE_X500
dummy_uuid_module.RESERVED_FUTURE = "future"
dummy_uuid_module.RESERVED_MICROSOFT = "microsoft"
dummy_uuid_module.RESERVED_NCS = "ncs"
dummy_uuid_module.RFC_4122 = "rfc_4122"
dummy_uuid_module.UUID = uuid.UUID
dummy_uuid_module.__version__ = "0.9.0"
dummy_uuid_module.getnode = uuid.getnode
dummy_uuid_module.uuid1 = uuid.uuid1
dummy_uuid_module.uuid3 = uuid.uuid3
dummy_uuid_module.uuid4 = uuid.uuid4
dummy_uuid_module.uuid5 = uuid.uuid5
dummy_uuid_module.uuid6 = uuid.uuid4
dummy_uuid_module.uuid7 = uuid.uuid4
dummy_uuid_module.uuid8 = uuid.uuid4
dummy_uuid_module.reseed = lambda *args: None
dummy_uuid_module._uuid4_int = lambda *a, **k: uuid.uuid4().int
dummy_uuid_module._uuid7_int = lambda *a, **k: uuid.uuid4().int
sys.modules["uuid_utils._uuid_utils"] = dummy_uuid_module

dummy_cy = types.ModuleType("sqlalchemy.engine._util_cy")
def _distill_params_20(params):
    if params is None: return ()
    if isinstance(params, (list, tuple)): return params
    return [params]
dummy_cy._distill_params_20 = _distill_params_20
dummy_cy._distill_raw_params = _distill_params_20
dummy_cy.tuplegetter = operator.itemgetter
sys.modules["sqlalchemy.engine._util_cy"] = dummy_cy

# Use local sqlite for local dev persistence if MySQL credentials are empty
if not os.environ.get("DATABASE_URL"):
    os.environ["DATABASE_URL"] = "sqlite:///./giftora_dev.db"

import uvicorn
from app.main import app

if __name__ == "__main__":
    print("Starting Giftora FastAPI Server on http://127.0.0.1:8000...")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
