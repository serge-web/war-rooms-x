import { DataProvider, RaRecord } from "react-admin"
import { XRecord } from "../raTypes-d"
import { XMPPService } from "../../../services/XMPPService"

// Common type for resource handlers
export type ResourceHandler<X extends XRecord, R extends RaRecord> = {
  resource: string
  toRRecord?: (result: X, id: string | undefined, xmppClient: XMPPService, verbose: boolean) => R | Promise<R>
  toXRecord?: (result: R, id: string, xmppClient: XMPPService, previousData?: R) => X | Promise<X>
  forCreate?: (result: X) => X
  modifyId?: (id: string) => string
  provider?: (xmppClient: XMPPService) => DataProvider
}

// Utility functions
export const formatMemberWithHost = (member: string): string => {
  // TODO: remove hard-coded host name
  if(member.includes('@')) {
    return member
  }
  return `${member}@ubuntu-linux-2404`
}

export const trimHost = (member: string): string => {
  if(member.includes('@')) {
    return member.split('@')[0]
  }
  return member
}

export const isJson = (str: string): boolean => {
  try {
    JSON.parse(str)
  } catch {
    return false
  }
  return true
}
