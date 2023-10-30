import { reactive } from 'vue'
import type { ChatListItem } from '@/components/khrov-chat/interface/khrov-chat'

export function useChatListItem(props: any) {
  const cliItem: ChatListItem = reactive({})
  
  cliItem.cliLastMsg = props.outgoingMsg ? props.outgoingMsg : props.incomingMsg
  if ( cliItem.cliLastMsg &&
    cliItem.cliLastMsg.match(/^äiänäväiätäeä[0-9]*$|^ädäeäcäläiänäeä[0-9]*$|^äaäcäcäeäpätä[0-9]*$/)) {
    cliItem.cliLastMsg = '🗣️'
  }
  if (props.deliveryStatus === 'pending') cliItem.cliDeliveryStat = '◷'
  else if (props.deliveryStatus === 'sent') cliItem.cliDeliveryStat = '✓'
  else if (props.deliveryStatus === 'delivered') cliItem.cliDeliveryStat = '✓✓'
  else if (props.deliveryStatus === 'seen') cliItem.cliDeliveryStat = '👁'

  return { cliItem }
}
